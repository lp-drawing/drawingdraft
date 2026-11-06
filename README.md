# 墨芽（InkSprout）

為初中學生設計的黑白素描構圖與創作工作室。可從構圖、草圖、明暗一路整理到成果，保存草圖版本，並匯出作品或創作歷程圖卡。

**網頁版：** [https://lp-drawing.github.io/drawingdraft/](https://lp-drawing.github.io/drawingdraft/)

專案以 Expo、React Native、TypeScript 和 Expo Router 開發；同一份程式碼支援 iOS、Android 及桌面／行動瀏覽器。桌面版採品牌側欄與雙欄繪圖工作室，窄螢幕保留觸控導覽。

作品資料保存在目前裝置或瀏覽器本機，不會自動同步到其他裝置或雲端。網頁版預覽、靜態建置與 GitHub Pages 子路徑設定請見 [`README_WEB.md`](README_WEB.md)。

GitHub Pages 由 `.github/workflows/deploy-pages.yml` 自動部署：更新 `main` 會建置及發布，也可在 GitHub Actions 手動執行 `Deploy to GitHub Pages`。
