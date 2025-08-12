
import React from 'react';

interface MessageRendererProps {
  content: string;
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black/80 rounded-lg my-4">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800/50 rounded-t-lg">
        <span className="text-xs text-gray-400">{language || 'code'}</span>
        <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-white transition-colors">
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const TextBlock: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g); // Split by bold tags
    return (
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-semibold text-gray-200">{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </p>
    );
};

export const MessageRenderer: React.FC<MessageRendererProps> = ({ content }) => {
  const parts = content.split(/```(\w*)\n([\s\S]*?)\n```/g);

  return (
    <div className="prose prose-invert max-w-none">
      {parts.map((part, index) => {
        if (index % 3 === 2) { // This is the code content
          const language = parts[index - 1]; // This is the language
          return <CodeBlock key={index} language={language} code={part.trim()} />;
        }
        if (index % 3 === 0 && part.trim()) { // This is regular text
          return <TextBlock key={index} text={part} />;
        }
        return null;
      })}
    </div>
  );
};
