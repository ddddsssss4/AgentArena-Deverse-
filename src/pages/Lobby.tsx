import { Link } from "react-router-dom";

export default function Lobby() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Hero Section */}
      <header className="relative pt-8 pb-20 md:pt-16 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-semibold tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Live Multiplayer Arena
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter leading-[1.1] text-on-surface">
                Meet the <span className="text-primary">AI Developer</span> Community
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant max-w-lg leading-relaxed">
                A collaborative 3D social space designed for real-time interaction with autonomous AI agents. No prompts, no delay—just pure spatial conversation.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/arena" className="hero-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 scale-100 active:scale-95">
                  Start Exploring
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <button className="bg-surface-container-lowest text-on-surface border border-outline-variant/30 px-8 py-4 rounded-xl font-bold hover:bg-surface-container-low transition-all">
                  View Demo
                </button>
              </div>
            </div>
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-1 bg-surface-container-highest p-2">
                <img
                  alt="AI Arena Visualization"
                  className="rounded-xl w-full aspect-square object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD66KikJFxFB7ufW6ZvewKkqDaU4EnQ934O5_b7E8NlI76e_Dn1xbkEqB9gouXtzPEf8MM38VBuQSDT5gJhs9v1enxe0cyENwqm9ntnzgmB6FDt8FAV9TrvHCTubN3tmy_w8PCgUFwUkMc8ubAbdHlc3eSyg1sNU0d4zaFNXl6kEnGDh-0ksZIRfxodk0L36KwHTtZtmQPHlBXXQ5fYnTYTMxcNojJD-h_EvrUNudWRgc0iHgAkCVH_jCg5Yc3sdypTe0MSqnfACnJi"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none"></div>
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest p-4 rounded-xl shadow-xl border border-outline-variant/20 max-w-[200px] hidden md:block">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-secondary">smart_toy</span>
                  </div>
                  <span className="text-xs font-bold">Lovelace AI</span>
                </div>
                <p className="text-[10px] text-on-surface-variant leading-tight">
                  "Hey! I remember your Ruby project. Ready to refactor that module?"
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
      </header>

      {/* Proximity Voice Section */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative group iso-card-container">
              <div className="aspect-video rounded-3xl bg-surface-container-highest overflow-hidden iso-card iso-shadow border border-white/20">
                <img
                  alt="Voice Interaction Interface"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi8MTtE0A9s_VwEBAkv2svgFxVGsyRR0VU0nwBra-fX5lV8wm82ZQb-o4ody1bkFZ5JSE5fb7KI40OweHYlRrj8mggq3pARDIcnV0HuWJPxAbLOsaX3_nVUep57PdyB6M3Zhr2aR_aMQHrXM60jShSQNL_4LuWCYZciDbBCuVvdJ1neuQ_44Xsf6zvbJTeg2Yub31cntlsrHEnr_K0M0rEiFuFTBGuipbAOJKuYauwepFdl7MkGseqUMPVJYYhRscT_pGAY7C4joIf"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                <div className="absolute inset-0 border-[0.5px] border-white/40 rounded-3xl pointer-events-none"></div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  record_voice_over
                </span>
              </div>
              <h2 className="text-4xl font-headline font-bold text-on-surface">Proximity-Based Talk</h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                Forget traditional chat interfaces. Our spatial audio engine detects your location in the 3D atrium.
                <span className="font-bold text-on-surface"> Just walk up and talk.</span> No buttons, no typing. Real-time voice interaction triggered by your position in the arena.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  Zero-latency spatial voice processing
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  Natural fade-in/out based on distance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features (Memory & Map) */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Persistent Memory Card */}
            <div className="md:col-span-7 iso-card-container">
              <div className="h-full glass-morphism iso-card iso-shadow p-10 rounded-[2.5rem] border border-white/30 flex flex-col justify-between group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-tertiary mb-8 shadow-inner">
                    <span className="material-symbols-outlined text-3xl">psychology</span>
                  </div>
                  <h3 className="text-3xl font-headline font-bold text-on-surface mb-6">Persistent AI Memory</h3>
                  <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                    They remember you. Conversations aren't just one-offs; NPCs remember your past chats, your coding style, and evolve with every interaction.
                  </p>
                </div>
                <div className="mt-12 bg-white/50 backdrop-blur-sm rounded-2xl p-6 flex gap-4 items-center border border-white/40 shadow-sm relative">
                  <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary w-2/3 shadow-[0_0_15px_rgba(97,38,0,0.4)]"></div>
                  </div>
                  <span className="text-xs font-bold font-label whitespace-nowrap text-tertiary uppercase tracking-tighter">
                    Memory Optimized
                  </span>
                </div>
                {/* Inner Glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-tertiary/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
              </div>
            </div>
            {/* Live Spatial Map Card */}
            <div className="md:col-span-5 iso-card-container">
              <div className="h-full bg-primary iso-card iso-shadow p-10 rounded-[2.5rem] text-white overflow-hidden group border border-primary-fixed/20 relative">
                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20">
                    <span className="material-symbols-outlined text-3xl">explore</span>
                  </div>
                  <h3 className="text-3xl font-headline font-bold mb-6">Live Spatial Map</h3>
                  <p className="text-primary-fixed/80 text-lg leading-relaxed mb-10">
                    See who's online, where they are, and move naturally with your keyboard to join conversations.
                  </p>
                  <div className="mt-auto relative w-full aspect-[4/3] bg-black/20 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                    <img
                      alt="Spatial Grid Map"
                      className="w-full h-full object-cover opacity-60 mix-blend-screen group-hover:scale-110 transition-transform duration-1000"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQVx9I7bx8VTutMBCac9YvdrDvmFYK05LJ0eaIxWnga8k6EGVt7n9gmkdGQMZV2hB7q0gDiMVS3eYLdUg4WSnMwdN-i7WEYKn6nTledPFaHlnvMP2_fmHgNXGFxSdDRPOqMTwW58a8VyuISC_QU4N_cK6EaOTzycXaCEaLzmx276AIgyh0wsv7lb-1BdlCadsgFq0SSHvYB8xHNxpfmuVqNzO6ERB-CZ4Jt2ikALqztgGsD85jiw73NIQyiRc2IYOdqMfhtErKfxdM"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-5 h-5 bg-white rounded-full animate-pulse shadow-[0_0_20px_#fff]"></div>
                      <span className="text-[10px] mt-3 font-bold uppercase tracking-[0.2em] text-white/80">You are here</span>
                    </div>
                  </div>
                </div>
                {/* Decorative Element */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-white/20 transition-colors duration-700"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Section (Identity Markers) */}
      <section className="py-32 bg-surface-container-low overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-headline font-extrabold mb-6 tracking-tight">Choose Your Path</h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">Select an identity and unlock specialized AI mentors tailored to your engineering discipline.</p>
        </div>
        <div className="flex gap-12 overflow-x-auto pb-20 pt-10 px-6 no-scrollbar iso-card-container">
          {/* Card 1: Backend */}
          <div className="min-w-[320px] flex-shrink-0 group">
            <div className="iso-card glass-morphism iso-shadow p-10 rounded-[2rem] border-l-[6px] border-slate-600 border-t border-r border-b border-white/40 h-full relative overflow-hidden">
              <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 bg-slate-200 text-slate-700 border border-slate-300/50">Backend</span>
              <h4 className="text-2xl font-black mb-4 font-headline">Systems Architect</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">Focus on distributed systems and high-scale infrastructure.</p>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-slate-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            </div>
          </div>
          {/* Card 2: Frontend */}
          <div className="min-w-[320px] flex-shrink-0 group">
            <div className="iso-card glass-morphism iso-shadow p-10 rounded-[2rem] border-l-[6px] border-primary-container border-t border-r border-b border-white/40 h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 bg-primary-fixed text-primary border border-primary-container/20">Frontend</span>
              <h4 className="text-2xl font-black mb-4 font-headline">Interface Wizard</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">Master the art of high-performance modern UIs and DX.</p>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            </div>
          </div>
          {/* Card 3: DevOps */}
          <div className="min-w-[320px] flex-shrink-0 group">
            <div className="iso-card glass-morphism iso-shadow p-10 rounded-[2rem] border-l-[6px] border-emerald-500 border-t border-r border-b border-white/40 h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 bg-emerald-50 text-emerald-600 border border-emerald-500/20">DevOps</span>
              <h4 className="text-2xl font-black mb-4 font-headline">Pipeline Engine</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">Automate everything from deployment to observability.</p>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            </div>
          </div>
          {/* Card 4: AI */}
          <div className="min-w-[320px] flex-shrink-0 group">
            <div className="iso-card glass-morphism iso-shadow p-10 rounded-[2rem] border-l-[6px] border-tertiary border-t border-r border-b border-white/40 h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-tertiary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 bg-tertiary-fixed text-tertiary border border-tertiary/20">AI</span>
              <h4 className="text-2xl font-black mb-4 font-headline">Prompt Master</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">Orchestrate large language models and neural workflows.</p>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-tertiary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface mb-8">Ready to step into the future?</h2>
          <p className="text-xl text-on-surface-variant mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of developers building, chatting, and evolving in the Arena. Experience the first spatial social network built for humans and AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/arena" className="hero-gradient text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 transition-all hover:translate-y-[-2px] flex items-center justify-center">
              Enter the Arena Now
            </Link>
          </div>
        </div>
        {/* Decorative gradients */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent"></div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/20 bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col md:flex-row justify-between items-center py-12 px-6 max-w-7xl mx-auto gap-4">
          <div className="space-y-2 text-center md:text-left">
            <div className="text-lg font-bold text-on-surface font-headline">DevFlow Arena</div>
            <p className="font-inter text-xs text-on-surface-variant">© 2024 DevFlow Arena. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <a className="font-inter text-xs text-on-surface-variant hover:text-primary hover:underline transition-colors opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
            <a className="font-inter text-xs text-on-surface-variant hover:text-primary hover:underline transition-colors opacity-80 hover:opacity-100" href="#">Terms of Service</a>
            <a className="font-inter text-xs text-on-surface-variant hover:text-primary hover:underline transition-colors opacity-80 hover:opacity-100" href="#">Twitter</a>
            <a className="font-inter text-xs text-on-surface-variant hover:text-primary hover:underline transition-colors opacity-80 hover:opacity-100" href="#">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
