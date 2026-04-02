import { Link } from "react-router-dom";

export default function Lobby() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Hero Section */}
      <section className="pt-40 pb-24 px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,97,105,0.6)]"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] font-label">Edge Infrastructure: Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-on-surface mb-8 leading-[1.05] font-headline">
              Shared 3D Workspaces with Emulated AI Engineers
            </h1>
            <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed mb-12">
Deverse is a persistent 3D playground where developers collaborate with autonomous AI agents. Instead of chat windows, we’ve built a spatial world where you walk up to AI engineers  and talk to them naturally using your voice. It provides platform for developers around the corner so they can collaborate with their fellow developers and can build together.            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/arena" className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                Enter Global Atrium
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link to="/my-arenas" className="border border-outline/20 flex items-center justify-center px-8 py-4 rounded-full font-bold text-on-surface hover:bg-surface-container-low transition-all">
                Provision Private Space
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-square bg-surface-container-low rounded-[2rem] overflow-hidden relative shadow-2xl">
              <img alt="Architecture" className="w-full h-full object-cover mix-blend-overlay opacity-80" data-alt="abstract 3D mesh architecture visualization with blue and purple neon highlights on dark background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0ivrZVirBy44iqkWH0GMf6BYj4MD47YlNfKiaRcMSuaX6VKj9Rhcjy1Yqyv9HrBTm7Ljar6xeeVcZ-k5tiAUglujzO47UHXpr93HYzWaEYDBD4iMAc3Owa6AXyHn_-SbEW44W7xiGv2KqILoESK3Pa7II5q2u2mtq63wfrEei-aw4RClCEgeVV1Gk7FTgnU-iKFdwaMFZEiQAUlkn30tvJTJdr_ASEMabQtVX5jYP1m8dsSpkrQhJQPwZNl13SoGeGPVvtTxeRw"/>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 p-6 glass-morphism rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-tertiary-fixed">hub</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Active Peer Mesh</div>
                    <div className="text-sm font-semibold">124 Nodes Connected</div>
                  </div>
                </div>
                <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-primary"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-4 font-headline">Edge-Native Multiplayer Architecture</h2>
              <p className="text-on-surface-variant max-w-lg">Designed for minimal latency and maximum sovereign control through distributed edge protocols.</p>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/20"></div>
              <div className="w-3 h-3 rounded-full bg-primary/40"></div>
              <div className="w-3 h-3 rounded-full bg-primary"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 bg-surface-container-lowest rounded-xl hover:shadow-xl transition-all border border-transparent hover:border-outline-variant/10 group">
              <div className="w-12 h-12 rounded-lg bg-primary-fixed mb-6 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">layers</span>
              </div>
              <h3 className="text-lg font-bold mb-3 font-headline">3D Visual Client (React Three Fiber)</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">High-fidelity spatial rendering in the browser with zero installation requirements.</p>
            </div>
            <div className="p-8 bg-surface-container-lowest rounded-xl hover:shadow-xl transition-all border border-transparent hover:border-outline-variant/10 group">
              <div className="w-12 h-12 rounded-lg bg-secondary-fixed mb-6 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">sync</span>
              </div>
              <h3 className="text-lg font-bold mb-3 font-headline">Multiplayer Synchronization (Cloudflare Durable Objects)</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">State coordination handled at the edge for sub-50ms global latency.</p>
            </div>
            <div className="p-8 bg-surface-container-lowest rounded-xl hover:shadow-xl transition-all border border-transparent hover:border-outline-variant/10 group">
              <div className="w-12 h-12 rounded-lg bg-tertiary-fixed mb-6 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <h3 className="text-lg font-bold mb-3 font-headline">AI Inference & Speech (Eleven Labs)</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">Private, local-first inference pipelines for real-time agent verbal interaction.</p>
            </div>
            <div className="p-8 bg-surface-container-lowest rounded-xl hover:shadow-xl transition-all border border-transparent hover:border-outline-variant/10 group">
              <div className="w-12 h-12 rounded-lg bg-surface-container-highest mb-6 flex items-center justify-center text-on-surface-variant group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">security</span>
              </div>
              <h3 className="text-lg font-bold mb-3 font-headline">Secure Communication (WebRTC P2P Mesh)</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">End-to-end encrypted tunnels for direct peer data transmission without centralized storage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Pipeline Section */}
      <section className="py-32 max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-24 items-stretch">
          <div className="relative flex flex-col">
            <div className="bg-white dark:bg-[#151a1e] rounded-2xl p-12 border border-outline-variant/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] flex-grow flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-periwinkle/5 rounded-full blur-3xl group-hover:bg-periwinkle/10 transition-colors"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-periwinkle/5 rounded-full blur-3xl group-hover:bg-periwinkle/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-periwinkle/10 flex items-center justify-center mb-8 mx-auto">
                  <span className="material-symbols-outlined text-periwinkle !text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <h2 className="text-3xl font-bold mb-6 tracking-tight font-headline">Privacy Architecture: Verified</h2>
                <p className="text-white leading-relaxed max-w-md mx-auto">
                  Engineered with physical segregation at the Edge. User secrets are cryptographically isolated within private enclaves, and multi-tenant RAG pipelines maintain absolute data sovereignty across all distributed nodes.
                </p>
                <div className="mt-10 flex items-center justify-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-green-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-green-600 font-bold">shield</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-blue-600 font-bold">lock</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-white ml-2">Zero-Knowledge Protocols Active</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-8 tracking-tight font-headline">Agent Memory & Privacy Scoping</h2>
            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">01</div>
                <div>
                  <h4 className="text-xl font-bold mb-2 font-headline">Multi-Tenant RAG</h4>
                  <p className="text-on-surface-variant">Isolated vector stores ensure that proprietary project data is never leaked between sessions or agents.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">02</div>
                <div>
                  <h4 className="text-xl font-bold mb-2 font-headline">Strict Privacy Filters</h4>
                  <p className="text-on-surface-variant">Automated PII scrubbing and content safety layers integrated directly into the inference stream.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">03</div>
                <div>
                  <h4 className="text-xl font-bold mb-2 font-headline">Dynamic Hydration</h4>
                  <p className="text-on-surface-variant">Real-time context injection allows agents to understand your codebase as it evolves in the workspace.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Roster Section */}
      <section className="py-24 bg-[#faf9fa]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight font-headline">The Digital Engineering Roster</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Deploy specialized AI entities into your workspace. Each agent is pre-tuned for specific phases of the development lifecycle.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Agent 1 */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:translate-y-[-4px] transition-all border-b-4 border-primary/20">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-6 mx-auto border-2 border-periwinkle/30">
                <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" data-alt="portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAtbVONjpTpARUQMCig5Ql_K4KMGTGkFgr-rBhRqQYLqk51V28DZxcvhqwgz6YCExS5D9yqWEBk2DYHVb7PTI5pY5wVYqT_i5HLcrUmYe5HLAISP-31h0E3HAcy2HjN2XQsgy3zWJLwUVsaTuxKc9Gaul5OAO1kvrxnzKQ6pir8Zx1vLeXcoztQssXEwa-o_TIGnVY6Go858Gp-uAoaJytrFM_oulggWcDat2BxyeIIAbG4jogndbArxAjAk8XyU1tY0R3YROx_w"/>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold font-headline">Aria</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Frontend Engineer</p>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">React/Next.js Expert</span>
                  <span className="text-primary font-bold">98%</span>
                </div>
                <div className="h-1 bg-surface-container-low rounded-full">
                  <div className="w-[98%] h-full bg-primary"></div>
                </div>
              </div>
              <button className="w-full py-3 text-sm font-bold border border-outline/10 hover:bg-surface-container rounded-lg transition-colors">Summon Agent</button>
            </div>
            {/* Agent 2 */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:translate-y-[-4px] transition-all border-b-4 border-secondary/20">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-6 mx-auto border-2 border-periwinkle/30">
                <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" data-alt="portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbwkZ4NxHdwKmxt0-r980_urAzw7X2hLgpvPXeo1G6C_Y9AEkAcA1f9jamZjqBVtm4wEwCZ-DXbJZ7yzv0EbNAF_RU3xPkvatYT-etJSJolC6ecd1O6TBwxdnK5a0gd3xh7o2QUUtJEwoTRKLSdkssnAFBG3NLLTVP7PBvaoQTrkJ09NrGkLJa08Y88-Ff7WAUuWGB-kNagLgHYMLND8Bt4f7hlVaL634qcZH3Gy__72yZQ72RFPRWJzFwBj9ASZQKgEbywhrv8Q"/>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold font-headline">Kai</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary">Backend Architect</p>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Rust / Distributed Systems</span>
                  <span className="text-secondary font-bold">95%</span>
                </div>
                <div className="h-1 bg-surface-container-low rounded-full">
                  <div className="w-[95%] h-full bg-secondary"></div>
                </div>
              </div>
              <button className="w-full py-3 text-sm font-bold border border-outline/10 hover:bg-surface-container rounded-lg transition-colors">Summon Agent</button>
            </div>
            {/* Agent 3 */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:translate-y-[-4px] transition-all border-b-4 border-tertiary/20">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-6 mx-auto border-2 border-periwinkle/30">
                <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" data-alt="portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-qcZbsXsGlJDBdqqry6MeqXC0Q9pTE8HfM4vmdZA9xKiEWTn49PDw26GLaQP8Z3rfXxHnb6L0w8Zzhoaq6RhF-F7j-lAlPHDmzNfoiASKNTjK6XJRjwWIrzOmRat2qxd7LcwjqWAQVf151cd_6iyhaEGvixGOa0ntQ0FdXmG6E9MvlHsNOxDUJl4pRotCdWRl09HT6uLwq0W8eIVIwuKHbjCJ4AriAhY3Pjs3W2W3RZ3oGQWSsvDEstkdYeR6oKwjIzj4D-SVeg"/>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold font-headline">Nova</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-tertiary">DevOps Engineer</p>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">K8s / Terraform Specialist</span>
                  <span className="text-tertiary font-bold">92%</span>
                </div>
                <div className="h-1 bg-surface-container-low rounded-full">
                  <div className="w-[92%] h-full bg-tertiary"></div>
                </div>
              </div>
              <button className="w-full py-3 text-sm font-bold border border-outline/10 hover:bg-surface-container rounded-lg transition-colors">Summon Agent</button>
            </div>
          </div>
          <div className="flex justify-center">
            <Link to="/train" className="flex items-center gap-2 px-10 py-5 bg-black-amber text-surface rounded-full font-bold hover:opacity-90 transition-all">
              <span className="material-symbols-outlined">model_training</span>
              Train Agents
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#faf9fa] dark:bg-[#0d0d0d] border-t border-[#f4f3f4]/15">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto gap-4">
          <div className="text-[#4e6169] dark:text-[#b3c7d0] font-['Manrope'] text-[0.6875rem] uppercase tracking-widest">
            © 2024 Deverse OS. Engineered for Precision.
          </div>
          <div className="flex gap-8">
            <Link className="text-[#645e53] dark:text-[#808080] hover:text-[#595e6b] dark:hover:text-white transition-colors font-['Manrope'] text-[0.6875rem] uppercase tracking-widest" to="#">Documentation</Link>
            <Link className="text-[#645e53] dark:text-[#808080] hover:text-[#595e6b] dark:hover:text-white transition-colors font-['Manrope'] text-[0.6875rem] uppercase tracking-widest" to="#">API Reference</Link>
            <Link className="text-[#645e53] dark:text-[#808080] hover:text-[#595e6b] dark:hover:text-white transition-colors font-['Manrope'] text-[0.6875rem] uppercase tracking-widest" to="#">Status</Link>
            <Link className="text-[#645e53] dark:text-[#808080] hover:text-[#595e6b] dark:hover:text-white transition-colors font-['Manrope'] text-[0.6875rem] uppercase tracking-widest" to="#">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
