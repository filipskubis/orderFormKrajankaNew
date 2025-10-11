import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="w-screen h-screen  flex flex-col bg-[#fbe8a6] xl:pl-[15%] xl:pr-[15%] xl:pt-[1%] xl:pb-[1%]">
      <Outlet />
    </div>
  );
}
