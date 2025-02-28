import { Outlet } from "react-router-dom";

const LoginLayout = () => {
  return (
    <div className="font-lexend w-[1920px] h-[1080px]">
        <Outlet />
    </div>
  );
};

export default LoginLayout;
