import type { PropsWithChildren } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="zh-Hant">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#F6F2EA" />
        <meta
          name="description"
          content="墨芽 InkSprout，為初中學生設計的黑白素描構圖室。從構圖、草圖到明暗與成果，慢慢把觀察變成畫作。"
        />
        <meta property="og:title" content="墨芽｜黑白素描構圖室" />
        <meta
          property="og:description"
          content="為初中學生設計的黑白素描構圖與創作空間。"
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
