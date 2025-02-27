import { Outlet } from "react-router-dom";

const LoginLayout = () => {
  return (
    <div className="max-w-[1920px] h-[1080px] overflow-hidden">
        <Outlet />
    </div>
  );
};

export default LoginLayout;
