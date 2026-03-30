import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

const NPC_COLORS: Record<string, string> = {
  "frontend-npc": "#6366f1",
  "backend-npc": "#10b981",
  "devops-npc": "#f59e0b",
};

const NPC_NAMES: Record<string, string> = {
  "frontend-npc": "Aria",
  "backend-npc": "Kai",
  "devops-npc": "Nova",
};

interface ChatTurn {
  id: string;
  userId: string;
  npcId: string;
  role: "user" | "npc";
  content: string;
  createdAt: string | number;
}

interface ConversationGroup {
  npcId: string;
  npcName: string;
  color: string;
  turns: ChatTurn[];
  lastMessage: string;
  lastDate: Date;
}

function groupByNpc(turns: ChatTurn[]): ConversationGroup[] {
  const map = new Map<string, ChatTurn[]>();
  for (const turn of turns) {
    const existing = map.get(turn.npcId) ?? [];
    map.set(turn.npcId, [...existing, turn]);
  }

  return Array.from(map.entries()).map(([npcId, npcTurns]) => {
    const sorted = [...npcTurns].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const last = sorted[sorted.length - 1];
    return {
      npcId,
      npcName: NPC_NAMES[npcId] ?? npcId,
      color: NPC_COLORS[npcId] ?? "#6366f1",
      turns: sorted,
      lastMessage: last.content.slice(0, 100),
      lastDate: new Date(last.createdAt),
    };
  }).sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatHistory() {
  const { token } = useAuthStore();
  const [groups, setGroups] = useState<ConversationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNpc, setExpandedNpc] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/chat-history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const turns = (await res.json()) as ChatTurn[];
        setGroups(groupByNpc(turns));
      } catch {}
      finally { setIsLoading(false); }
    };
    load();
  }, [token]);

  const filtered = groups.filter((g) =>
    searchQuery
      ? g.npcName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.turns.some((t) => t.content.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  return (
    <div className="px-6 lg:px-12 max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tight text-on-surface">
            Chat History
          </h1>
          <p className="text-on-surface-variant mt-2">
            Your past conversations with AI developers.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-surface-container-lowest rounded-full border border-outline-variant/20 focus:outline-none focus:border-primary/50 text-sm w-64"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 p-16 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">chat_bubble_outline</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">No conversations yet</h3>
          <p className="text-on-surface-variant text-sm">
            Walk up to Aria, Kai, or Nova in the Global Arena and press T to start talking.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 overflow-hidden soft-atrium-shadow">
          <div className="divide-y divide-outline-variant/10">
            {filtered.map((group) => (
              <div key={group.npcId}>
                {/* Group row */}
                <button
                  onClick={() => setExpandedNpc(expandedNpc === group.npcId ? null : group.npcId)}
                  className="w-full block p-6 hover:bg-surface-container-low/50 transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: group.color }}
                      >
                        {group.npcName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-on-surface">{group.npcName}</h3>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                            style={{ background: group.color }}
                          >
                            {group.turns.length} messages
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-sm line-clamp-1">{group.lastMessage}</p>
                        <p className="text-[10px] text-outline mt-1">{formatDate(group.lastDate)}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant transition-transform" style={{ transform: expandedNpc === group.npcId ? "rotate(180deg)" : "none" }}>
                      expand_more
                    </span>
                  </div>
                </button>

                {/* Expanded conversation */}
                {expandedNpc === group.npcId && (
                  <div className="px-6 pb-6 bg-surface-container/30">
                    <div className="space-y-3 max-h-64 overflow-y-auto pt-2">
                      {group.turns.map((turn) => (
                        <div key={turn.id} className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                              turn.role === "user"
                                ? "bg-primary text-white rounded-br-sm"
                                : "bg-surface-container text-on-surface rounded-bl-sm"
                            }`}
                          >
                            {turn.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
