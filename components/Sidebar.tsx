
import React from 'react';
import { PlusIcon, MessageSquareIcon } from './icons';
import { type ChatHistory } from '../types';

interface SidebarProps {
  chats: ChatHistory[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ chats, activeChatId, onNewChat, onSelectChat }) => {
  return (
    <aside className="w-16 md:w-64 bg-[#1e1f20] p-2 md:p-4 flex flex-col h-full shrink-0">
      <button
        onClick={onNewChat}
        className="flex items-center justify-center md:justify-start gap-3 p-3 rounded-full md:rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors duration-200 w-full"
      >
        <PlusIcon className="w-5 h-5" />
        <span className="hidden md:inline">New Chat</span>
      </button>
      <div className="mt-6 flex-grow overflow-y-auto">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 hidden md:block">Recent</h2>
        <ul className="space-y-1">
          {chats.map((chat) => (
            <li key={chat.id}>
              <button
                onClick={() => onSelectChat(chat.id)}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm text-left w-full transition-colors duration-200 ${
                  chat.id === activeChatId ? 'bg-gray-700/80' : 'hover:bg-gray-700/50'
                }`}
                aria-current={chat.id === activeChatId}
              >
                <MessageSquareIcon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate hidden md:inline">{chat.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto border-t border-gray-700 pt-4">
        {/* User profile section can be added here */}
      </div>
    </aside>
  );
};
