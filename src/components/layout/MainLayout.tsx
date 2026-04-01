import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";
import SideNav from "./SideNav";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <SideNav />
      <main className="pt-20 lg:ml-72 min-h-[calc(100vh-5rem)]">
        <Outlet />
      </main>
    </div>
  );
}
