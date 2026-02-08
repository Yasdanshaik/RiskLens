
import React, { useState, useRef, useEffect } from 'react';
import { chatWithMentor, analyzeFinancialDocument, ChatMode } from '../services/geminiService.ts';
import { Message } from '../types.ts';
import { Icons } from '../constants.tsx';

interface ChatInterfaceProps {
  onNavigateToScam: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNavigateToScam }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hello! I'm RiskLens, your financial mentor. I can help you understand how loans work, explain credit scores, or analyze that tricky insurance form you're looking at. What's on your mind today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ChatMode>('pro');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithMentor(userMessage.text, mode);
      
      const groundingLinks = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web?.title || 'Resource',
          uri: chunk.web?.uri || '#'
        }));

      const modelMessage: Message = {
        role: 'model',
        text: response.text || "I'm sorry, I couldn't process that.",
        timestamp: Date.now(),
        groundingLinks: groundingLinks
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I'm having a bit of trouble connecting to my wisdom banks. Please try again in a moment.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const userMsg: Message = { 
        role: 'user', 
        text: "Can you analyze this document for me?", 
        timestamp: Date.now(),
        image: event.target?.result as string
      };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const analysis = await analyzeFinancialDocument(base64, "Analyze this financial document or form.");
        setMessages(prev => [...prev, {
          role: 'model',
          text: analysis || "I scanned it, but couldn't find any critical details.",
          timestamp: Date.now()
        }]);
      } catch (err) {
        setMessages(prev => [...prev, {
          role: 'model',
          text: "I couldn't read that file. Is it clear and well-lit?",
          timestamp: Date.now()
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
      {/* Messages Header */}
      <div className="px-6 py-5 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group">
            <span className="font-black text-lg group-hover:scale-110 transition-transform">RL</span>
          </div>
          <div>
            <h2 className="font-black text-slate-900 tracking-tight leading-none">Mentor Chat</h2>
            <div className="flex items-center gap-1.5 mt-1.5">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                {mode === 'fast' && 'Flash Intelligence'}
                {mode === 'search' && 'Live Search'}
                {mode === 'pro' && 'Pro Reasoning'}
                {mode === 'deep' && 'Deep Analysis'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex bg-slate-100/80 p-1 rounded-xl self-start sm:self-center overflow-x-auto no-scrollbar border border-slate-200/40">
           {(['fast', 'search', 'pro', 'deep'] as ChatMode[]).map((m) => (
             <button 
               key={m}
               onClick={() => setMode(m)}
               className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all shrink-0 uppercase tracking-tighter ${
                 mode === m ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
               }`}
             >
               {m}
             </button>
           ))}
        </div>
      </div>

      {/* Safety Banner */}
      <div className="bg-red-50/80 backdrop-blur-sm border-b border-red-100 px-6 py-3 flex items-center justify-between gap-4 shrink-0 z-10">
        <div className="flex items-center gap-3 text-red-700">
          <div className="text-red-500 bg-white p-1 rounded-lg shadow-sm">
            <Icons.Shield />
          </div>
          <span className="text-xs font-bold leading-tight">Received a suspicious message? Use our Guard.</span>
        </div>
        <button 
          onClick={onNavigateToScam}
          className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-100 uppercase tracking-wider shrink-0"
        >
          Safety Check
        </button>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[88%] sm:max-w-[80%] rounded-[24px] px-5 py-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-indigo-100' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none ring-1 ring-slate-200/5'
            }`}>
              {msg.image && (
                <div className="mb-4 rounded-xl overflow-hidden border border-white/20 shadow-md">
                   <img src={msg.image} alt="Uploaded content" className="w-full h-auto object-cover max-h-60" />
                </div>
              )}
              <div className={`prose prose-sm max-w-none leading-relaxed ${msg.role === 'user' ? 'text-white/95 prose-invert' : 'text-slate-700'}`}>
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>
              
              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100/50">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black mb-3">Verification Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingLinks.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-2 bg-indigo-50/50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all font-bold border border-indigo-100/30 flex items-center gap-1.5 group"
                      >
                        <Icons.Search />
                        <span className="group-hover:underline truncate max-w-[140px]">{link.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className={`text-[9px] mt-2 opacity-40 font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 flex flex-col gap-3 shadow-sm min-w-[120px]">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="text-[9px] text-indigo-500 font-black uppercase tracking-[0.2em]">
                {mode === 'deep' ? 'Deep Thinking...' : 'Processing...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] z-20">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 items-end">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-2xl bg-slate-50 border border-slate-100 shrink-0 group shadow-sm active:scale-90"
            title="Scan document"
          >
            <div className="group-hover:scale-110 transition-transform"><Icons.Document /></div>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload}
          />
          <div className="flex-1 relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                mode === 'deep' ? "Explain this complex financial term..." : 
                "Ask your mentor anything about money..."
              }
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-[22px] pl-5 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all resize-none min-h-[56px] max-h-[160px] placeholder:text-slate-400 font-medium"
              rows={1}
            />
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 shadow-xl shadow-indigo-200 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em] mt-4">RiskLens Mentor v2.5 • AI Assistant</p>
      </div>
    </div>
  );
};

export default ChatInterface;