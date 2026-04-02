import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, User, Settings2, Command, Bot, Info, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithDocument } from "../../api";

const AIChat = ({ activeDocumentId, onPageJump }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Document-Grounded analysis initiated. Ask a query below.", citations: [] }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !activeDocumentId) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      console.log(`DEBUG_SYNC: Polling for ${activeDocumentId} with query: ${inputValue}`);
      const response = await chatWithDocument(activeDocumentId, inputValue);
      console.log("DEBUG_RESPONSE_PAYLOAD:", response);

      // Deduplicate citations by page number for a cleaner UI
      const uniqueCitations = [];
      const seenPages = new Set();
      
      (response.citations || []).forEach(cite => {
        if (!seenPages.has(cite.page)) {
          uniqueCitations.push(cite);
          seenPages.add(cite.page);
        }
      });

      const assistantMessage = { 
        role: 'assistant', 
        content: response.answer, 
        citations: uniqueCitations 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("DEBUG_SYNC_ERROR:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Synchronization failure with AI heart. Retrying query..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-well overflow-hidden selection:bg-white selection:text-black">
      {/* CHAT HEADER */}
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-surface-recessed/30 shrink-0">
         <div className="flex items-center space-x-3">
            <Bot size={14} className="text-white/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Ask It</span>
         </div>
         <div className="flex items-center space-x-4 opacity-10">
            <Settings2 size={14} strokeWidth={1} />
         </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar bg-surface-base">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={i} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[90%] flex flex-col
              ${msg.role === 'user' ? 'items-end' : 'items-start'}
            `}>
              <div className={`
                p-5 text-[13px] leading-relaxed relative
                ${msg.role === 'user' 
                  ? 'bg-white/5 border border-white/10 text-white italic' 
                  : 'bg-surface-well border border-white/[0.03] text-white/70'}
              `}>
                {msg.content}
                
                {/* Interactive Citations */}
                {msg.role === 'assistant' && msg.citations?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/[0.03] space-y-3">
                     <div className="flex items-center space-x-2">
                        <Map size={10} className="text-white/20" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/10 italic">Source Connections</span>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cite, idx) => (
                          <button
                            key={idx}
                            onClick={() => onPageJump?.(cite.page, cite.text)}
                            className="w-full flex items-center justify-between px-3 py-2.5 bg-white/[0.02] hover:bg-white/5 border border-white/[0.05] transition-all text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white"
                          >
                            <span>PAGE_{cite.page}</span>
                            <span className="opacity-20 group-hover:opacity-100 transition-opacity">Jump →</span>
                          </button>
                        ))}
                     </div>
                  </div>
                )}
                
                {msg.role === 'assistant' && msg.citations?.length === 0 && i > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.03] text-white/5 text-[8px] font-bold uppercase tracking-[0.4em] italic">
                    NO_GROUNDED_SOURCES_LINKED
                  </div>
                )}
              </div>
              <div className="mt-3 text-[8px] font-bold uppercase tracking-[0.3em] text-white/10 px-1 italic">
                 {msg.role === 'user' ? 'YOU' : 'ENGINE_CORE_OUTPUT'}
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-3 py-4 italic opacity-10 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">
            <Loader2 size={12} className="animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-surface-well border-t border-white/5 shrink-0">
        <form onSubmit={handleSubmit} className="relative group/input bg-surface-recessed border border-white/5 p-4 focus-within:border-white/20 transition-all">
          <textarea 
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Analytical query..."
            className="w-full bg-transparent resize-none text-[13px] text-white placeholder:text-white/10 focus:outline-none font-medium leading-relaxed pr-12"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute bottom-4 right-4 text-white/20 hover:text-white disabled:opacity-0 transition-all active:scale-95 p-1"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
