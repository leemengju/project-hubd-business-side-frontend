import api from "./api";

// 註冊新用戶
export const register = async (userData) => {
  const response = await api.post("/register", userData);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

// 登入
export const login = async (credentials) => {
  const response = await api.post("/login", credentials);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

// 取得當前用戶資訊
export const getUser = async () => {
  const response = await api.get("/user");
  return response.data;
};

// 登出
export const logout = async () => {
  await api.post("/logout");
  localStorage.removeItem("token");
};
