import { Outlet } from "react-router-dom";
import SideBar from "./Sidebar";
import Heading from "./Heading";

const AppLayout = () => {
  return (
    <section className="font-lexend w-[1920px] h-[1080px] flex justify-center items-center p-5">
        <SideBar />
      <section className="w-[1520px] h-[1040px] flex flex-col flex-1 px-5">
        <Heading />
        <main className="w-full h-[937px] px-5">
          <Outlet />
        </main>
      </section>
    </section>
  );
};

export default AppLayout;
