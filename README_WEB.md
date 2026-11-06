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

## 上傳到 GitHub

將專案原始碼新增至自己的 GitHub repository；不要上傳 `.env` 或其他私密設定。GitHub Pages 的發布方式取決於 repository 網址：`<帳號>.github.io` 可使用根路徑，`<帳號>.github.io/<repository>/` 則是子路徑。子路徑需要依 repository 名稱設定 Expo Web base path，再建置靜態輸出；此專案尚未收到 repository 名稱，故未硬編碼子路徑或加入只適用於單一倉庫的部署工作流程。

原始碼 ZIP 不包含由建置產生的 `dist/`；執行 `pnpm build:web` 即可在專案根目錄產生。此次另提供獨立的 Web 靜態輸出 ZIP。這些檔案可供你自行加入 GitHub 或靜態主機；我不會代替你建立 GitHub repository、推送程式碼或發佈網站。

## 作品資料

草圖和版本保存在目前瀏覽器的本機儲存空間，並不會自動同步至另一個瀏覽器、手機或雲端。清理此瀏覽器的網站資料可能移除尚未匯出的作品；重要作品建議定期下載 PNG 或歷程圖卡保存。
