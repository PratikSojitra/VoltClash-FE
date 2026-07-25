import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap } from 'lucide-react';
import { useAIChat } from '@/hooks/useClashQuery';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
}

interface AIAssistantTabProps {
  playerTag: string;
}

export default function AIAssistantTab({ playerTag }: AIAssistantTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const chatMutation = useAIChat(playerTag);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');

    chatMutation.mutate(newMessages, {
      onSuccess: (data) => {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
      },
      onError: (err) => {
        console.error("Chat error:", err);
        setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I ran into an error processing that request. Please try again." }]);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-card rounded-3xl border border-border overflow-hidden shadow-2xl relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-border/50 bg-card/50 backdrop-blur-sm z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
          <Zap className="w-6 h-6 text-white fill-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">VoltAI</h2>
          <p className="text-sm text-muted-foreground">Your personal village strategist</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">How can I help you?</h3>
              <p className="text-muted-foreground leading-relaxed">
                I can analyze your active builders, lab research, and current layout to recommend the most optimal upgrade path. I can even queue them up directly into your Planner!
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => setInput("What should I upgrade next?")} className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium transition-colors border border-border">
                "What should I upgrade next?"
              </button>
              <button onClick={() => setInput("Add my Archer Queen to the planner.")} className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium transition-colors border border-border">
                "Add my Archer Queen to the planner."
              </button>
            </div>
          </div>
        )}
        
        {messages.filter(m => m.role === 'user' || m.role === 'assistant').map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-primary' : 'bg-muted border border-border'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-foreground" />}
              </div>
              <div className={`p-4 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted border border-border text-foreground rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="flex gap-4 max-w-[85%] md:max-w-[70%]">
              <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-foreground" />
              </div>
              <div className="p-5 rounded-2xl bg-muted border border-border rounded-tl-sm flex gap-2 items-center">
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-border z-10">
        <div className="relative max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask VoltAI to plan your upgrades..."
            className="w-full bg-muted border border-border rounded-2xl py-4 pl-6 pr-16 text-[15px] text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none overflow-hidden transition-all shadow-inner"
            rows={1}
            style={{ minHeight: '56px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
