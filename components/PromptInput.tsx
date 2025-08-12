
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './icons';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt);
      setPrompt('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message Gemini..."
        rows={1}
        className="w-full bg-[#1e1f20] text-gray-200 placeholder-gray-500 rounded-lg py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none overflow-y-auto max-h-48"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        <SendIcon className={`w-5 h-5 ${isLoading ? 'text-gray-500' : 'text-gray-300'}`} />
      </button>
    </form>
  );
};
