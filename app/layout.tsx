import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Providers } from "@/components/Providers"; // ✅ ← 追加

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Training Quest",
  description: "筋肉を鍛えてレベルアップするRPGトレーニングアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white`}
      >
        {/* ✅ SessionProvider を Client Wrapper に移動 */}
        <Providers>
          <Header />
          <main className="pt-12">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
