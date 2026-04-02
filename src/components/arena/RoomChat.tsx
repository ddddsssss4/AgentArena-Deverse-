import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { emitChat, emitTalk } from "../../lib/socket";
import { useRealtimeKitMeeting } from "@cloudflare/realtimekit-react";

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

  const { meeting } = useRealtimeKitMeeting();

  const toggleVoice = async () => {
    if (!meeting) return;
    const isMicOn = voiceOn;
    
    if (isMicOn) {
      await meeting.self.disableAudio();
      setVoiceOn(false);
      emitTalk(false); // Tell everyone my character stopped talking
    } else {
      await meeting.self.enableAudio();
      setVoiceOn(true);
      emitTalk(true); // Tell everyone my character is now talking
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Panel */}
      {open && (
        <div
          className="w-80 rounded-3xl shadow-2xl overflow-hidden flex flex-col glass-morphism border border-outline-variant/20"
          style={{ background: "rgba(255, 255, 255, 0.95)", maxHeight: "420px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 bg-surface-container-lowest/50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-sm font-space font-bold text-on-surface tracking-tight">Room Sync</span>
            </div>
            {/* Voice toggle — shows clear muted/live state */}
            <div className="relative">
              {/* Pulsing ring when mic is LIVE */}
              {voiceOn && (
                <span className="absolute inset-0 rounded-xl bg-emerald-400/30 animate-ping" />
              )}
              <button
                onClick={toggleVoice}
                title={voiceOn ? "Mute voice" : "Enable voice chat"}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-widest transition-all ${
                  voiceOn
                    ? "bg-emerald-500 text-white border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    : "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {voiceOn ? "mic" : "mic_off"}
                </span>
                {voiceOn ? "Live" : "Muted"}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar" style={{ minHeight: "240px", maxHeight: "300px" }}>
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-40 select-none pb-4">
                <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant">forum</span>
                <p className="text-center font-body text-xs text-on-surface-variant max-w-[200px]">
                  Secure channel open. Say something!
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1 opacity-70" style={{ color: msg.isSelf ? "var(--color-primary)" : msg.color }}>
                  {msg.isSelf ? "You" : msg.from}
                </span>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm font-body leading-relaxed shadow-sm border ${
                    msg.isSelf
                      ? "bg-primary text-white border-primary rounded-br-none"
                      : "bg-surface-container-lowest text-on-surface border-outline-variant/20 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-outline-variant/10 bg-surface-container-lowest flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Transmit message..."
              className="flex-1 min-w-0 bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-outline-variant outline-none focus:ring-1 focus:ring-primary/30 border border-outline-variant/10 transition-all font-body"
            />
            <button
              onClick={sendChat}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all active:scale-95 bg-primary hover:bg-on-primary-fixed-variant shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-95 hover:scale-105 border ${
          open 
            ? "bg-surface-container-highest text-on-surface-variant border-outline-variant/20" 
            : "bg-primary text-white border-primary/20 hover:shadow-primary/20"
        }`}
        title="Toggle room chat"
      >
        <span className="material-symbols-outlined text-[24px]">
          {open ? "close" : "forum"}
        </span>
      </button>
    </div>
  );
}
