// Shopify Admin GraphQL API クライアント。
// サーバー側でのみ使用すること（トークンをブラウザに渡さない）。

const API_VERSION = "2026-04";

// この日時より前の注文は全画面で除外する（ストア本格稼働の起点: 2026-06-05 21:00 JST = 12:00 UTC）。
export const DATA_CUTOFF_ISO = "2026-06-05T12:00:00Z";

// 指定した開始日時とカットオフの「遅い方」を Shopify クエリの下限にする。
export function effectiveSince(sinceISO: string): string {
  const since = new Date(sinceISO).getTime();
  const cutoff = new Date(DATA_CUTOFF_ISO).getTime();
  return Number.isFinite(since) && since > cutoff ? sinceISO : DATA_CUTOFF_ISO;
}

// テスト注文など、全画面から除外する注文番号（name）。
const EXCLUDED_ORDER_NAMES = new Set(["#FS1025", "#FS1026"]);
function isExcludedOrder(name: string): boolean {
  return EXCLUDED_ORDER_NAMES.has(name);
}

function endpoint(): string {
  return `https://${storeDomain()}/admin/api/${API_VERSION}/graphql.json`;
}

function storeDomain(): string {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new Error("SHOPIFY_STORE_DOMAIN が未設定です");
  return domain;
}

// 新しい dev dashboard 製アプリ用のトークン取得。
// Client ID / Secret を client_credentials grant でアクセストークンに交換する。
// トークンは24時間で失効するため、メモリにキャッシュして失効60秒前に再取得する。
let cachedToken: { value: string; expiresAt: number } | null = null;

async function fetchClientCredentialsToken(): Promise<string> {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET が未設定です");
  }
  const res = await fetch(`https://${storeDomain()}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`トークン取得に失敗 ${res.status}: ${text}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

async function token(): Promise<string> {
  // 静的トークン（旧方式・任意）が設定されていればそれを使う
  const staticToken = process.env.SHOPIFY_ADMIN_TOKEN;
  if (staticToken) return staticToken;
  // それ以外は client_credentials で取得（キャッシュ優先）
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  return fetchClientCredentialsToken();
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

async function adminGraphQL<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": await token(),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API エラー ${res.status}: ${text}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL エラー: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) throw new Error("Shopify から data が返りませんでした");
  return json.data;
}

// ---- 注文 ----

export type OrderLineItem = {
  title: string;
  variantTitle: string | null;
  quantity: number;
  // 値引き後・税抜きの実売上（このline合計）
  discountedTotal: number;
};

export type Order = {
  id: string;
  createdAt: string;
  // 値引き・送料込みの実支払額（税抜き）
  netSales: number;
  totalSales: number;
  customerId: string | null;
  isFirstOrderForCustomer: boolean;
  lineItems: OrderLineItem[];
};

const ORDERS_QUERY = /* GraphQL */ `
  query Orders($cursor: String, $query: String!) {
    orders(first: 100, after: $cursor, query: $query, sortKey: CREATED_AT) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        createdAt
        currentSubtotalPriceSet {
          shopMoney {
            amount
          }
        }
        currentTotalPriceSet {
          shopMoney {
            amount
          }
        }
        customer {
          id
          numberOfOrders
        }
        lineItems(first: 50) {
          nodes {
            title
            variantTitle
            quantity
            discountedTotalSet {
              shopMoney {
                amount
              }
            }
          }
        }
      }
    }
  }
`;

type RawOrdersData = {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: Array<{
      id: string;
      name: string;
      createdAt: string;
      currentSubtotalPriceSet: { shopMoney: { amount: string } } | null;
      currentTotalPriceSet: { shopMoney: { amount: string } } | null;
      customer: { id: string; numberOfOrders: string } | null;
      lineItems: {
        nodes: Array<{
          title: string;
          variantTitle: string | null;
          quantity: number;
          discountedTotalSet: { shopMoney: { amount: string } } | null;
        }>;
      };
    }>;
  };
};

function num(v: { shopMoney: { amount: string } } | null): number {
  if (!v) return 0;
  const n = Number(v.shopMoney.amount);
  return Number.isFinite(n) ? n : 0;
}

