import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2d1b4e",
};

export const metadata: Metadata = {
  title: "2026开运美甲",
  description: "基于八字喜用神与流年月运的个性化美甲色彩推荐",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${noto.variable} ${notoSerif.variable}`}>
      <body className="min-h-screen text-stone-800 font-sans antialiased safe-area-padding">
        {children}
      </body>
    </html>
  );
}
