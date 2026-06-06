// クリックポスト「まとめ申込」CSV を生成する。
// 公式仕様: ヘッダー必須 / Shift-JIS / 1回40件まで /
// 列= お届け先郵便番号, お届け先氏名, お届け先敬称, お届け先住所1〜4行目, 内容品

import type { PackingOrder } from "./shopify";

const CONTENT = "コーヒー"; // 内容品（全角15文字以内）

// Shopify は都道府県を英語(例: Ōita)で返すことがあるため日本語に変換する。
const PREF: Record<string, string> = {
  hokkaido: "北海道", aomori: "青森県", iwate: "岩手県", miyagi: "宮城県",
  akita: "秋田県", yamagata: "山形県", fukushima: "福島県", ibaraki: "茨城県",
  tochigi: "栃木県", gunma: "群馬県", saitama: "埼玉県", chiba: "千葉県",
  tokyo: "東京都", kanagawa: "神奈川県", niigata: "新潟県", toyama: "富山県",
  ishikawa: "石川県", fukui: "福井県", yamanashi: "山梨県", nagano: "長野県",
  gifu: "岐阜県", shizuoka: "静岡県", aichi: "愛知県", mie: "三重県",
  shiga: "滋賀県", kyoto: "京都府", osaka: "大阪府", hyogo: "兵庫県",
  nara: "奈良県", wakayama: "和歌山県", tottori: "鳥取県", shimane: "島根県",
  okayama: "岡山県", hiroshima: "広島県", yamaguchi: "山口県", tokushima: "徳島県",
  kagawa: "香川県", ehime: "愛媛県", kochi: "高知県", fukuoka: "福岡県",
  saga: "佐賀県", nagasaki: "長崎県", kumamoto: "熊本県", oita: "大分県",
  miyazaki: "宮崎県", kagoshima: "鹿児島県", okinawa: "沖縄県",
};

// 英語の都道府県名（マクロン付きも）を正規化してキー照合する。
function normPref(s: string): string {
  return s
    .replace(/[ōôòóо]/gi, "o")
    .replace(/[ūûùú]/gi, "u")
    .replace(/[āâàá]/gi, "a")
    .replace(/[īîìí]/gi, "i")
    .replace(/[ēêèé]/gi, "e")
    .toLowerCase()
    .replace(/[\s-]/g, "");
}

function toJpProvince(province: string): string {
  if (!province) return "";
  return PREF[normPref(province)] ?? province; // 既に日本語ならそのまま
}

// CP932(Shift-JIS)で化けやすい文字を安全な字に正規化する。
// ・各種ダッシュ(‐–—−など)→ ハイフン  ・マクロン付きローマ字→素の母音
// ・カタカナ長音符ーや全角－(U+FF0D)はCP932にあるのでそのまま
function sanitize(s: string): string {
  return (s || "")
    .replace(/[‐-―−⁃﹣]/g, "-")
    .replace(/[ōôòó]/gi, "o")
    .replace(/[ūûùú]/gi, "u")
    .replace(/[āâàá]/gi, "a")
    .replace(/[īîìí]/gi, "i")
    .replace(/[ēêèé]/gi, "e");
}

const HEADER = [
  "お届け先郵便番号",
  "お届け先氏名",
  "お届け先敬称",
  "お届け先住所1行目",
  "お届け先住所2行目",
  "お届け先住所3行目",
  "お届け先住所4行目",
  "内容品",
];

// 未発送注文 → クリックポストCSVの行（ヘッダー込み）。
export function buildClickPostRows(orders: PackingOrder[]): string[][] {
  const rows: string[][] = [HEADER];
  for (const o of orders) {
    const a = o.address;
    rows.push(
      [
        a.zip,
        a.name,
        a.name ? "様" : "御中",
        `${toJpProvince(a.province)}${a.city}`, // 住所1: 都道府県+市区町村
        a.address1, // 住所2: 番地
        a.address2, // 住所3: 建物・部屋
        "", // 住所4
        CONTENT,
      ].map(sanitize)
    );
  }
  return rows;
}

// 2次元配列をCSV文字列にする（必要な場合のみダブルクオート）。
export function rowsToCSV(rows: string[][]): string {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const v = c ?? "";
          return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        })
        .join(",")
    )
    .join("\r\n");
}
