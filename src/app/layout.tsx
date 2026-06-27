import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alba-Chain | 알바체인 — AI 온톨로지 알바 매니지먼트",
  description:
    "사장님에겐 대충 찍어 올리면 끝, 알바생에겐 캡처 한 장으로 추가 수당까지. VLM 기반 [근로계약–업무–근태–급여] 온톨로지 SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
