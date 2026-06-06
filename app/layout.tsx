import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "班级共建空间",
  description: "记录学习，也收藏我们的日常。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
