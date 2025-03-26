import axios from "axios";

const API_URL = "http://localhost:8000/api"; // Laravel 本地端網址

// 建立 Axios 實例
const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  // 請求超時時間 (毫秒)
  timeout: 10000,
  // 跨域請求是否需要憑證
  withCredentials: true,
});

// 請求攔截器
apiService.interceptors.request.use(
  (config) => {
    // 從本地儲存獲取 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, 
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 處理 401 未授權錯誤 (可選：重新整理 token)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 只有在特定需要認證的API才處理認證問題，對於其他API，我們允許繼續
      if (originalRequest.url.includes('/auth/') || 
          originalRequest.url.includes('/user/') || 
          originalRequest.url.includes('/admin/')) {
        try {
          // 這裡可以實作 token 刷新邏輯
          console.warn("授權已過期，嘗試刷新...");
          // const refreshResponse = await apiService.post("/auth/refresh");
          // localStorage.setItem("authToken", refreshResponse.data.token);
          // originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
          // return axios(originalRequest);
        } catch (refreshError) {
          // 重新整理 token 失敗，導向登入頁
          console.error("授權已過期，請重新登入");
          localStorage.removeItem("authToken");
          // 對於關鍵操作才需要跳轉登入頁
          // window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
      // 對於非關鍵API，我們允許401錯誤繼續傳遞，不中斷用戶體驗
      console.warn("API需要認證，但繼續顯示可用資料");
    }

    // 處理 API 回傳的具體錯誤訊息
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        console.error(`API 錯誤: ${error.response.data.message}`);
      }
      if (error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(", ");
        console.error(`驗證錯誤: ${errorMessages}`);
      }
    } else if (error.request) {
      // 請求已發送但沒有收到響應
      console.error("無法連接到伺服器，請檢查網路連接");
    } else {
      // 請求設置出錯
      console.error(`請求錯誤: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

// API 方法封裝
const apiServiceMethods = {
  // GET 請求
  get: async (url, params = {}) => {
    try {
      // 檢查參數格式
      let options = params;
      
      // 如果傳入的是帶有 params 屬性的物件，直接使用
      if (params.params || params.headers || params.data) {
        options = params;
      } else {
        // 否則，將參數包裝為 params 屬性
        options = { params };
      }
      
      console.log("API GET 請求:", url, options);
      const response = await apiService.get(url, options);
      return response;
    } catch (error) {
      console.error(`API GET 錯誤 [${url}]:`, error);
      throw error;
    }
  },

  // POST 請求
  post: async (url, data = {}) => {
    try {
      const response = await apiService.post(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // PUT 請求
  put: async (url, data = {}) => {
    try {
      const response = await apiService.put(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE 請求
  delete: async (url) => {
    try {
      const response = await apiService.delete(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 原始 axios 實例 (用於特殊需求)
  axios: apiService
};

export default apiServiceMethods;
