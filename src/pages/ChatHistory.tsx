import { Link } from "react-router-dom";

export default function ChatHistory() {
  const history = [
    {
      id: 1,
      title: "Data Migration Sync",
      participants: ["Alex Mercer", "You"],
      date: "Yesterday, 2:30 PM",
      preview: "I recall we were discussing the sharding strategy for the user analytics table...",
      tags: ["Project Phoenix", "Database"],
      status: "resolved",
    },
    {
      id: 2,
      title: "UI/UX Review: Arena Dashboard",
      participants: ["Sarah Chen", "You", "AI Assistant"],
      date: "Oct 24, 10:00 AM",
      preview: "Let's make sure the 3D canvas doesn't block the main interaction points...",
      tags: ["Design", "Frontend"],
      status: "open",
    },
    {
      id: 3,
      title: "Weekly Standup",
      participants: ["Team Alpha"],
      date: "Oct 23, 9:00 AM",
      preview: "Updates on the new authentication flow and API rate limiting...",
      tags: ["Standup"],
      status: "resolved",
    },
    {
      id: 4,
      title: "Brainstorming: New Features",
      participants: ["You", "AI Assistant"],
      date: "Oct 20, 4:15 PM",
      preview: "What if we added a voice-to-text feature for the Arena environment?",
      tags: ["Ideas", "AI"],
      status: "open",
    },
  ];

  return (
    <div className="px-6 lg:px-12 max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tight text-on-surface">
            Chat History
          </h1>
          <p className="text-on-surface-variant mt-2">
            Review past conversations and continue where you left off.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Search history..."
              className="pl-12 pr-4 py-3 bg-surface-container-lowest rounded-full border border-outline-variant/20 focus:outline-none focus:border-primary/50 text-sm w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-surface-container-lowest rounded-full border border-outline-variant/20 hover:bg-surface-container-low transition-colors text-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filter
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 overflow-hidden soft-atrium-shadow">
        <div className="divide-y divide-outline-variant/10">
          {history.map((chat) => (
            <Link
              key={chat.id}
              to={`/chat/${chat.id}`}
              className="block p-6 hover:bg-surface-container-low/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      {chat.title}
                    </h3>
                    {chat.status === "open" && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary-container text-on-secondary-container">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-sm line-clamp-1 mb-3">
                    {chat.preview}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">group</span>
                      {chat.participants.join(", ")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {chat.date}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between h-full">
                  <div className="flex gap-2">
                    {chat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md bg-surface-container text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors mt-4">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
