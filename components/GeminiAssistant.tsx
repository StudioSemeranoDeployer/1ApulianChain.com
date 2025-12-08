import React, { useState, useRef, useEffect } from 'react';
import { Product, ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { Send, Sparkles, X, Loader2 } from 'lucide-react';
import { Chat } from "@google/genai";

interface GeminiAssistantProps {
  product: Product;
  onClose: () => void;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ product, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Buongiorno! I am your ApulianChain concierge. I know everything about this ${product.name}. Ask me about its origin, certifications, or how to pair it with food.`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    chatSessionRef.current = geminiService.createProductChat(product);
  }, [product]);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await geminiService.sendMessage(chatSessionRef.current, userMsg.text);
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
        console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-stone-200 z-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-olive-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <div>
            <h3 className="font-serif font-bold text-lg leading-none">Concierge</h3>
            <p className="text-xs text-olive-200">Powered by Gemini AI</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-olive-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-olive-600 text-white rounded-tr-sm' 
                  : 'bg-white text-stone-800 border border-stone-100 rounded-tl-sm'}
              `}
            >
              {msg.role === 'model' ? (
                 <div className="markdown-prose" dangerouslySetInnerHTML={{ 
                    __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^- (.*)/gm, '• $1')
                 }} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-stone-100">
              <Loader2 className="w-5 h-5 animate-spin text-olive-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-stone-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about recipes, origin..."
            className="w-full pl-4 pr-12 py-3 bg-stone-100 rounded-full text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:bg-white transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-olive-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-olive-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[10px] text-center text-stone-400 mt-2">
            AI can make mistakes. Verify important info.
        </div>
      </div>
    </div>
  );
};
