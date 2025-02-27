import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import LoginLayout from "../layouts/LoginLayout"
import Member from "../views/Member";
import Home from "../views/Home";
import ProdsAndStore from "../views/ProdsAndStore";
import CashFlow from "../views/CashFlow";
import Marketing from "../views/Marketing";
import Order from "../views/Order";
import Setting from "../views/Setting";
import Login from "../views/auth/Login"
// 新增 import
// ex: import Register from "../views/auth/Register"


// 這支檔案負責管理所有的前端路由
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 這是有 sidebar 的基底模板 */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />}></Route>
          <Route path="prods-and-store" element={<ProdsAndStore />}></Route>
          <Route path="cash-flow" element={<CashFlow />}></Route>
          <Route path="member" element={<Member />}></Route>
          <Route path="marketing" element={<Marketing />}></Route>
          <Route path="order" element={<Order />}></Route>
          <Route path="setting" element={<Setting />}></Route>
        </Route>

        {/* 這是 登入／註冊 頁們的基底模板 */}
        <Route path="login" element={LoginLayout}>
          {/* Leo 要在這邊新增註冊、忘記密碼等等路由 */}
          <Route index element={<Login />}></Route>
          {/* ex: <Route path="register" element={<Rieister />}></Route> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
