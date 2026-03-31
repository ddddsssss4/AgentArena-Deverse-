import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <main className="pt-20 min-h-[calc(100vh-5rem)]">
        <Outlet />
      </main>
    </div>
  );
}
