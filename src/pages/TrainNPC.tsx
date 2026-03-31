import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const NPCS = [
  {
    id: "frontend-npc",
    name: "Aria",
    role: "FRONTEND",
    desc: "Optimized for React, Tailwind, and Spatial UI rendering logic.",
    icon: "code",
    colorBase: "indigo",
    borderActive: "border-indigo-500/50",
    bgActive: "bg-indigo-50",
    textActive: "text-indigo-600",
    shadowActive: "shadow-indigo-500/5",
    badgeBg: "bg-indigo-500/10",
  },
  {
    id: "backend-npc",
    name: "Kai",
    role: "BACKEND",
    desc: "Specialized in Node.js, Rust microservices, and Postgres vector extensions.",
    icon: "terminal",
    colorBase: "emerald",
    borderActive: "border-emerald-500/50",
    bgActive: "bg-emerald-50",
    textActive: "text-emerald-600",
    shadowActive: "shadow-emerald-500/5",
    badgeBg: "bg-emerald-500/10",
  },
  {
    id: "devops-npc",
    name: "Nova",
    role: "DEVOPS",
    desc: "Expertise in K8s orchestration, CI/CD telemetry, and CloudFormation.",
    icon: "settings_ethernet",
    colorBase: "amber",
    borderActive: "border-amber-500/50",
    bgActive: "bg-amber-50",
    textActive: "text-amber-600",
    shadowActive: "shadow-amber-500/5",
    badgeBg: "bg-amber-500/10",
  },
];

