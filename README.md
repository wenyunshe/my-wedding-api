# My Wedding API

一個用於連接前端網頁和 Google Sheets 的 Node.js Express API，專為婚禮網站設計，可部署到 Vercel。

## 功能特色

- 🔌 REST API 接口，用於寫入和讀取 Google Sheets 數據
- 🚀 支援 Vercel 部署
- 🔒 使用 Google Service Account 進行安全認證
- 📝 支援多種數據格式（物件、陣列、字串）
- ✅ 包含錯誤處理和驗證
- 🌐 支援 CORS 跨域請求

## API 端點

### 健康檢查
```
GET /
```
回傳 API 狀態和時間戳記。

### 寫入數據到 Google Sheets
```
POST /api/submit
```

請求主體：
```json
{
  "data": ["姓名", "Email", "留言"],  // 可以是陣列、物件或字串
  "sheetId": "你的Google表格ID",
  "range": "Sheet1!A:C"  // 可選，預設為 "Sheet1!A:Z"
}
```

### 從 Google Sheets 讀取數據
```
GET /api/read/:sheetId?range=Sheet1!A:C
```

## 設定步驟

### 1. Google Cloud 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google Sheets API
4. 建立服務帳戶：
   - 前往「IAM 和管理」>「服務帳戶」
   - 點擊「建立服務帳戶」
   - 填寫服務帳戶名稱和描述
   - 授予「編輯者」角色
5. 為服務帳戶建立金鑰：
   - 點擊建立的服務帳戶
   - 前往「金鑰」標籤
   - 點擊「新增金鑰」>「建立新金鑰」
   - 選擇 JSON 格式並下載

### 2. Google Sheets 設定

1. 建立或開啟你的 Google Sheets
2. 複製 URL 中的表格 ID（在 `/spreadsheets/d/` 和 `/edit` 之間的部分）
3. 點擊「共用」按鈕
4. 將服務帳戶的電子郵件地址新增為編輯者

### 3. 本地開發設定

1. 複製專案：
```bash
git clone <your-repo-url>
cd my-wedding-api
```

2. 安裝依賴項：
```bash
npm install
```

3. 設定環境變數：
```bash
cp .env.example .env
```

4. 編輯 `.env` 檔案，填入你的 Google Service Account 憑證

5. 啟動開發伺服器：
```bash
npm run dev
```

### 4. Vercel 部署

1. 安裝 Vercel CLI：
```bash
npm i -g vercel
```

2. 登入 Vercel：
```bash
vercel login
```

3. 部署：
```bash
vercel
```

4. 在 Vercel 控制面板中設定環境變數：
   - 前往你的專案設定
   - 點擊「Environment Variables」
   - 添加所有 `.env.example` 中列出的變數

## 使用範例

### 前端 JavaScript 範例

```javascript
// 提交表單數據到 Google Sheets
async function submitToSheet(formData) {
  try {
    const response = await fetch('https://your-api.vercel.app/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [formData.name, formData.email, formData.message],
        sheetId: 'your-sheet-id-here'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('數據已成功提交！');
    } else {
      console.error('提交失敗：', result.error);
    }
  } catch (error) {
    console.error('網路錯誤：', error);
  }
}

// 讀取 Google Sheets 數據
async function readFromSheet() {
  try {
    const response = await fetch('https://your-api.vercel.app/api/read/your-sheet-id');
    const result = await response.json();
    
    if (result.success) {
      console.log('讀取的數據：', result.data);
    }
  } catch (error) {
    console.error('讀取失敗：', error);
  }
}
```

## 環境變數

| 變數名稱 | 描述 | 必需 |
|---------|------|------|
| `GOOGLE_PROJECT_ID` | Google Cloud 專案 ID | 是 |
| `GOOGLE_PRIVATE_KEY_ID` | 服務帳戶私鑰 ID | 是 |
| `GOOGLE_PRIVATE_KEY` | 服務帳戶私鑰 | 是 |
| `GOOGLE_CLIENT_EMAIL` | 服務帳戶電子郵件 | 是 |
| `GOOGLE_CLIENT_ID` | 服務帳戶客戶端 ID | 是 |
| `GOOGLE_CLIENT_CERT_URL` | 服務帳戶憑證 URL | 是 |
| `PORT` | 伺服器連接埠（本地開發用） | 否 |

## 技術堆疊

- **Node.js** - JavaScript 執行環境
- **Express.js** - Web 應用程式框架
- **Google APIs** - Google Sheets API 客戶端
- **CORS** - 跨域資源共用中介軟體
- **dotenv** - 環境變數載入器
- **Vercel** - 部署平台

## 授權條款

ISC