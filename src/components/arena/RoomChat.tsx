import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { emitChat } from "../../lib/socket";
import { enableVoice, disableVoice } from "../../lib/webrtc";

interface RoomChatProps {
  selfName: string;
  selfColor: string;
  isNearbyPlayer: boolean;
  isNpcChatActive: boolean;
}

export function RoomChat({ selfName, selfColor, isNearbyPlayer, isNpcChatActive }: RoomChatProps) {
  const [open, setOpen] = useState(false); // Default to closed (proximity-managed)
  const [input, setInput] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);

  // Proximity-based Auto-toggle
  useEffect(() => {
    if (isNpcChatActive) {
      setOpen(false);
    } else if (isNearbyPlayer) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isNearbyPlayer, isNpcChatActive]);
  const { messages, addMessage } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendChat = () => {
    const text = input.trim();
    if (!text) return;
    // Add to our own store as self-message (won't come back from server)
    addMessage({ from: selfName, color: selfColor, content: text, timestamp: Date.now(), isSelf: true });
    emitChat(text);
    setInput("");
  };

  const toggleVoice = async () => {
    if (voiceOn) {
      disableVoice();
      setVoiceOn(false);
    } else {
      await enableVoice();
      setVoiceOn(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center text-white transition-all active:scale-95 hover:scale-105"
        style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
        title="Toggle room chat"
      >
        <span className="material-symbols-outlined text-[22px]">
          {open ? "chat_bubble" : "chat_bubble_outline"}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="w-80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ background: "rgba(15,23,42,0.92)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "420px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white/90">Room Chat</span>
            </div>
            {/* Voice toggle */}
            <button
              onClick={toggleVoice}
              title={voiceOn ? "Mute voice" : "Enable voice chat"}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                voiceOn
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {voiceOn ? "mic" : "mic_none"}
              </span>
              {voiceOn ? "Live" : "Voice"}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ minHeight: "200px", maxHeight: "280px" }}>
            {messages.length === 0 && (
              <p className="text-center text-white/30 text-xs mt-6">
                No messages yet. Say something! 👋
              </p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}>
                <span className="text-[10px] font-semibold mb-0.5" style={{ color: msg.color }}>
                  {msg.isSelf ? "You" : msg.from}
                </span>
                <div
                  className="px-3 py-2 rounded-xl text-xs text-white max-w-[85%] leading-relaxed"
                  style={{
                    background: msg.isSelf
                      ? "linear-gradient(135deg,#6366f1,#a855f7)"
                      : "rgba(255,255,255,0.08)",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Send a message…"
              className="flex-1 min-w-0 bg-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
            />
            <button
              onClick={sendChat}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
