# HUBD 快時尚購物平台 — 企業端前端（React）

### 專案簡介
HUBD 快時尚購物平台 — 企業端後台管理系統前端
使用 React 框架建構，支援登入、商品管理、訂單管理等功能。

### 技術架構
- React v19.0.0
- React Router v7.2.0
- Axios：串接 Laravel API
- Tailwind CSS v3.4.17
- Vite：前端建構工具
- shadcn/ui：快速建立 UI 元件

### 專案結構說明
- `main.jsx`：專案進入點
- `App.jsx`：應用核心容器
- `Router.jsx`：集中路由設定
- `layouts/AppLayout.jsx`：基底模板，透過 `Outlet` 使用巢狀路由
- `views/`：每個路由對應一個 `.jsx` 檔

### 初始化與開發指令
```bash
npm install
npm run dev
```

### API 串接與環境變數設定（`.env`）
```env
VITE_API_URL=http://localhost:8000/api
```
