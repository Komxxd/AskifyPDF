import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, MessageSquare, History, ShieldCheck, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryDocument } from '../../api';

const AIChat = ({ activeDocumentId }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Grounded PDF Assistant. Ask me anything about the uploaded document, and I'll provide answers with direct evidence from the text.", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Call real AI Backend
    const fetchResponse = async () => {
      try {
        const data = await queryDocument(activeDocumentId, inputValue);
        const aiMessage = { 
          role: 'assistant', 
          content: data.answer || "I couldn't find an answer in the document context.", 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (err) {
        console.error("Query failed:", err);
        setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to AI engine. Make sure the backend is running.", timestamp: new Date() }]);
      } finally {
        setIsTyping(false);
      }
    };

    fetchResponse();
  };

  return (
    <div className="w-[450px] flex flex-col h-[calc(100vh-120px)] bg-[#0A0A0A] rounded-[2rem] border border-white/5 ml-4 overflow-hidden shadow-2xl shadow-black/40">
      {/* Header */}
      <div className="h-16 border-b border-white/5 bg-black/40 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/10 to-white/5 flex items-center justify-center border border-white/10">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-tight">Grounded AI</h3>
            <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Context Aware</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
            <ShieldCheck size={14} className="text-emerald-500/60" />
            <div className="h-4 w-px bg-white/5" />
            <button className="text-white/20 hover:text-white transition-colors">
              <History size={16} />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`
                max-w-[90%] p-4 rounded-3xl text-[13px] leading-relaxed shadow-lg
                ${msg.role === 'user' 
                  ? 'bg-neutral-800 text-white rounded-tr-sm border border-white/5' 
                  : 'bg-white/5 text-white/90 rounded-tl-sm border border-white/10 backdrop-blur-3xl'}
              `}
            >
              {msg.content}
            </div>
            <div className="mt-2 text-[8px] font-black uppercase tracking-widest text-white/10 px-2 flex items-center space-x-2">
               <span>{msg.role === 'user' ? 'You' : 'AskifyPDF'}</span>
               <div className="w-1 h-1 rounded-full bg-white/5" />
               <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2 p-4 bg-white/5 rounded-2xl w-20 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-black/40 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative group">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about the PDF..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 focus:bg-white/[0.08] transition-all"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center space-x-4">
           <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-widest text-white/5 hover:text-white/20 transition-colors cursor-help">
              <Info size={10} />
              <span>Grounded in selection</span>
           </div>
           <div className="w-1 h-1 rounded-full bg-white/5" />
           <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-widest text-white/5 hover:text-white/20 transition-colors cursor-help">
              <MessageSquare size={10} />
              <span>Full Doc Context</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
