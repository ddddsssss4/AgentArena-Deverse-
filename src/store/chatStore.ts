import { create } from "zustand";

export interface ChatMessage {
  id: string;
  from: string;
  color: string;
  content: string;
  timestamp: number;
  isSelf?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, "id">) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: `${msg.timestamp}-${Math.random()}` },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
}));
