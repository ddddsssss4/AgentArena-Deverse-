import { Link } from "react-router-dom";

export default function Arena() {
  return (
    <div className="pt-16 pb-24 px-8 md:px-12 max-w-screen-xl mx-auto">
      {/* Header Section */}
      <header className="mb-16 space-y-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center px-3 py-1 bg-surface-container-high rounded-full gap-2 border border-primary/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase font-label text-on-surface-variant text-primary">
              [ LIVE MULTIPLAYER: OPEN ]
            </span>
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tighter text-on-surface leading-tight">
          Global Workspace
        </h1>
        <p className="text-lg text-secondary max-w-2xl font-light leading-relaxed">
          Enter the persistent 3D playground. Collaborate with developers worldwide or interact with our resident AI engineering team in a low-latency, spatialized environment.
        </p>
      </header>

      {/* Core Gateway Card */}
      <section className="mb-12">
        <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-zinc-900/5 transition-transform duration-500 hover:scale-[1.005] border border-outline-variant/10">
          <div className="relative h-[500px] w-full group overflow-hidden">
            <img
              alt="A high-end minimal architectural workspace"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY5xAEpmVrmYgjTL8LTl1-84F3tZv7KdfbTFnkssbbQziMRGsYyrxwZFFxtIyMXKS1RZHy5k-hCE-UY198Glkvv5JNqdgY8025lh0Zptu6CAmM-LN9yGkvk99vJwaQPBLjimctSmmTVedA1h6bRJbtR4urdMVumnXYZP7iuE4nsglkMFwg1T3iwYrVqb9FWR0q3a615i8hv4xYhzgr1390jqspWE8LQRe4YbXNL4QRBTdgY5IqJXsD91nLFtdpeB6J6fB1XUHYUQ"
            />
            {/* Overlay Tags */}
            <div className="absolute top-8 left-8 flex gap-3">
              <div className="px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-full">
                <span className="text-[10px] font-bold tracking-widest text-white uppercase font-label">
                  [ Spatial Audio Active ]
                </span>
              </div>
              <div className="px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-full">
                <span className="text-[10px] font-bold tracking-widest text-white uppercase font-label">
                  [ Shared Instance ]
                </span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>
          </div>
          
          {/* Info Panel */}
          <div className="p-12 md:p-16 bg-surface-container-lowest">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-headline tracking-tight text-on-surface">
                  Welcome to the Public Atrium
                </h2>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Aria, Kai, and Nova are currently online and stationed in the shared square. Our autonomous agents are equipped with the latest build contexts. Walk up to anyone to start a real-time conversation.
                </p>
                <Link to="/arena/live">
                  <button className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-full font-headline font-bold flex items-center gap-3 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95 group mt-4">
                    [ ENTER GLOBAL WORKSPACE ]
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </button>
                </Link>
              </div>
              
              {/* Capability Grid */}
              <div className="grid gap-4">
                <div className="p-6 bg-surface-container-low rounded-xl flex items-center gap-5 border border-transparent hover:border-primary/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-outline font-label">
                      AI Roster
                    </p>
                    <p className="font-medium text-on-surface">3 Autonomous Agents</p>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-low rounded-xl flex items-center gap-5 border border-transparent hover:border-primary/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>record_voice_over</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-outline font-label">
                      Interaction
                    </p>
                    <p className="font-medium text-on-surface">Proximity-Based Voice &amp; Text</p>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-low rounded-xl flex items-center gap-5 border border-transparent hover:border-primary/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_done</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-outline font-label">
                      Environment
                    </p>
                    <p className="font-medium text-on-surface">Edge-Rendered Multiplayer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid md:grid-cols-2 gap-8">
        {/* Card 1 */}
        <Link to="/my-arenas" className="p-10 bg-surface-container-low rounded-xl hover:bg-surface-container transition-all duration-300 group border border-outline-variant/10 block">
          <div className="mb-8 w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-primary-container">
              hub
            </span>
          </div>
          <h3 className="text-2xl font-bold font-headline mb-4">Private Collaboration</h3>
          <p className="text-on-surface-variant leading-relaxed mb-8">
            Start a Private Session. Need a secure room for your team? Initialize an isolated WebRTC workspace with zero external traffic and custom encryption keys.
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase font-label text-primary hover:text-on-primary-fixed-variant transition-colors">
            Initialize Cluster
            <span className="material-symbols-outlined text-xs">arrow_outward</span>
          </div>
        </Link>
        
        {/* Card 2 */}
        <Link to="/train" className="p-10 bg-surface-container-low rounded-xl hover:bg-surface-container transition-all duration-300 group border border-outline-variant/10 block">
          <div className="mb-8 w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-primary-container">
              settings_input_component
            </span>
          </div>
          <h3 className="text-2xl font-bold font-headline mb-4">Personalize Agents</h3>
          <p className="text-on-surface-variant leading-relaxed mb-8">
            Configure AI Context. Inject your specific project requirements and API keys into the agents before interacting with them to ensure deep project knowledge.
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase font-label text-primary hover:text-on-primary-fixed-variant transition-colors">
            Configure Payload
            <span className="material-symbols-outlined text-xs">tune</span>
          </div>
        </Link>
      </section>

      {/* Footer Stats */}
      <footer className="mt-24">
        <div className="pt-16 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-outline font-label tracking-widest uppercase">
                System Load
              </p>
              <p className="text-sm font-medium text-on-surface-variant">14% Global Capacity</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-outline font-label tracking-widest uppercase">
                Latency
              </p>
              <p className="text-sm font-medium text-on-surface-variant">22ms Edge (London)</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-outline font-label tracking-widest uppercase">
                Version
              </p>
              <p className="text-sm font-medium text-on-surface-variant">v2.4.0-stable</p>
            </div>
          </div>
          <p className="text-[10px] font-medium text-outline font-label tracking-widest uppercase opacity-60">
            © 2024 DEVERSE OS TECHNICAL ATELIER
          </p>
        </div>
      </footer>
    </div>
  );
}