// ---- Instagram 売上寄与（アトリビューション）----
// 注文の customerJourneySummary（最初/最後の接触の source/referrer）を見て、
// instagram 由来の注文・売上を集計する。完全なアトリビューションではない
// （UTM/リファラ未整備の流入は取りこぼす）点に注意。

export type IgAttribution = {
  period: number;
  igOrders: number;
  igSales: number;
  totalOrders: number;
  totalSales: number;
  igOrderShare: number; // %（件数ベース）
  igSalesShare: number; // %（売上ベース）
  note: string;
};

const ATTRIBUTION_QUERY = /* GraphQL */ `
  query AttrOrders($cursor: String, $query: String!) {
    orders(first: 100, after: $cursor, query: $query, sortKey: CREATED_AT) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        name
        currentSubtotalPriceSet { shopMoney { amount } }
        customerJourneySummary {
          firstVisit { source referrerUrl }
          lastVisit { source referrerUrl }
        }
      }
    }
  }
`;

type RawAttrData = {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: Array<{
      id: string;
      name: string;
      currentSubtotalPriceSet: { shopMoney: { amount: string } } | null;
      customerJourneySummary: {
        firstVisit: { source: string | null; referrerUrl: string | null } | null;
        lastVisit: { source: string | null; referrerUrl: string | null } | null;
      } | null;
    }>;
  };
};

function isInstagramTouch(s: string | null, ref: string | null): boolean {
  const hay = `${s ?? ""} ${ref ?? ""}`.toLowerCase();
  return hay.includes("instagram") || hay.includes("l.instagram") || hay.includes("ig.me");
}

export async function fetchIgAttribution(period: number): Promise<IgAttribution> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - period);
  const sinceISO = since.toISOString().slice(0, 10);
  const queryFilter = `created_at:>='${effectiveSince(sinceISO)}' AND test:false`;

  let cursor: string | null = null;
  let igOrders = 0;
  let igSales = 0;
  let totalOrders = 0;
  let totalSales = 0;

  for (let page = 0; page < 50; page++) {
    const data: RawAttrData = await adminGraphQL<RawAttrData>(ATTRIBUTION_QUERY, {
      cursor,
      query: queryFilter,
    });
    for (const node of data.orders.nodes) {
      if (isExcludedOrder(node.name)) continue;
      const sales = num(node.currentSubtotalPriceSet);
      totalOrders += 1;
      totalSales += sales;
      const cj = node.customerJourneySummary;
      const ig =
        isInstagramTouch(cj?.lastVisit?.source ?? null, cj?.lastVisit?.referrerUrl ?? null) ||
        isInstagramTouch(cj?.firstVisit?.source ?? null, cj?.firstVisit?.referrerUrl ?? null);
      if (ig) {
        igOrders += 1;
        igSales += sales;
      }
    }
    if (!data.orders.pageInfo.hasNextPage) break;
    cursor = data.orders.pageInfo.endCursor;
  }

  return {
    period,
    igOrders,
    igSales,
    totalOrders,
    totalSales,
    igOrderShare: totalOrders > 0 ? (igOrders / totalOrders) * 100 : 0,
    igSalesShare: totalSales > 0 ? (igSales / totalSales) * 100 : 0,
    note: "Instagram をリファラ/流入元に含む注文を集計（簡易アトリビューション・取りこぼしあり）",
  };
}

