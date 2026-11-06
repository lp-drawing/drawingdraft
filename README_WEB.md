# 墨芽（InkSprout）網頁版

墨芽以 Expo Router 和 React Native 同一份 TypeScript 程式提供 iOS、Android 與瀏覽器介面。桌面瀏覽器顯示工作列側欄與較大的繪圖空間；手機瀏覽器沿用觸控導覽。

## 公開網站

墨芽網頁版目前已部署至 [https://lp-drawing.github.io/drawingdraft/](https://lp-drawing.github.io/drawingdraft/)。來源是公開 GitHub 儲存庫 [`lp-drawing/drawingdraft`](https://github.com/lp-drawing/drawingdraft)，GitHub Pages 使用 GitHub Actions 發布。

每次 `main` 分支更新會執行 `.github/workflows/deploy-pages.yml`，也可在儲存庫的 **Actions** 頁手動執行 `Deploy to GitHub Pages`。建置輸出為 Expo Web 靜態網站，不需常駐伺服器。

這是位於 `/drawingdraft/` 子路徑的 repository site。正式建置使用 `EXPO_BASE_URL=/drawingdraft`，以確保頁面路由和 JS/CSS 等資產網址正確。如需在本機重現正式版：

```sh
EXPO_BASE_URL=/drawingdraft pnpm build:web
```

## 本機執行與靜態建置

需要 Node.js 與 pnpm。下載或 clone 原始碼後，在專案根目錄安裝相依套件：

```sh
pnpm install
pnpm dev:metro
```

Expo Web 開發伺服器預設使用 `http://localhost:8081`。一般本機 Preview 不設定 `EXPO_BASE_URL`，路由和靜態資源會使用網站根路徑。若只要產生靜態網站：

```sh
pnpm install
pnpm build:web
```

網站檔案輸出到 `dist/`；`public/manus-routes.json` 列出網站頁面路由。原始碼 ZIP 不包含建置產物 `dist/`，可執行 `pnpm build:web` 產生；另有獨立的 Web 靜態輸出 ZIP。

不要把 `.env` 或私密設定加入公開 repository。

## 作品資料

草圖和版本保存在目前瀏覽器的本機儲存空間，並不會自動同步至另一個瀏覽器、手機或雲端。清理此瀏覽器的網站資料可能移除尚未匯出的作品；重要作品建議定期下載 PNG 或歷程圖卡保存。
