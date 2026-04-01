import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
    <div className="pt-16 p-8 md:p-12 min-h-screen w-full max-w-6xl mx-auto space-y-20">
      
      {/* Header Section */}
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-fixed rounded-full">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_12px_2px_rgba(100,94,83,0.2)]"></div>
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-on-primary-fixed uppercase">
            P2P SIGNALING: STANDBY
          </span>
        </div>
        <div className="space-y-4">
          <h1 className="font-headline text-5xl font-bold text-on-background tracking-tighter">
            Private Collaboration Vaults
          </h1>
          <p className="max-w-2xl text-secondary text-lg font-light leading-relaxed">
            Provision an isolated 3D environment for your team. Every private vault utilizes a WebRTC peer-to-peer mesh with end-to-end encryption, ensuring your coordination remains sovereign and local.
          </p>
        </div>
      </header>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-3 font-mono">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>[ERROR] {error}</span>
        </div>
      )}

      {/* Grid Layout for Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Section 1: Initialize */}
        <section className="lg:col-span-7 bg-surface-container-low rounded-xl p-8 space-y-8 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-primary">
                  01 // Initialize Secure Workspace
                </h2>
                <p className="text-xs text-outline">Configure environment parameters for immediate instantiation.</p>
              </div>
              <span className="material-symbols-outlined text-outline-variant">grid_view</span>
            </div>
            
            <div className="bg-surface-container-lowest p-6 rounded-xl space-y-6 mt-8">
              {/* NPC Toggle */}
              <div className="flex items-center justify-between pb-6 border-b border-outline-variant/10">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Include Autonomous Agents (NPCs)</label>
                  <p className="text-xs text-outline leading-relaxed max-w-sm">
                    Spawn Aria, Kai, and Nova into this private room for AI-assisted spatial debugging.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={bringNpcs}
                    onChange={(e) => setBringNpcs(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* RAG Toggle (Visual only for now) */}
              <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Sync Neural Knowledge (RAG)</label>
                  <p className="text-xs text-outline leading-relaxed max-w-sm">
                    Allow room bots to access your local workspace embeddings. (Coming Soon)
                  </p>
                </div>
                <label className="relative inline-flex items-center pointer-events-none">
                  <input type="checkbox" className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/50 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5"></div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-4 mt-auto">
            <button 
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full bg-primary hover:bg-on-primary-container text-white py-4 px-6 rounded-xl font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 group"
            >
              <span>{isCreating ? "INITIALIZING SECURE MESH..." : "PROVISION ENCRYPTED ROOM"}</span>
              <span className={`material-symbols-outlined text-sm ${isCreating ? 'animate-spin' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'}`}>
                {isCreating ? "sync" : "rocket_launch"}
              </span>
            </button>
          </div>
        </section>

        {/* Section 2: Join via Hash */}
        <section className="lg:col-span-5 bg-surface-container-low rounded-xl p-8 space-y-8 flex flex-col h-full">
          <div className="space-y-1">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-primary">
              02 // Join via Access Hash
            </h2>
            <p className="text-xs text-outline">Enter the specific mesh identifier provided by the host.</p>
          </div>
          
          <div className="flex-grow flex flex-col justify-center gap-8">
            <div className="space-y-4">
              <input 
                type="text" 
                maxLength={6} 
                placeholder="------"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                   if (e.key === "Enter" && joinCode.length >= 4) {
                     handleJoin();
                   }
                }}
                className="w-full bg-surface-container-highest border-none rounded-xl text-center text-4xl font-mono tracking-[0.5em] py-8 text-primary placeholder:text-outline-variant focus:ring-1 focus:ring-primary/40 transition-all uppercase outline-none"
              />
              <p className="text-[10px] text-center text-outline uppercase tracking-wider">
                6-Character Peer Identifier Required
              </p>
            </div>
            
            <button 
              onClick={handleJoin}
              disabled={isJoining || joinCode.length < 4}
              className="w-full bg-surface-container-highest hover:bg-surface-container-high text-primary py-4 px-6 rounded-xl font-bold tracking-tight border border-outline-variant/20 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
            >
              <span className={`material-symbols-outlined ${isJoining ? 'animate-spin' : ''}`}>
                {isJoining ? "sync" : "hub"}
              </span>
              <span>{isJoining ? "JOINING NODE..." : "ESTABLISH P2P CONNECTION"}</span>
            </button>
          </div>
        </section>
      </div>

      {/* Section 3: Technical Specs */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-primary">
            03 // Technical Protocol Specs
          </h2>
          <div className="h-[1px] flex-grow bg-outline-variant/20"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Privacy Card */}
          <div className="group bg-surface-container-lowest p-8 rounded-xl hover:bg-white transition-all duration-300 shadow-sm border border-transparent hover:border-outline-variant/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary-fixed text-primary rounded-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              </div>
              <h3 className="font-headline text-xl font-bold">Privacy Architecture</h3>
            </div>
            <p className="text-secondary leading-relaxed mb-6">
              Zero-Log Communication: All signaling data is ephemeral. Metadata is scrubbed upon session termination. No central database retains information regarding vault participants or shared assets.
            </p>
            <div className="text-[10px] font-mono text-outline uppercase tracking-widest">
              Status: Active / AES-256-GCM
            </div>
          </div>
          
          {/* Ephemeral Card */}
          <div className="group bg-surface-container-lowest p-8 rounded-xl hover:bg-white transition-all duration-300 shadow-sm border border-transparent hover:border-outline-variant/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-tertiary-fixed text-tertiary rounded-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history_toggle_off</span>
              </div>
              <h3 className="font-headline text-xl font-bold">Ephemeral State</h3>
            </div>
            <p className="text-secondary leading-relaxed mb-6">
              Automatic Volatility: State synchronization uses CRDTs (Conflict-free Replicated Data Types). Upon the last peer's departure, the instance memory is purged from the signaling relay.
            </p>
            <div className="text-[10px] font-mono text-outline uppercase tracking-widest">
              Protocol: WebRTC Mesh / V.2.14
            </div>
          </div>
        </div>
      </section>

      {/* Visual Context Section (Editorial Image) */}
      <section className="relative h-96 w-full rounded-2xl overflow-hidden group">
        <img 
          className="w-full h-full object-cover grayscale opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-1000" 
          alt="abstract visualization of digital network data points connecting in 3D space" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtS2i7YkX7NCCvvW58hHA8gMX4zawQqD1SCdsfjJz5xe88LeaIMB5PJxtbKpNB76JfZzUavfDqFQCIBh1A7G9A5tACtYHneVK55GCSkDtj3wTCrkUapaxXXwkdR8-rQyBn5YL96tlT9C4yoLLsz5XDhzswjFlCjUGCQKH7INpSdSiXSLHQ_kfYP2Ngf9zWmOM0xcHlFfMS1nAkPNHnN2vRydmngmsdJZvxnBgiva9PBz-V8Zn1OJMSw83B7BZnJFHNjGRLAPww2g"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
        <div className="absolute bottom-12 left-12 space-y-4">
          <div className="inline-block px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl text-xs font-mono text-primary shadow-sm border border-white/20">
            LATENCY: <span className="text-green-600">12ms</span> // NODES: <span className="text-on-surface">LOCAL</span>
          </div>
          <p className="text-outline text-sm italic max-w-sm">"The strength of the arena is the sovereignty of the participants."</p>
        </div>
      </section>

      {/* Footer/Links */}
      <footer className="pt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-6 pb-20">
        <div className="flex gap-8">
          <Link to="/" className="group flex items-center gap-2 text-xs font-mono font-bold text-outline hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            RETURN TO COMMAND CENTER
          </Link>
          <Link to="/arena" className="group flex items-center gap-2 text-xs font-mono font-bold text-outline hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm group-hover:text-tertiary transition-colors">public</span>
            VIEW PUBLIC ATRIUM STATUS
          </Link>
        </div>
        <div className="text-[10px] font-mono text-outline-variant uppercase tracking-widest flex items-center gap-2">
          DEVERSE OS // CORE-ENGINE 2.4.0
        </div>
      </footer>

    </div>
  );
}