export default function TrainNPC() {
  const { token, user } = useAuthStore();
  const [selectedNpc, setSelectedNpc] = useState(NPCS[0]);
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [roleOverride, setRoleOverride] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [knowledgeList, setKnowledgeList] = useState<{ id: string; content: string; createdAt: string }[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);

  useEffect(() => {
    async function fetchKnowledge() {
      if (!token) return;
      setIsLoadingKnowledge(true);
      try {
        const res = await fetch(`/api/npc/${selectedNpc.id}/knowledge`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json() as {
            knowledge: { id: string; content: string; createdAt: string }[];
            settings: { voiceId?: string; roleOverride?: string };
          };
          setKnowledgeList(data.knowledge);
          setVoiceId(data.settings.voiceId || "");
          setRoleOverride(data.settings.roleOverride || "");
        }
      } catch (err) {
        console.error("Failed to load knowledge", err);
      } finally {
        setIsLoadingKnowledge(false);
      }
    }
    fetchKnowledge();
  }, [selectedNpc, token]);

  const handleTrain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token) return;

    if (!text.trim() && !voiceId && !roleOverride) {
      setMessage({ type: "error", text: "Please enter some knowledge, a voice ID, or a role override." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/npc/${selectedNpc.id}/train`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: text.trim() || undefined,
          voiceId: voiceId.trim() || undefined,
          roleOverride: roleOverride.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to train NPC");

      setMessage({ type: "success", text: "Vector commit successful. Persona updated." });

      if (text.trim()) {
        setKnowledgeList(prev => [{
          id: crypto.randomUUID(),
          content: text.trim(),
          createdAt: new Date().toISOString()
        }, ...prev]);
      }
      setText(""); 
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Training failed" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[calc(100vh-5rem)]">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[32px] text-primary">lock</span>
        </div>
        <h2 className="text-2xl font-bold font-headline text-on-surface mb-2 tracking-tight">Access Restricted</h2>
        <p className="text-on-surface-variant max-w-sm mb-6 leading-relaxed">
          Authentication is required to configure spatial agents and access private vector stores.
        </p>
      </div>
    );
  }

  // Calculate buffer percentage safely
  const bufferPercentage = Math.min(100, Math.floor((text.length / 512) * 100)) || 0;

  return (
    <div className="px-8 pb-32 max-w-screen-xl mx-auto py-10">
      {/* Header Section */}
      <header className="mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
          [ VECTORIZE STORE: ONLINE ]
        </div>
        <h1 className="text-4xl lg:text-5xl font-headline font-bold text-on-surface tracking-tighter leading-tight">
          RAG Context Routing &amp;<br />Persona Configuration
        </h1>
        <p className="text-secondary max-w-2xl text-lg font-light leading-relaxed">
          Configure specific neural parameters and inject curated semantic memory into your spatial agents. All training data is isolated within your private enclave with end-to-end vector encryption.
        </p>
      </header>

      {/* Section 1: Target Identity Selector */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-outline font-headline">Section 01: Target Identity Selector</h3>
          <div className="h-[1px] flex-grow ml-4 bg-outline-variant/20"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NPCS.map((npc) => {
            const isSelected = selectedNpc.id === npc.id;
            return (
              <div
                key={npc.id}
                onClick={() => {
                  setSelectedNpc(npc);
                  setMessage(null);
                  setText("");
                }}
                className={`group relative p-6 rounded-xl transition-all cursor-pointer ${
                  isSelected 
                    ? `bg-surface-container-lowest border-2 ${npc.borderActive} shadow-xl ${npc.shadowActive}` 
                    : `bg-surface-container-low border border-outline-variant/20 hover:${npc.borderActive}`
                }`}
              >
                {isSelected && (
                  <div className={`absolute top-4 right-4 text-[10px] font-bold ${npc.badgeBg} ${npc.textActive} px-2 py-0.5 rounded`}>
                    ACTIVE
                  </div>
                )}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isSelected ? npc.bgActive : 'bg-surface-container-highest'}`}>
                  <span className={`material-symbols-outlined ${isSelected ? npc.textActive : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {npc.icon}
                  </span>
                </div>
                <h4 className="font-headline font-bold text-lg mb-1">{npc.name}</h4>
                <p className="text-xs text-secondary uppercase tracking-wider font-medium">[ NODE: {npc.role} ]</p>
                <div className="mt-4 text-xs text-on-surface-variant/60 leading-tight">{npc.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: D1 Parameter Overrides */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-outline font-headline">Section 02: D1 Parameter Overrides</h3>
          <div className="h-[1px] flex-grow ml-4 bg-outline-variant/20"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: System Prompt */}
          <div className="space-y-4">
            <label className="block text-sm font-bold font-headline text-on-surface">Custom System Prompt Override</label>
            <div className="bg-inverse-surface rounded-xl p-1">
              <textarea
                value={roleOverride}
                onChange={(e) => setRoleOverride(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-white font-mono text-sm p-4 h-48 resize-none placeholder:text-outline-variant/50 outline-none"
                placeholder="Enter Meta Llama 3 directives...&#10;Ex: System: Act as a high-seniority frontend architect. Focus on Atomic Design and strict TypeScript types."
              ></textarea>
            </div>
            <p className="text-[11px] text-secondary">Base Model: Meta Llama 3 (70B Instruct)</p>
          </div>

          {/* Column 2: Voice Identity */}
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm font-bold font-headline text-on-surface mb-2">
              <span>ElevenLabs Voice Identity Payload</span>
              <a href="https://elevenlabs.io/voice-library" target="_blank" rel="noreferrer" className="text-primary font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1 hover:underline">
                Find Voices <span className="material-symbols-outlined text-[12px]">open_in_new</span>
              </a>
            </label>
            <div className="bg-surface-container-high rounded-xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-secondary">Voice ID Hash</span>
                <span className="material-symbols-outlined text-secondary text-sm">info</span>
              </div>
              <input
                type="text"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full bg-surface-container-lowest border-none rounded-lg font-mono text-xs p-3 text-primary tracking-widest outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. CwhRBWXzGAHq8TQ4Fs17"
              />
              <div className="grid grid-cols-2 gap-4 pt-2 opacity-50 pointer-events-none">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-outline">Stability</span>
                  <input className="w-full accent-primary" type="range" defaultValue="50"/>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-outline">Clarity</span>
                  <input className="w-full accent-primary" type="range" defaultValue="80"/>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-tertiary-fixed rounded-lg">
              <span className="material-symbols-outlined text-on-tertiary-container">graphic_eq</span>
              <div className="flex-grow h-4 bg-white/50 rounded-full relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-[60%] bg-primary"></div>
              </div>
              <span className="text-[10px] font-bold text-on-tertiary-container">PREVIEW</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Semantic Context Injection */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-outline font-headline">Section 03: Semantic Context Injection</h3>
          <div className="h-[1px] flex-grow ml-4 bg-outline-variant/20"></div>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-[#2f3031] px-4 py-2 flex items-center justify-between border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-error/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/40"></div>
            </div>
            <div className="text-[10px] font-mono text-outline-variant uppercase">injection_buffer_v2.md</div>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-outline-variant text-[16px]">content_copy</span>
              <span className="material-symbols-outlined text-outline-variant text-[16px]">terminal</span>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-80 p-6 text-sm font-mono bg-[#1a1c1d] text-[#f4f3f4] outline-none border-none focus:ring-0 leading-relaxed resize-none"
            spellCheck="false"
            placeholder="# PROJECT_KAIROS_CONTEXT&#10;&#10;Inject logic, API endpoints, and specific memory context here..."
          ></textarea>
        </div>
      </section>

      {/* Section 4: Memory Bank */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-outline font-headline">Section 04: Memory Bank</h3>
          <div className="h-[1px] flex-grow ml-4 bg-outline-variant/20"></div>
        </div>
        
        {isLoadingKnowledge ? (
          <div className="text-[10px] font-mono text-secondary uppercase animate-pulse">Fetching memory blocks...</div>
        ) : knowledgeList.length === 0 ? (
          <div className="text-[11px] font-mono text-outline uppercase border border-outline-variant/20 p-8 rounded-xl text-center bg-surface-container-low/50">
            [ NO VECTOR DATA COMMITTED FOR THIS NODE ]
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledgeList.map((k) => (
              <div key={k.id} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">CHUNK_ID</p>
                    <h5 className="font-mono text-sm text-primary font-bold">V-{k.id.split('-')[0].toUpperCase()}</h5>
                  </div>
                  <div className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">COMMITTED</div>
                </div>
                <div className="bg-white rounded-lg p-3 h-32 overflow-y-auto scrollbar-hide border border-outline-variant/5">
                  <pre className="text-[11px] font-mono leading-tight text-secondary whitespace-pre-wrap font-inherit">
                    {k.content}
                  </pre>
                </div>
                <div className="flex justify-between items-center text-[10px] text-outline font-bold">
                  <span>TIMESTAMP: {new Date(k.createdAt).toISOString().replace('T', '_').substr(0, 19)}</span>
                  <span className="material-symbols-outlined text-[14px]">more_horiz</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Message Overlay */}
      {message && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-6 py-3 rounded-full text-xs font-bold font-mono shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
            message.type === "success" 
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
            : "bg-red-500/10 text-red-600 border-red-500/20"
          }`}>
            <span className="material-symbols-outlined text-[16px]">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            {message.text}
          </div>
        </div>
      )}

      {/* Bottom Action Floating Component (Contextual FAB) */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 items-end z-40">
        <div className="bg-surface-container-lowest shadow-2xl p-4 rounded-xl border border-outline-variant/20 max-w-xs animate-bounce-subtle">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface">Vector Buffer at {bufferPercentage}%</p>
              <p className="text-[10px] text-secondary">Awaiting EXECUTE command to finalize training epoch.</p>
            </div>
          </div>
        </div>
        <button 
          onClick={handleTrain}
          disabled={isSubmitting}
          className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold flex items-center gap-3 shadow-2xl hover:scale-[1.03] active:scale-95 transition-all group overflow-hidden relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">database</span>
          [ {isSubmitting ? 'EXECUTING...' : 'EXECUTE VECTOR COMMIT'} ]
          {isSubmitting && <div className="ml-2 w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
        </button>
      </div>
    </div>
  );
}
