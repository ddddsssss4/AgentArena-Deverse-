import { Link } from "react-router-dom";

export default function Arena() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <header className="text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase tracking-tighter mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Public Sector: Open
        </div>
        <h1 className="text-5xl md:text-6xl font-black font-headline text-on-surface tracking-tight mb-4">
          Global <span className="text-primary italic">Atrium.</span>
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl font-body leading-relaxed">
          Step into the persistent 3D playground. Meet AI developers, collaborate in real-time, and explore the future of spatial workspaces.
        </p>
      </header>

      <div className="group">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-surface-container-lowest border border-outline-variant/10 shadow-2xl transition-all duration-700 hover:shadow-primary/10">
          <div className="h-[400px] relative">
            <img
              alt="Global Arena 3D Space"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6i21IbUSLULQBSJqsrtebdiKvN0VyKARpoKCm0F384bgUPVTsnJW0LdLVnpOhHg_RfEb9f-Qizl1gFBP33DTalAE7s1BNOVts_Nz1ts4xn7kuz3sWFEazwnRPbMFo1lePe1BlV9qnU5zS-RoOQ-xm9YwRVdcx12UPEtD7puUMbIfwyNX629m_197B_hWwDsFxgpFjCVlFny9NSdC9Zz5SuNSYjhrLAB13UZZ1jzjN3jfGm6ZfAlhlMDt6K9BAzcMf6miwgkUIONPS"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
            <div className="absolute top-8 left-8 flex gap-3">
              <span className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                Staff Online
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                24/7 Access
              </span>
            </div>
          </div>

          <div className="p-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-4xl font-black font-headline mb-3">Entrance to Atrium</h2>
                <p className="text-on-surface-variant text-base flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                  Aria, Kai, and Nova are waiting in the public square.
                </p>
              </div>
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary-fixed flex items-center justify-center text-primary shadow-inner">
                <span className="material-symbols-outlined text-4xl">public</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-10">
              {[["AI Agents", "3 Full-time", "text-violet-600"], ["Interaction", "Proximity Voice", "text-primary"], ["Server", "Edge Runtime", "text-emerald-600"]].map(([label, val, cls]) => (
                <div key={label} className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                  <p className="text-[10px] text-on-surface-variant uppercase font-black mb-1.5 tracking-widest">{label}</p>
                  <p className={`font-headline font-black text-xl ${cls}`}>{val}</p>
                </div>
              ))}
            </div>

            <Link to="/arena/live">
              <button className="w-full py-5 soul-gradient text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                Jump Into the Matrix
                <span className="material-symbols-outlined text-3xl">play_arrow</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/my-arenas" className="flex items-center justify-between p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10 hover:bg-white hover:border-primary/30 transition-all group shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">shield</span>
            </div>
            <div>
              <p className="font-black font-headline text-on-surface">Private Session</p>
              <p className="text-xs text-on-surface-variant">Initialize a secure 3D vault</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-all">chevron_right</span>
        </Link>

        <Link to="/train" className="flex items-center justify-between p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10 hover:bg-white hover:border-secondary/30 transition-all group shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <p className="font-black font-headline text-on-surface">Agent Brain Training</p>
              <p className="text-xs text-on-surface-variant">Feed your company secrets to AI</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:text-orange-500 transition-all">chevron_right</span>
        </Link>
      </div>
    </div>
  );
}
