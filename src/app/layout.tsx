import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jayden Map",
  description: "장소를 담으면 동선·소요시간·예산이 자동으로 계산되는 데이트 코스 플래너",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
