import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import Profile from "./pages/Profile";
import Arena from "./pages/Arena";
import ArenaStage from "./pages/ArenaStage";
import ChatHistory from "./pages/ChatHistory";
import TrainNPC from "./pages/TrainNPC";
import MyArenas from "./pages/MyArenas";
import { useAuthStore } from "./store/authStore";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, isLoading } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm font-medium">Loading Arena…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { fetchUser } = useAuthStore();

  // Hydrate user on app mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/lobby" replace />} />
          <Route path="lobby" element={<Lobby />} />
          <Route path="profile" element={<Profile />} />
          <Route path="arena" element={<Arena />} />
          <Route path="arena/live" element={<ArenaStage />} />
          <Route path="my-arenas" element={<MyArenas />} />
          <Route path="history" element={<ChatHistory />} />
          <Route path="train" element={<TrainNPC />} />
        </Route>
        <Route path="*" element={<Navigate to="/lobby" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
