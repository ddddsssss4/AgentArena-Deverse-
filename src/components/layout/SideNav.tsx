import { useLocation, Link } from "react-router-dom";

export default function SideNav() {
  const location = useLocation();
  const isArena = location.pathname === "/arena";

  const navLinks = [
    { name: "Dashboard", path: "/lobby", icon: "dashboard" },
    { name: "Global Explore", path: "/arena", icon: "public" },
    { name: "My Arenas", path: "#", icon: "grid_view" },
    { name: "Compute", path: "#", icon: "memory" },
  ];

  return (
    <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 flex-col p-6 bg-surface-container-low hidden lg:flex z-40 border-r border-outline-variant/10">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">rocket_launch</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-primary font-headline leading-tight">Playground v2</h3>
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">AI Instance: Active</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-[0.98]"
                  : "text-on-surface-variant hover:bg-white/50 hover:translate-x-1"
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? "text-on-primary" : "group-hover:text-primary"}`}>
                {link.icon}
              </span>
              <span className="text-xs font-semibold font-headline">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 px-2">
        <button className="w-full soul-gradient text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-sm">add</span>
          New Arena
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-outline-variant/20 space-y-1">
        <a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-white/50 rounded-lg transition-colors" href="#">
          <span className="material-symbols-outlined text-sm">help</span>
          <span className="text-xs font-semibold font-headline">Support</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-white/50 rounded-lg transition-colors" href="#">
          <span className="material-symbols-outlined text-sm">chat_bubble</span>
          <span className="text-xs font-semibold font-headline">Feedback</span>
        </a>
      </div>
    </aside>
  );
}
