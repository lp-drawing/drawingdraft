# 墨芽（InkSprout）網頁版

墨芽以 Expo Router 和 React Native 同一份 TypeScript 程式提供 iOS、Android 與瀏覽器介面。桌面瀏覽器顯示工作列側欄與較大的繪圖空間；手機瀏覽器沿用觸控導覽。

## 本機執行

需要 Node.js 與 pnpm。下載或 clone 原始碼後，在專案根目錄安裝相依套件：

```sh
pnpm install
pnpm dev:metro
```

Expo Web 開發伺服器預設使用 `http://localhost:8081`。若只要產生靜態網站：

```sh
pnpm install
pnpm build:web
```

網站檔案輸出到 `dist/`，可由支援靜態網站的主機或 GitHub Pages 部署。`public/manus-routes.json` 列出網站頁面路由。

## GitHub Pages 部署

墨芽程式碼位於 [`lp-drawing/drawingdraft`](https://github.com/lp-drawing/drawingdraft)。GitHub Actions workflow 會在 `main` 有更新時自動建置並部署，也可從儲存庫的 **Actions** 頁手動執行 `Deploy to GitHub Pages`。首次部署完成後，網站網址是 [`https://lp-drawing.github.io/drawingdraft/`](https://lp-drawing.github.io/drawingdraft/)；部署狀態可在 Actions 工作流程查看。

此 repository site 位於 `/drawingdraft/` 子路徑，workflow 會以 `EXPO_BASE_URL=/drawingdraft` 建置。如要在本機重現 GitHub Pages 版本，可執行：

```sh
EXPO_BASE_URL=/drawingdraft pnpm build:web
```

一般本機預覽使用 `pnpm dev:metro`；環境變數未設定時，路由和靜態資源會使用網站根路徑。不要把 `.env` 或私密設定加入公開 repository。原始碼 ZIP 不包含建置產物 `dist/`，可執行 `pnpm build:web` 產生；另有獨立的 Web 靜態輸出 ZIP。

## 作品資料

草圖和版本保存在目前瀏覽器的本機儲存空間，並不會自動同步至另一個瀏覽器、手機或雲端。清理此瀏覽器的網站資料可能移除尚未匯出的作品；重要作品建議定期下載 PNG 或歷程圖卡保存。
