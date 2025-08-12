
export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
}
