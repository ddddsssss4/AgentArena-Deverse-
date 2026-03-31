import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyArenas() {
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [bringNpcs, setBringNpcs] = useState(false);
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
      navigate(`/arena/live?room=${data.code}&private=true${bringNpcs ? "&npcs=true" : ""}`);
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
      navigate(`/arena/live?room=${data.code}&private=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join arena");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-black font-headline text-on-surface tracking-tight mb-4">
          My Private <span className="text-primary italic">Sessions</span>.
        </h1>
        <p className="text-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
          Initialize a new persistent space for your team or join a pre-existing arena via code.
        </p>
      </header>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* Create Arena */}
        <div className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">add_box</span>
            </div>
            <h3 className="text-2xl font-black font-headline mb-3 text-on-surface">New Session</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              Generate a unique private environment for collaboration. You will be the owner and can invite others with the unique room code.
            </p>
          </div>

          <div className="space-y-6">
            <label className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-outline-variant/20 cursor-pointer hover:bg-white transition-all shadow-sm">
              <input 
                type="checkbox" 
                checked={bringNpcs} 
                onChange={(e) => setBringNpcs(e.target.checked)}
                className="w-5 h-5 rounded text-primary focus:ring-primary border-outline-variant"
              />
              <div>
                <span className="text-sm font-bold text-on-surface block">Invite AI Staff</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Bring your trained NPCs into the room</span>
              </div>
            </label>

            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all disabled:opacity-60 shadow-lg active:scale-95"
            >
              <span className="material-symbols-outlined">{isCreating ? "sync" : "rocket"}</span>
              {isCreating ? "Initializing…" : "Create Arena"}
            </button>
          </div>
        </div>

        {/* Join Arena */}
        <div className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all group border-l-4 border-l-primary">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">key</span>
            </div>
            <h3 className="text-2xl font-black font-headline mb-3 text-on-surface">Existing Arena</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              Enter a join code shared by a teammate to jump directly into an active private session.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative group/input">
              <input
                className="w-full px-6 py-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 text-center text-xl font-bold uppercase tracking-[0.2em] outline-none transition-all placeholder:text-sm placeholder:tracking-normal placeholder:font-medium"
                placeholder="--- --- ---"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                maxLength={6}
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={isJoining || joinCode.length < 4}
              className="w-full py-4 soul-gradient text-white rounded-2xl font-bold transition-all disabled:opacity-60 shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">login</span>
              {isJoining ? "Joining…" : "Join Arena"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
