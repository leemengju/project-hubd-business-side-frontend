import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "../layouts/AppLayout";
import LoginLayout from "../layouts/LoginLayout";

// Code Splitting，減少JS初次載入大小
const Member = lazy(() => import("../views/Member"));
const Home = lazy(() => import("../views/Home"));
const ProdsAndStore = lazy(() => import("../views/ProdsAndStore"));
const CashFlow = lazy(() => import("../views/CashFlow"));
const Marketing = lazy(() => import("../views/Marketing"));
const Order = lazy(() => import("../views/Order"));
const Setting = lazy(() => import("../views/Setting"));
const Login = lazy(() => import("../views/auth/Login"));
// const Register = lazy(() => import("../views/auth/Register"));

// Loading 畫面（避免白屏）
const Loading = () => <div>Loading...</div>;

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* 這是有 sidebar 的基底模板 */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="prods-and-store" element={<ProdsAndStore />} />
            <Route path="cash-flow" element={<CashFlow />} />
            <Route path="member" element={<Member />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="order" element={<Order />} />
            <Route path="setting" element={<Setting />} />
          </Route>

          {/* 這是 登入／註冊 頁們的基底模板 */}
          <Route path="login" element={<LoginLayout />}>
            <Route index element={<Login />} />
            {/* <Route path="register" element={<Register />} /> */}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;