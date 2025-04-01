import { Outlet } from "react-router-dom";
import SideBar from "./Sidebar";
import Heading from "./Heading";

const AppLayout = () => {
  return (
    <section className="font-lexend w-[1920px] ml-1 h-[1040px] flex  justify-center items-start p-5 ">
        <SideBar />
      <section className=" w-[1520px] h-[1000px] flex flex-col flex-1 px-5">
        <Heading />
        <main className="overflow-auto w-full h-[930px] px-5">
          <Outlet />
        </main>
      </section>
    </section>
  );
};

export default AppLayout;
