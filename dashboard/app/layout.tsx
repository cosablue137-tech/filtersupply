import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Filter Supply 売上ダッシュボード",
  description: "Filter Supply の売上をリアルタイムで確認",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
