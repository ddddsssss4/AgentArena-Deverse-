import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import {
  ConversationProvider,
  useConversationControls,
  useConversationStatus,
} from "@elevenlabs/react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AgentData {
  userId: string;
  agentId: string;
  voiceId: string;
  name: string;
  createdAt: string;
}

type WizardStep = "voice" | "knowledge" | "config" | "live";

// ─── Conversation Widget ────────────────────────────────────────────────────

function ConversationWidget({ agentId, agentName }: { agentId: string; agentName: string }) {
  const { startSession, endSession } = useConversationControls();
  const { status } = useConversationStatus();

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  const handleToggle = async () => {
    if (isConnected) {
      await endSession();
    } else {
      await startSession({ agentId });
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Orb */}
      <div className="relative">
        <div
          className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-700 ${
            isConnected
              ? "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_80px_rgba(16,185,129,0.4)] animate-pulse"
              : isConnecting
              ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_60px_rgba(245,158,11,0.3)] animate-pulse"
              : "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
          }`}
        >
          <span
            className="material-symbols-outlined text-white text-[48px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isConnected ? "graphic_eq" : isConnecting ? "sync" : "mic"}
          </span>
        </div>
        {isConnected && (
          <div className="absolute -inset-4 rounded-full border-2 border-emerald-400/30 animate-ping" />
        )}
      </div>

      {/* Status */}
      <div className="text-center space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-outline font-headline">
          {isConnected
            ? "LIVE — SPEAK NOW"
            : isConnecting
            ? "ESTABLISHING CONNECTION..."
            : `READY TO TALK TO ${agentName.toUpperCase()}`}
        </p>
        <p className="text-[10px] text-secondary">
          {isConnected
            ? "Your agent is listening. Speak naturally."
            : "Click the button below to start a voice conversation."}
        </p>
      </div>

      {/* Control */}
      <button
        onClick={handleToggle}
        disabled={isConnecting}
        className={`px-10 py-4 rounded-full font-headline font-bold text-sm flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl ${
          isConnected
            ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
            : "bg-primary text-on-primary hover:opacity-90 shadow-primary/20"
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">
          {isConnected ? "call_end" : "call"}
        </span>
        {isConnected ? "End Conversation" : isConnecting ? "Connecting..." : "Start Conversation"}
      </button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function CreateNPC() {
  const { token, user } = useAuthStore();

  // Agent state
  const [existingAgent, setExistingAgent] = useState<AgentData | null>(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);

  // Wizard state
  const [step, setStep] = useState<WizardStep>("voice");

  // Step 1 — Voice
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [voiceName, setVoiceName] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [isCloningVoice, setIsCloningVoice] = useState(false);

  // Step 2 — Knowledge
  const [knowledgeText, setKnowledgeText] = useState("");

  // Step 3 — Config
  const [agentName, setAgentName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Status messages
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch existing agent on mount ──────────────────────────────────────

  useEffect(() => {
    async function fetchAgent() {
      if (!token) return;
      try {
        const res = await fetch("/api/agent/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = (await res.json()) as { agent: AgentData | null };
          setExistingAgent(data.agent);
        }
      } catch (err) {
        console.error("Failed to fetch agent:", err);
      } finally {
        setIsLoadingAgent(false);
      }
    }
    fetchAgent();
  }, [token]);

  // ── Voice Cloning ──────────────────────────────────────────────────────

  const handleCloneVoice = useCallback(async () => {
    if (!audioFile || !voiceName.trim() || !token) return;

    setIsCloningVoice(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("name", voiceName.trim());

      const res = await fetch("/api/agent/clone-voice", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Voice cloning failed");

      const data = (await res.json()) as { voiceId: string };
      setVoiceId(data.voiceId);
      setMessage({ type: "success", text: `Voice cloned successfully! ID: ${data.voiceId.slice(0, 12)}...` });
      setStep("knowledge");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Cloning failed" });
    } finally {
      setIsCloningVoice(false);
    }
  }, [audioFile, voiceName, token]);

  // ── Create Agent ───────────────────────────────────────────────────────

  const handleCreateAgent = useCallback(async () => {
    if (!token || !voiceId || !agentName.trim() || !systemPrompt.trim()) return;

    setIsCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/agent/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: agentName.trim(),
          systemPrompt: systemPrompt.trim(),
          firstMessage: firstMessage.trim() || undefined,
          voiceId,
          knowledgeText: knowledgeText.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json() as { details?: string; error?: string };
        throw new Error(errData.details || errData.error || "Agent creation failed");
      }

      const data = (await res.json()) as { agentId: string };
      setExistingAgent({
        userId: user?.id || "",
        agentId: data.agentId,
        voiceId,
        name: agentName.trim(),
        createdAt: new Date().toISOString(),
      });
      setStep("live");
      setMessage({ type: "success", text: "Agent deployed! Start talking." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Creation failed" });
    } finally {
      setIsCreating(false);
    }
  }, [token, voiceId, agentName, systemPrompt, firstMessage, knowledgeText, user?.id]);

  // ── Delete Agent ───────────────────────────────────────────────────────

  const handleDeleteAgent = useCallback(async () => {
    if (!token) return;
    setIsDeleting(true);
    try {
      await fetch("/api/agent/mine", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setExistingAgent(null);
      setStep("voice");
      setVoiceId("");
      setAudioFile(null);
      setVoiceName("");
      setKnowledgeText("");
      setAgentName("");
      setSystemPrompt("");
      setFirstMessage("");
      setMessage({ type: "success", text: "Agent deleted successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to delete agent" });
    } finally {
      setIsDeleting(false);
    }
  }, [token]);

  // ── Auth guard ─────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[calc(100vh-5rem)]">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[32px] text-primary">lock</span>
        </div>
        <h2 className="text-2xl font-bold font-headline text-on-surface mb-2 tracking-tight">Access Restricted</h2>
        <p className="text-on-surface-variant max-w-sm mb-6 leading-relaxed">
          Sign in to create your personalized conversational AI agent with voice cloning.
        </p>
      </div>
    );
  }

  if (isLoadingAgent) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm font-medium">Loading agent data…</p>
        </div>
      </div>
    );
  }

  // ── If user already has an agent, show it ──────────────────────────────

  if (existingAgent) {
    return (
      <div className="px-8 pb-32 max-w-screen-lg mx-auto py-10">
        <header className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            [ AGENT: DEPLOYED ]
          </div>
          <h1 className="text-4xl lg:text-5xl font-headline font-bold text-on-surface tracking-tighter leading-tight">
            {existingAgent.name}
          </h1>
          <p className="text-secondary max-w-2xl text-lg font-light leading-relaxed">
            Your personalized conversational agent is live. Start a voice conversation below.
          </p>
        </header>

        {/* Agent Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">AGENT ID</p>
            <p className="font-mono text-sm text-primary font-bold truncate">{existingAgent.agentId}</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">VOICE ID</p>
            <p className="font-mono text-sm text-primary font-bold truncate">{existingAgent.voiceId}</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">CREATED</p>
            <p className="font-mono text-sm text-secondary font-bold">
              {new Date(existingAgent.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Conversation Widget */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-outline font-headline">
              Voice Conversation
            </h3>
            <div className="h-[1px] flex-grow ml-4 bg-outline-variant/20" />
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-12 shadow-xl border border-outline-variant/10">
            <ConversationProvider>
              <ConversationWidget agentId={existingAgent.agentId} agentName={existingAgent.name} />
            </ConversationProvider>
          </div>
        </section>

        {/* Delete button */}
        <div className="flex justify-end">
          <button
            onClick={handleDeleteAgent}
            disabled={isDeleting}
            className="px-6 py-3 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 font-bold text-xs hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            {isDeleting ? "Deleting..." : "Delete Agent & Start Over"}
          </button>
        </div>

        {/* Message Toast */}
        {message && <MessageToast message={message} />}
      </div>
    );
  }

  // ── Wizard Flow ────────────────────────────────────────────────────────

  const steps: { id: WizardStep; label: string; icon: string; num: string }[] = [
    { id: "voice", label: "Voice Clone", icon: "record_voice_over", num: "01" },
    { id: "knowledge", label: "Knowledge Base", icon: "menu_book", num: "02" },
    { id: "config", label: "Configure", icon: "tune", num: "03" },
    { id: "live", label: "Go Live", icon: "call", num: "04" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="px-8 pb-32 max-w-screen-lg mx-auto py-10">
      {/* Header */}
      <header className="mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse" />
          [ AGENT BUILDER ]
        </div>
        <h1 className="text-4xl lg:text-5xl font-headline font-bold text-on-surface tracking-tighter leading-tight">
          Create Your NPC
        </h1>
        <p className="text-secondary max-w-2xl text-lg font-light leading-relaxed">
          Build a personalized conversational agent with your own cloned voice and custom knowledge base.
        </p>
      </header>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-12">
        {steps.map((s, i) => {
          const isActive = i === currentStepIndex;
          const isDone = i < currentStepIndex;
          return (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => {
                  if (isDone) setStep(s.id);
                }}
                disabled={!isDone}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full ${
                  isActive
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                    : isDone
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20"
                    : "bg-surface-container-low text-on-surface-variant/40 border border-outline-variant/10"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isDone ? "check_circle" : s.icon}
                </span>
                <div className="text-left min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">Step {s.num}</p>
                  <p className="text-xs font-bold truncate">{s.label}</p>
                </div>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`w-6 h-[2px] flex-shrink-0 ${
                    isDone ? "bg-emerald-400" : "bg-outline-variant/20"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: Voice Cloning ───────────────────────────────────────── */}
      {step === "voice" && (
        <section className="space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-outline font-headline">
              Step 01: Instant Voice Clone
            </h3>
            <div className="h-[1px] flex-grow ml-4 bg-outline-variant/20" />
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-xl border border-outline-variant/10 space-y-8">
            {/* Voice Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold font-headline text-on-surface">Voice Identity Name</label>
              <input
                type="text"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="e.g. My Custom Agent Voice"
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 border border-outline-variant/10 transition-all"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold font-headline text-on-surface">Voice Sample (MP3/WAV)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5 ${
                  audioFile ? "border-emerald-500/30 bg-emerald-50/50" : "border-outline-variant/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/mp3,audio/wav,audio/mpeg,audio/webm,.mp3,.wav"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setAudioFile(file);
                  }}
                />
                <span
                  className={`material-symbols-outlined text-[40px] mb-3 block ${
                    audioFile ? "text-emerald-500" : "text-outline-variant"
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {audioFile ? "check_circle" : "upload_file"}
                </span>
                {audioFile ? (
                  <>
                    <p className="font-bold text-emerald-600 text-sm">{audioFile.name}</p>
                    <p className="text-[10px] text-secondary mt-1">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB — Click to replace
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-on-surface-variant">
                      Drop or click to upload a voice sample
                    </p>
                    <p className="text-[10px] text-secondary mt-1">
                      30 seconds to 5 minutes of clear speech recommended. Max 10MB.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Clone Button */}
            <button
              onClick={handleCloneVoice}
              disabled={!audioFile || !voiceName.trim() || isCloningVoice}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold flex items-center justify-center gap-3 shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCloningVoice ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Cloning Voice...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">record_voice_over</span>
                  Clone Voice
                </>
              )}
            </button>

            {voiceId && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <div>
                  <p className="font-bold text-sm text-emerald-700">Voice Cloned Successfully</p>
                  <p className="text-[10px] text-emerald-600 font-mono">{voiceId}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── STEP 2: Knowledge Base ──────────────────────────────────────── */}
      {step === "knowledge" && (
        <section className="space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-outline font-headline">
              Step 02: RAG Knowledge Base
            </h3>
            <div className="h-[1px] flex-grow ml-4 bg-outline-variant/20" />
          </div>

          <div className="space-y-4">
            <p className="text-sm text-secondary leading-relaxed">
              Paste information your agent should know about. This could be product docs, FAQs, company info, or any
              context that helps your agent answer questions accurately.
            </p>

            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-[#2f3031] px-4 py-2 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-error/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/40" />
                </div>
                <div className="text-[10px] font-mono text-outline-variant uppercase">knowledge_base.md</div>
                <div className="text-[10px] font-mono text-outline-variant">
                  {knowledgeText.length.toLocaleString()} chars
                </div>
              </div>
              <textarea
                value={knowledgeText}
                onChange={(e) => setKnowledgeText(e.target.value)}
                className="w-full h-80 p-6 text-sm font-mono bg-[#1a1c1d] text-[#f4f3f4] outline-none border-none focus:ring-0 leading-relaxed resize-none"
                spellCheck="false"
                placeholder={`# Your Agent's Knowledge Base\n\nPaste information here that your agent should reference...\n\nExample:\n- Company policies and procedures\n- Product documentation\n- Technical specifications\n- FAQs and support articles`}
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-[10px] text-secondary">
                <span className="font-bold">Tip:</span> More detailed content = better agent responses. Min 500 chars
                recommended.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("voice")}
                  className="px-6 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold text-xs hover:bg-surface-container transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("config")}
                  className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                >
                  Continue
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── STEP 3: Agent Configuration ─────────────────────────────────── */}
      {step === "config" && (
        <section className="space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-outline font-headline">
              Step 03: Agent Configuration
            </h3>
            <div className="h-[1px] flex-grow ml-4 bg-outline-variant/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold font-headline text-on-surface">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Atlas, Luna, Echo..."
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 border border-outline-variant/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold font-headline text-on-surface">First Message</label>
                <input
                  type="text"
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="What the agent says when a conversation starts..."
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 border border-outline-variant/10 transition-all"
                />
                <p className="text-[10px] text-secondary">Leave blank for a default greeting.</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              <label className="text-sm font-bold font-headline text-on-surface">System Prompt</label>
              <div className="bg-inverse-surface rounded-xl p-1">
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-white font-mono text-sm p-4 h-48 resize-none placeholder:text-outline-variant/50 outline-none"
                  placeholder={`Define your agent's personality and behavior...\n\nExample: You are a helpful customer support agent for Acme Corp. Be friendly, concise, and always reference the knowledge base when answering questions.`}
                />
              </div>
              <p className="text-[10px] text-secondary">
                This defines how your agent behaves in every conversation.
              </p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-outline font-headline">
              Configuration Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryItem label="Voice" value={voiceId ? `✓ Cloned` : "—"} ok={!!voiceId} />
              <SummaryItem
                label="Knowledge"
                value={knowledgeText.length > 0 ? `${knowledgeText.length} chars` : "None (optional)"}
                ok={true}
              />
              <SummaryItem label="Name" value={agentName || "—"} ok={!!agentName.trim()} />
              <SummaryItem label="Prompt" value={systemPrompt ? `${systemPrompt.length} chars` : "—"} ok={!!systemPrompt.trim()} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep("knowledge")}
              className="px-6 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold text-xs hover:bg-surface-container transition-all"
            >
              Back
            </button>
            <button
              onClick={handleCreateAgent}
              disabled={!agentName.trim() || !systemPrompt.trim() || !voiceId || isCreating}
              className="px-10 py-4 rounded-xl bg-primary text-on-primary font-headline font-bold flex items-center gap-3 shadow-2xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Deploying Agent...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Deploy Agent
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 4: Live Conversation ──────────────────────────────────── */}
      {step === "live" && existingAgent && (
        <section className="space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-outline font-headline">
              Step 04: Live Conversation
            </h3>
            <div className="h-[1px] flex-grow ml-4 bg-outline-variant/20" />
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-12 shadow-xl border border-outline-variant/10">
            <ConversationProvider>
              <ConversationWidget agentId={existingAgent.agentId} agentName={existingAgent.name} />
            </ConversationProvider>
          </div>
        </section>
      )}

      {/* Message Toast */}
      {message && <MessageToast message={message} />}
    </div>
  );
}

// ─── Utility Components ─────────────────────────────────────────────────────

function SummaryItem({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-outline uppercase tracking-wider">{label}</p>
      <p className={`text-xs font-bold ${ok ? "text-emerald-600" : "text-outline-variant"}`}>{value}</p>
    </div>
  );
}

function MessageToast({ message }: { message: { type: "success" | "error"; text: string } }) {
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`px-6 py-3 rounded-full text-xs font-bold font-mono shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
          message.type === "success"
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            : "bg-red-500/10 text-red-600 border-red-500/20"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">
          {message.type === "success" ? "check_circle" : "error"}
        </span>
        {message.text}
      </div>
    </div>
  );
}
