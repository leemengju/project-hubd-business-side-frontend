import { Outlet } from "react-router-dom";
import SideBar from "./Sidebar";
import Heading from "./Heading";

const AppLayout = () => {
  return (
    <section className="w-[1920px] overflow-scroll ">
      <aside>
        <SideBar />
      </aside>
      <section className="flex flex-col gap-[17px]">
        <Heading />
        <main className="w-[1520px] h-[934px]">
          <Outlet />
        </main>
      </section>
    </section>
  );
};

export default AppLayout;
