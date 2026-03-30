import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

export default function TopNav() {
  const location = useLocation();

  const navLinks = [
    { name: "Lobby", path: "/lobby" },
    { name: "Arenas", path: "/arena" },
    { name: "Collaborators", path: "#" },
    { name: "Models", path: "#" },
    { name: "Docs", path: "#" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-surface/95 backdrop-blur-3xl border-b border-outline-variant/10">
      <div className="flex items-center gap-12">
        <span className="text-2xl font-black tracking-tight text-on-surface font-headline">
          DevStudio AI
        </span>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "font-headline tracking-tight font-bold text-lg transition-transform hover:scale-105",
                  isActive
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center bg-surface-container-low rounded-full px-4 py-1.5 gap-2 border border-outline-variant/10">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
          <input
            type="text"
            placeholder="Quick search..."
            className="bg-transparent border-none focus:ring-0 text-sm w-48 font-label outline-none"
          />
        </div>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <Link to="/profile" className="h-10 w-10 rounded-full overflow-hidden bg-surface-container-highest border-2 border-primary-container">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu7w7RuwoVk_l4zwSuU6oRf33z9hiFzs7r1uQY328ROPkKRJuWv2qjRpDvlHVWTEtZFebuGi-shCwuxySYJVJAiCFikGJRoqbwnBzYyM8qm93GIKOFmnyRDeCm5u1EVLmUpWAYdmQLiwEmwYMpDDBneO69dcOVm3NhpLaExtbxU8hH0ii5_vJ4X_EesVnUS8isdesMV-6NlmIzOLV0LFohhPTxFT5dJfe4F8Xz7G0pDNws1outyhSR5mYtxDIJ2HLgvrcbCQXUYgZt"
            alt="User profile"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </Link>
        <button className="soul-gradient text-white px-5 py-2 rounded-lg font-semibold text-sm hover:opacity-90 active:scale-95 transition-all">
          Deploy
        </button>
      </div>
    </nav>
  );
}
