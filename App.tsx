
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { type Message, type ChatHistory } from './types';

const App: React.FC = () => {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatSessionCache = useRef<Record<string, Chat>>({});
  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
      console.error(e);
      setError("Failed to initialize AI. Please check your API key.");
    }
  }, []);

  const getOrCreateChatSession = (chatId: string) => {
    if (!aiRef.current) {
      setError("AI not initialized.");
      return null;
    }

    if (chatSessionCache.current[chatId]) {
      return chatSessionCache.current[chatId];
    }

    const history = chatHistories
      .find(c => c.id === chatId)?.messages
      .map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      })) ?? [];

    const chat = aiRef.current.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: 'You are a helpful and creative assistant. Format your responses using markdown-like syntax for bold text (**text**), and code blocks (```language\ncode\n```).',
      }
    });

    chatSessionCache.current[chatId] = chat;
    return chat;
  };

  const handleSendMessage = async (prompt: string) => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);

    let currentChatId = activeChatId;
    let isNewChat = false;

    // If no active chat, or active chat is empty, create a new one.
    if (!currentChatId || chatHistories.find(c => c.id === currentChatId)?.messages.length === 0) {
      isNewChat = true;
      const newId = `chat_${Date.now()}`;
      if (!currentChatId) {
        const newChat: ChatHistory = { id: newId, title: "New Chat", messages: [] };
        setChatHistories(prev => [newChat, ...prev.filter(c => c.messages.length > 0)]); // Add new, remove old empty chats
        setActiveChatId(newId);
        currentChatId = newId;
      } else {
        // The active chat is empty, mark it as a new chat for title generation
        currentChatId = activeChatId;
      }
    }

    const userMessage: Message = { role: 'user', content: prompt };

    setChatHistories(prev => prev.map(chat =>
      chat.id === currentChatId
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ));

    const chatSession = getOrCreateChatSession(currentChatId);
    if (!chatSession) {
      setIsLoading(false);
      return;
    }

    try {
      const stream = await chatSession.sendMessageStream({ message: prompt });

      setChatHistories(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, { role: 'model', content: '' }] }
          : chat
      ));

      let modelResponse = '';
      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setChatHistories(prev => prev.map(chat => {
          if (chat.id === currentChatId) {
            const newMessages = [...chat.messages];
            newMessages[newMessages.length - 1].content = modelResponse;
            return { ...chat, messages: newMessages };
          }
          return chat;
        }));
      }
      
      if (isNewChat) {
        const newTitle = prompt.length > 40 ? prompt.substring(0, 37) + '...' : prompt;
        setChatHistories(prev => prev.map(chat =>
          chat.id === currentChatId ? { ...chat, title: newTitle } : chat
        ));
      }
    } catch (e: any) {
      console.error(e);
      setError(`Failed to get response. ${e.message || 'Please try again.'}`);
      setChatHistories(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: chat.messages.slice(0, -1) } // Remove model placeholder
          : chat
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    // Prevent creating multiple empty "New Chat" entries
    if (activeChatId && chatHistories.find(c => c.id === activeChatId)?.messages.length === 0) {
        return;
    }
    const newId = `chat_${Date.now()}`;
    const newChat: ChatHistory = { id: newId, title: "New Chat", messages: [] };
    setChatHistories(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    setError(null);
  };

  const handleSelectChat = (id: string) => {
    if (isLoading) return;
    setActiveChatId(id);
    setError(null);
  };

  const activeChatMessages = chatHistories.find(c => c.id === activeChatId)?.messages ?? [];

  return (
    <div className="flex h-screen w-full bg-[#131314] text-gray-200 font-sans">
      <Sidebar
        chats={chatHistories}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <main className="flex-1 flex flex-col h-screen">
        <ChatWindow
          messages={activeChatMessages}
          isLoading={isLoading}
          error={error}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
};

export default App;
