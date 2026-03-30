/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import Arena from "./pages/Arena";
import ArenaStage from "./pages/ArenaStage";
import Profile from "./pages/Profile";
import ChatHistory from "./pages/ChatHistory";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="arena/live" element={<ArenaStage />} />
        <Route element={<MainLayout />}>
          <Route path="lobby" element={<Lobby />} />
          <Route path="arena" element={<Arena />} />
          <Route path="profile" element={<Profile />} />
          <Route path="history" element={<ChatHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
