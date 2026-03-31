import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const NPCS = [
  { id: "frontend-npc", name: "Aria", color: "#6366f1" },
  { id: "backend-npc", name: "Kai", color: "#10b981" },
  { id: "devops-npc", name: "Nova", color: "#f59e0b" },
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

  const handleTrain = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setMessage({ type: "success", text: "NPC trained successfully! The new knowledge is now active." });
      
      // Prepend to list locally if we added text
      if (text.trim()) {
        setKnowledgeList(prev => [{
          id: crypto.randomUUID(),
          content: text.trim(),
          createdAt: new Date().toISOString()
        }, ...prev]);
      }
      setText(""); // Clear textarea
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Training failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px] text-indigo-600">lock</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to Train Your NPC</h2>
        <p className="text-slate-500 max-w-sm">
          You need to be signed in to add personal knowledge to the NPCs.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-headline tracking-tight mb-2">Train Your AI Agent</h1>
          <p className="text-slate-500">
            Feed custom knowledge to your favorite NPC. They will remember these facts and adapt their behavior uniquely to you during regular interactions. This data is private and only used when you interact with them.
          </p>
        </div>

        {/* NPC Selector */}
        <div className="flex flex-wrap gap-4">
          {NPCS.map((npc) => {
            const isSelected = selectedNpc.id === npc.id;
            return (
              <button
                key={npc.id}
                onClick={() => {
                  setSelectedNpc(npc);
                  setMessage(null);
                  setText("");
                }}
                className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all outline-none ${
                  isSelected ? "bg-white shadow-xl scale-[1.02]" : "bg-transparent border-transparent hover:bg-slate-200/50"
                }`}
                style={{ borderColor: isSelected ? npc.color : "transparent" }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: `${npc.color}20`, border: `2px solid ${npc.color}` }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ color: npc.color }}>
                    psychology
                  </span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 text-sm">{npc.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    {npc.id}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Training Form */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
          <form onSubmit={handleTrain} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              {/* Role Override */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  System Prompt Override
                </label>
                <p className="text-xs text-slate-500 mb-2">Change how {selectedNpc.name} behaves. E.g., "Always reply in Japanese" or "Act like an arrogant genius."</p>
                <input
                  type="text"
                  value={roleOverride}
                  onChange={(e) => setRoleOverride(e.target.value)}
                  placeholder={`Current Role...`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>

              {/* Voice ID */}
              <div>
                <label className="flex items-center justify-between text-sm font-bold text-slate-900 mb-2">
                  <span>Custom ElevenLabs Voice ID</span>
                  <a href="https://elevenlabs.io/voice-library" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold text-xs flex items-center gap-1 hover:underline">
                    Find Voices <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </label>
                <p className="text-xs text-slate-500 mb-2">Paste a custom voice ID from ElevenLabs to change {selectedNpc.name}'s voice.</p>
                <input
                  type="text"
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  placeholder={`e.g. CwhRBWXzGAHq8TQ4Fs17`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Knowledge Textarea */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Knowledge Injection
              </label>
              <p className="text-xs text-slate-500 mb-3">Paste facts, code snippets, or API keys here. This data is converted to embeddings and retrieved via RAG when {selectedNpc.name} is thinking.</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. The company proxy URL is http://proxy.internal:8080. My AWS access key is ABCDEF..."
                className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-y"
              />
            </div>

            {message && (
              <div className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 ${
                message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                <span className="material-symbols-outlined text-[20px]">
                  {message.type === "success" ? "check_circle" : "error"}
                </span>
                {message.text}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-900/20"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                )}
                {isSubmitting ? "Training..." : "Save & Train"}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Knowledge */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400">inventory_2</span>
            Injected Memory Bank
          </h2>
          
          {isLoadingKnowledge ? (
            <div className="text-center py-8 text-slate-400 font-mono text-xs">Loading memories...</div>
          ) : knowledgeList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-sm text-slate-500">
              No custom knowledge injected yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledgeList.map((k) => (
                <div key={k.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedNpc.color }}></span>
                    Added {new Date(k.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-slate-700 line-clamp-4 leading-relaxed font-mono">
                    {k.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
