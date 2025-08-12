import React, { useEffect, useRef } from 'react';
import { type Message } from '../types';
import { PromptInput } from './PromptInput';
import { MessageRenderer } from './MessageRenderer';
import { UserIcon, GeminiIcon, CompassIcon, LightbulbIcon, MessageSquareIcon, CodeIcon } from './icons';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (prompt: string) => void;
}

const WelcomeScreen: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => {
  const promptCards = [
    {
      icon: <CompassIcon />,
      title: "Suggest beautiful places to see on an upcoming road trip",
      prompt: "I'm planning a road trip up the coast of California. Suggest 5 beautiful and unique places to stop.",
    },
    {
      icon: <LightbulbIcon />,
      title: "Briefly summarize this concept: urban planning",
      prompt: "Briefly summarize the core concepts of urban planning.",
    },
    {
      icon: <MessageSquareIcon />,
      title: "Brainstorm team bonding activities for our work retreat",
      prompt: "We're a remote software team having a work retreat. Brainstorm some fun and effective team bonding activities.",
    },
    {
      icon: <CodeIcon />,
      title: "Tell me something fun about the Roman Empire",
      prompt: "Tell me a surprising or fun fact about the Roman Empire.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Hello, Abhay</span>
      </h1>
      <p className="mt-2 text-xl text-gray-400">How can I help you today?</p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        {promptCards.map((card, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(card.prompt)}
            className="p-4 bg-[#1e1f20] hover:bg-gray-700 rounded-lg text-left transition-colors duration-200 flex items-start gap-4"
          >
            <div className="p-2 bg-gray-700 rounded-full">{card.icon}</div>
            <span className="text-gray-300 text-sm">{card.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, error, onSendMessage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-8">
        {messages.length === 0 ? (
          <WelcomeScreen onPromptClick={onSendMessage} />
        ) : (
          <div className="space-y-8">
            {messages.map((msg, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-700">
                  {msg.role === 'user' ? <UserIcon /> : <GeminiIcon />}
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-gray-300 mb-2">{msg.role === 'user' ? 'You' : 'Gemini'}</p>
                  <MessageRenderer content={msg.content} />
                   {isLoading && index === messages.length - 1 && msg.role === 'model' && (
                     <div className="inline-block w-2 h-4 bg-gray-300 ml-1 animate-pulse" />
                   )}
                </div>
              </div>
            ))}
            {error && <div className="text-red-400 text-center py-4">{error}</div>}
          </div>
        )}
      </div>
      <div className="py-4">
        <PromptInput onSubmit={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};