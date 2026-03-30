import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Arena() {
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem("deverse_token");
      const res = await fetch("/api/arenas/create", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json() as { code?: string; error?: string };
      if (!res.ok || !data.code) throw new Error(data.error || "Failed to create arena");
      navigate(`/arena/live?room=${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create arena");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    const code = joinCode.trim();
    if (code.length < 4) {
      setError("Please enter a valid join code (min 4 characters)");
      return;
    }
    setIsJoining(true);
    setError(null);
    try {
      const res = await fetch("/api/arenas/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json() as { code?: string; error?: string };
      if (!res.ok || !data.code) throw new Error(data.error || "Invalid join code");
      navigate(`/arena/live?room=${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join arena");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-16 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase tracking-tighter mb-4">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Nexus Access Granted
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold font-headline text-on-surface tracking-tight mb-4">
          Choose Your <span className="text-primary italic">Battleground.</span>
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl font-body leading-relaxed">
          Step into the global collaborative matrix with AI NPCs, or forge a private sector for your team.
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Global Arena Card */}
        <div className="lg:col-span-7 group">
          <div className="isometric-card relative rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/20 shadow-2xl transition-all duration-500">
            <div className="h-72 relative">
              <img
                alt="Global Arena 3D Space"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6i21IbUSLULQBSJqsrtebdiKvN0VyKARpoKCm0F384bgUPVTsnJW0LdLVnpOhHg_RfEb9f-Qizl1gFBP33DTalAE7s1BNOVts_Nz1ts4xn7kuz3sWFEazwnRPbMFo1lePe1BlV9qnU5zS-RoOQ-xm9YwRVdcx12UPEtD7puUMbIfwyNX629m_197B_hWwDsFxgpFjCVlFny9NSdC9Zz5SuNSYjhrLAB13UZZ1jzjN3jfGm6ZfAlhlMDt6K9BAzcMf6miwgkUIONPS"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  AI NPCs Online
                </span>
                <span className="px-3 py-1 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  Open to All
                </span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold font-headline mb-2">The Global Arena</h2>
                  <p className="text-on-surface-variant text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
                    Aria · Kai · Nova — AI Developers awaiting you
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">public</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[["NPCs", "3", "text-violet-600"], ["Mode", "Voice", "text-primary"], ["Access", "Open", "text-emerald-600"]].map(([label, val, cls]) => (
                  <div key={label} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 text-center">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">{label}</p>
                    <p className={`font-headline font-bold text-lg ${cls}`}>{val}</p>
                  </div>
                ))}
              </div>
              <Link to="/arena/live">
                <button className="w-full py-4 soul-gradient text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]">
                  Enter the Global Matrix
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Private Arena */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="rounded-2xl bg-surface-container-low p-8 border border-outline-variant/20 relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-tertiary-fixed opacity-20 rounded-full blur-3xl group-hover:opacity-40 transition-opacity" />
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-headline">Private Arenas</h3>
                <p className="text-xs text-on-surface-variant">No NPCs · Team-only · Code access</p>
              </div>
            </div>
            <div className="space-y-6">
              {/* Join */}
              <div className="p-1 bg-surface-container-lowest rounded-xl border border-outline-variant/30 focus-within:ring-2 ring-primary/20 transition-all">
                <div className="flex items-center px-4">
                  <span className="material-symbols-outlined text-on-surface-variant mr-3">key</span>
                  <input
                    className="w-full py-3 bg-transparent border-none focus:ring-0 text-sm font-medium outline-none text-on-surface uppercase tracking-widest"
                    placeholder="Enter Join Code…"
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    maxLength={10}
                  />
                  <button
                    onClick={handleJoin}
                    disabled={isJoining || joinCode.length < 4}
                    className="bg-primary hover:bg-primary-container text-white hover:text-primary px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {isJoining ? "…" : "JOIN"}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-outline-variant/30" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">OR</span>
                <div className="h-[1px] flex-1 bg-outline-variant/30" />
              </div>

              {/* Create */}
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full flex items-center justify-between p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:border-primary/50 hover:bg-white transition-all group/btn shadow-sm disabled:opacity-60"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                    <span className="material-symbols-outlined">add_box</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold font-headline text-on-surface">
                      {isCreating ? "Initializing…" : "Initialize New Arena"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">Generate a unique room code</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col gap-3">
              <span className="material-symbols-outlined text-primary-fixed">terminal</span>
              <span className="text-xs font-bold leading-tight">No NPCs in Private Rooms</span>
            </div>
            <div className="p-4 rounded-xl bg-primary-fixed text-primary flex flex-col gap-3">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span className="text-xs font-bold leading-tight">AI NPCs Active in Global</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
