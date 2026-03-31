import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";

interface NPCChatModalProps {
  npcId: string;
  npcName: string;
  npcRole: string;
  npcColor: string;
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "npc" | "status";
  content: string;
  timestamp: Date;
}

type NpcStatus = "idle" | "thinking" | "speaking" | "ready" | "error";

export const NPCChatModal: React.FC<NPCChatModalProps> = ({
  npcId,
  npcName,
  npcRole,
  npcColor,
  onClose,
}) => {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<NpcStatus>("idle");
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioBufferRef = useRef<ArrayBuffer[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");

  // Initialize Web Speech API
  useEffect(() => {
    // @ts-expect-error - SpeechRecognition is missing from standard types
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        finalTranscriptRef.current = "";
        setIsListening(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        // Store in ref (immune to stale closure) & show live preview in input
        finalTranscriptRef.current = transcript;
        setInput(transcript);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      // Auto-send when recording stops
      recognition.onend = () => {
        setIsListening(false);
        const transcript = finalTranscriptRef.current.trim();
        if (transcript && wsRef.current?.readyState === WebSocket.OPEN) {
          setMessages((prev) => [
            ...prev,
            { role: "user", content: transcript, timestamp: new Date() },
          ]);
          setInput("");
          setStatus("thinking");
          audioBufferRef.current = [];
          wsRef.current.send(JSON.stringify({ type: "message", content: transcript }));
          finalTranscriptRef.current = "";
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser (try Chrome/Safari).");
      return;
    }
    if (isListening) {
      // Stopping will trigger onend which auto-sends
      recognitionRef.current.stop();
    } else {
      setInput("");
      recognitionRef.current.start();
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect to NPC WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const userId = user?.id || "anonymous";
    const wsUrl = `${protocol}//${host}/ws/npc/${npcId}?npcId=${npcId}&userId=${userId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = async (event) => {
      // Binary = audio chunk
      if (event.data instanceof Blob) {
        const arrayBuffer = await event.data.arrayBuffer();
        audioBufferRef.current.push(arrayBuffer);
        return;
      }

      if (typeof event.data !== "string") return;

      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(event.data) as Record<string, unknown>;
      } catch {
        return;
      }

      switch (msg.type) {
        case "text": {
          setMessages((prev) => [
            ...prev,
            {
              role: "npc",
              content: msg.content as string,
              timestamp: new Date(),
            },
          ]);
          break;
        }
        case "status": {
          setStatus(msg.status as NpcStatus);
          break;
        }
        case "audioEnd": {
          // Play collected audio chunks
          if (audioBufferRef.current.length > 0) {
            await playAudio(audioBufferRef.current);
            audioBufferRef.current = [];
          }
          setStatus("idle");
          break;
        }
        case "error": {
          setStatus("error");
          setMessages((prev) => [
            ...prev,
            {
              role: "status",
              content: `Error: ${msg.error as string}`,
              timestamp: new Date(),
            },
          ]);
          break;
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [npcId, user?.id]);

  const playAudio = useCallback(async (chunks: ArrayBuffer[]) => {
    try {
      // Create a single blob from all the binary chunks
      const blob = new Blob(chunks, { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setStatus("idle");
      };
      
      await audio.play();
    } catch (err) {
      console.error("Audio playback failed:", err);
      setStatus("idle");
    }
  }, []);

  const sendMessage = useCallback(() => {
    const msg = input.trim();
    if (!msg || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg, timestamp: new Date() },
    ]);
    setInput("");
    setStatus("thinking");
    audioBufferRef.current = [];

    wsRef.current.send(JSON.stringify({ type: "message", content: msg }));
  }, [input]);

  const statusLabel: Record<NpcStatus, string> = {
    idle: "Ready",
    thinking: "Thinking…",
    speaking: "Speaking…",
    ready: "Ready",
    error: "Error",
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-auto">
      <div
        className="mx-4 mb-4 rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/10"
          style={{ background: `${npcColor}15` }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: npcColor }}
            >
              {npcName[0]}
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">{npcName}</p>
              <p className="text-[10px] text-on-surface-variant">{npcRole}</p>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-outline-variant"}`}
              />
              <span className="text-[10px] text-on-surface-variant font-medium">
                {statusLabel[status]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Messages */}
        <div className="h-48 overflow-y-auto px-4 py-3 space-y-2">
          {messages.length === 0 && (
            <p className="text-center text-on-surface-variant text-xs mt-8">
              Say hi to {npcName}! Ask anything about {npcRole}.
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "status" ? (
                <p className="text-xs text-red-500 italic">{msg.content}</p>
              ) : (
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-surface-container text-on-surface rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          {status === "thinking" && (
            <div className="flex justify-start">
              <div className="bg-surface-container px-3 py-2 rounded-xl rounded-bl-sm flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-outline-variant/10 flex items-center gap-2">
          {/* Microphone Button */}
          <button
            onClick={toggleListening}
            title="Toggle voice input"
            disabled={status === "thinking" || status === "speaking"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shrink-0 ${
              isListening
                ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                : "bg-surface-container-high text-on-surface-variant hover:text-primary hover:bg-primary/10"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isListening ? "mic" : "mic_none"}
            </span>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={isListening ? "Listening…" : `Ask ${npcName} anything…`}
            disabled={status === "thinking" || status === "speaking"}
            className="flex-1 bg-surface-container-low rounded-xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 min-w-0"
          />
          
          <button
            onClick={sendMessage}
            disabled={!input.trim() || status === "thinking" || status === "speaking"}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-50 shrink-0"
            style={{ background: npcColor }}
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
