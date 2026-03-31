import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function TopNav() {
  const location = useLocation();
  const { user } = useAuthStore();

  const navLinks = [
    { name: "Dashboard", path: "/lobby" },
    { name: "Global Arena", path: "/arena" },
    { name: "Private Arenas", path: "/my-arenas" },
    { name: "Train Agents", path: "/train" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#faf9fa]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] border-b border-outline-variant/5">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter text-[#595e6b] dark:text-white font-['Space_Grotesk'] font-headline">
          Deverse OS
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path) && link.path !== "/" || (location.pathname === "/" && link.path === "/lobby");
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`font-['Space_Grotesk'] font-headline text-sm tracking-tight transition-colors ${
                  isActive 
                    ? "text-[#595e6b] dark:text-white font-bold border-b-2 border-[#595e6b] pb-1" 
                    : "text-[#4e6169] dark:text-[#a0a0a0] hover:text-[#595e6b] dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
        
        <div className="flex items-center gap-4">
          {!user ? (
            <Link to="/login" className="px-5 py-2 rounded-full border border-outline-variant/30 text-sm font-medium hover:bg-surface-container transition-all text-on-surface">
              Login
            </Link>
          ) : (
            <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant/30 hover:bg-surface-container transition-all">
              <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-[10px]">
                {user.email?.[0].toUpperCase() || "U"}
              </div>
              <span className="text-sm font-semibold max-w-[100px] truncate">{user.email?.split("@")[0]}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