// 指定した開始日（ISO文字列）以降の注文をページネーションで全取得する。
// カットオフ（DATA_CUTOFF_ISO）より前は常に除外する。
export async function fetchOrders(sinceISO: string): Promise<Order[]> {
  const queryFilter = `created_at:>='${effectiveSince(sinceISO)}' AND test:false`;
  const orders: Order[] = [];
  let cursor: string | null = null;
  // 暴走防止の上限（100件 × 50ページ = 5000件）
  for (let page = 0; page < 50; page++) {
    const data: RawOrdersData = await adminGraphQL<RawOrdersData>(ORDERS_QUERY, {
      cursor,
      query: queryFilter,
    });
    for (const node of data.orders.nodes) {
      if (isExcludedOrder(node.name)) continue;
      orders.push({
        id: node.id,
        createdAt: node.createdAt,
        netSales: num(node.currentSubtotalPriceSet),
        totalSales: num(node.currentTotalPriceSet),
        customerId: node.customer?.id ?? null,
        // numberOfOrders は累計注文数。1ならこの顧客の初回注文とみなす。
        isFirstOrderForCustomer: node.customer?.numberOfOrders === "1",
        lineItems: node.lineItems.nodes.map((li) => ({
          title: li.title,
          variantTitle: li.variantTitle,
          quantity: li.quantity,
          discountedTotal: num(li.discountedTotalSet),
        })),
      });
    }
    if (!data.orders.pageInfo.hasNextPage) break;
    cursor = data.orders.pageInfo.endCursor;
  }
  return orders;
}

// ---- 梱包（フルフィルメント）----

export type PackingLineItem = {
  title: string;
  variantTitle: string | null; // 挽き目・重量などのオプション
  quantity: number;
};

export type ShipAddress = {
  name: string;
  zip: string;
  province: string; // 都道府県
  city: string;
  address1: string;
  address2: string;
  phone: string;
};

export type PackingOrder = {
  id: string;
  name: string; // #FS1043 など
  createdAt: string;
  customerName: string;
  fulfilled: boolean; // true=発送済み, false=未発送（要梱包）
  fulfillmentStatus: string;
  address: ShipAddress; // 発送ラベル用
  lineItems: PackingLineItem[];
};

const PACKING_QUERY = /* GraphQL */ `
  query Packing($cursor: String, $query: String!) {
    orders(first: 100, after: $cursor, query: $query, sortKey: CREATED_AT) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        name
        createdAt
        displayFulfillmentStatus
        customer { displayName }
        shippingAddress {
          name
          zip
          province
          city
          address1
          address2
          phone
        }
        lineItems(first: 50) {
          nodes { title variantTitle quantity }
        }
      }
    }
  }
`;

type RawShippingAddress = {
  name: string | null;
  zip: string | null;
  province: string | null;
  city: string | null;
  address1: string | null;
  address2: string | null;
  phone: string | null;
};

type RawPackingData = {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: Array<{
      id: string;
      name: string;
      createdAt: string;
      displayFulfillmentStatus: string;
      customer: { displayName: string | null } | null;
      shippingAddress: RawShippingAddress | null;
      lineItems: { nodes: Array<{ title: string; variantTitle: string | null; quantity: number }> };
    }>;
  };
};

// カットオフ以降の注文を梱包用に取得する（発送済み・未発送の両方）。
export async function fetchPackingOrders(): Promise<PackingOrder[]> {
  const queryFilter = `created_at:>='${DATA_CUTOFF_ISO}' AND test:false`;
  const orders: PackingOrder[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 50; page++) {
    const data: RawPackingData = await adminGraphQL<RawPackingData>(PACKING_QUERY, {
      cursor,
      query: queryFilter,
    });
    for (const node of data.orders.nodes) {
      if (isExcludedOrder(node.name)) continue;
      const sa = node.shippingAddress;
      orders.push({
        id: node.id,
        name: node.name,
        createdAt: node.createdAt,
        customerName: sa?.name || node.customer?.displayName || "（名前なし）",
        fulfilled: node.displayFulfillmentStatus === "FULFILLED",
        fulfillmentStatus: node.displayFulfillmentStatus,
        address: {
          name: sa?.name ?? "",
          zip: sa?.zip ?? "",
          province: sa?.province ?? "",
          city: sa?.city ?? "",
          address1: sa?.address1 ?? "",
          address2: sa?.address2 ?? "",
          phone: sa?.phone ?? "",
        },
        lineItems: node.lineItems.nodes.map((li) => ({
          title: li.title,
          variantTitle: li.variantTitle,
          quantity: li.quantity,
        })),
      });
    }
    if (!data.orders.pageInfo.hasNextPage) break;
    cursor = data.orders.pageInfo.endCursor;
  }
  return orders;
}
