import React, { useEffect } from 'react';
import { X, Command, Move, MousePointerClick, Type, Sparkles, MessageSquare, Mic } from 'lucide-react';

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections = [
    {
      title: "Movement & Navigation",
      items: [
        { keys: ["W", "A", "S", "D"], label: "Walk around the arena", icon: Move },
        { keys: ["Space"], label: "Wave to other developers", icon: Sparkles },
        { keys: ["Double Click"], label: "Teleport to surface", icon: MousePointerClick },
      ]
    },
    {
      title: "Interaction",
      items: [
        { keys: ["T"], label: "Start conversation with NPC", icon: MessageSquare },
        { keys: ["V"], label: "Toggle voice input (in chat)", icon: Mic },
        { keys: ["Enter"], label: "Send message", icon: Type },
      ]
    },
    {
      title: "System",
      items: [
        { keys: ["Ctrl", "/"], label: "Toggle this guide", icon: Command },
        { keys: ["Esc"], label: "Close current dialog", icon: X },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Command className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-space font-bold text-xl text-zinc-900 tracking-tight">Shortcuts Guide</h2>
              <p className="text-sm font-body text-zinc-500">Master the spatial workspace</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-200/50 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-space">{section.title}</h3>
              <div className="grid gap-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-body text-zinc-600 group-hover:text-zinc-900 transition-colors">{item.label}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {item.keys.map((key) => (
                        <kbd key={key} className="min-w-[24px] h-7 px-1.5 flex items-center justify-center bg-zinc-100 border-b-2 border-zinc-300 rounded text-[10px] font-bold text-zinc-700 font-mono">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center">
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">v2.4.0-stable build</p>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold font-space hover:bg-zinc-800 transition-all active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
