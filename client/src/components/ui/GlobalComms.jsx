import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Users, Lock, MoreVertical, Hash, ShieldCheck, ChevronDown, CheckCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MOCK_CHANNELS = [
  { id: 'c1', name: 'Global Announcements', type: 'public', unread: 2 },
  { id: 'c2', name: 'Academic Senate', type: 'private', unread: 0 },
  { id: 'c3', name: 'Emergency Broadcast', type: 'alert', unread: 1 },
];

const MOCK_DM = [
  { id: 'd1', name: 'Dr. Sarah (HOD CS)', role: 'HOD', online: true, lastMsg: 'Syllabus approved.' },
  { id: 'd2', name: 'Finance Terminal', role: 'FINANCE', online: true, lastMsg: 'Ledger updated.' },
  { id: 'd3', name: 'Campus Security', role: 'ADMIN', online: false, lastMsg: 'Gate 4 secured.' },
];

export default function GlobalComms({ isOpen, onClose }) {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(MOCK_CHANNELS[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'System AI', role: 'SYSTEM', text: 'End-to-end encryption initialized. AES-256 keys exchanged.', isSystem: true, time: '09:00' },
    { id: 2, sender: 'Dr. Allen', role: 'CHAIRMAN', text: 'All departments proceed with Phase 3 protocol.', isSystem: false, time: '09:05' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: user?.name || 'Unknown Identity',
      role: user?.role || 'GUEST',
      text: inputValue,
      isSystem: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };

    setMessages([...messages, newMsg]);
    setInputValue('');

    // Simulate AI or Peer Response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'Network Proxy',
        role: 'SYSTEM',
        text: 'Message block added to immutable ledger.',
        isSystem: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#050505] border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] z-[100] flex flex-col"
      >
        {/* Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
               <MessageSquare size={16} />
             </div>
             <div>
               <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Global Comms</h2>
               <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Encrypted Socket Live
               </p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
             <X size={18} />
           </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Channels */}
          <div className="w-20 sm:w-24 border-r border-white/5 bg-black/40 flex flex-col items-center py-6 gap-6 overflow-y-auto hidden-scrollbar">
             
             {/* Channels */}
             <div className="w-full space-y-3 px-3">
               <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center mb-4">Grid</div>
               {MOCK_CHANNELS.map(ch => (
                 <button 
                   key={ch.id}
                   onClick={() => setActiveChat(ch)}
                   className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 relative group transition-all ${activeChat.id === ch.id ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white border border-transparent'}`}
                 >
                   {ch.type === 'public' ? <Hash size={18} /> : ch.type === 'alert' ? <ShieldCheck size={18} className="text-rose-500" /> : <Lock size={18} />}
                   {ch.unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center border-2 border-[#050505]">{ch.unread}</span>}
                 </button>
               ))}
             </div>

             <div className="w-8 h-px bg-white/5 my-2" />

             {/* DMs */}
             <div className="w-full space-y-3 px-3">
               <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center mb-4">Peers</div>
               {MOCK_DM.map(dm => (
                 <button 
                   key={dm.id}
                   onClick={() => setActiveChat(dm)}
                   className={`w-full aspect-square rounded-full flex flex-col items-center justify-center relative group transition-all ${activeChat.id === dm.id ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-transparent'}`}
                 >
                   <span className="font-black text-sm">{dm.name.charAt(0)}</span>
                   <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#050505] ${dm.online ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                 </button>
               ))}
             </div>
          </div>

          {/* Chat Zone */}
          <div className="flex-1 flex flex-col bg-[#050505]/95 relative">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #6366f1 0%, transparent 80%)' }} />
            
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex flex-col gap-1 backdrop-blur-md z-10">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                {activeChat.name} <ChevronDown size={14} className="text-slate-500" />
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                {activeChat.type ? `Connected Node: ${activeChat.id.toUpperCase()}` : `Direct RSA Tunnel established`}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 z-10 custom-scroll">
               {messages.map((msg, idx) => {
                 if (msg.isSystem) {
                   return (
                     <div key={msg.id} className="flex justify-center my-4">
                       <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono text-slate-400 flex items-center gap-2">
                         <Zap size={10} className="text-indigo-400" /> {msg.text}
                       </span>
                     </div>
                   )
                 }
                 
                 return (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                     key={msg.id} 
                     className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                   >
                     <div className="flex items-center gap-2 mb-1.5 px-1">
                       {!msg.isSelf && <span className="text-[10px] font-black text-slate-400">{msg.sender}</span>}
                       <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${msg.isSelf ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                         {msg.role}
                       </span>
                       <span className="text-[9px] text-slate-600 font-mono">{msg.time}</span>
                     </div>
                     <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.isSelf ? 'bg-indigo-600 text-white rounded-tr-sm border-l border-t border-indigo-400/30' : 'bg-slate-800 border border-white/10 text-slate-200 rounded-tl-sm'}`}>
                       {msg.text}
                     </div>
                     {msg.isSelf && (
                       <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-500 font-bold px-1">
                         <CheckCheck size={12} className="text-indigo-400" /> Delivered
                       </div>
                     )}
                   </motion.div>
                 )
               })}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Zone */}
            <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-md z-10">
               <form onSubmit={handleSend} className="relative flex items-center">
                 <input 
                   type="text" 
                   value={inputValue}
                   onChange={e => setInputValue(e.target.value)}
                   placeholder="Transmit encrypted payload..."
                   className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600 font-medium"
                 />
                 <button 
                   type="submit"
                   disabled={!inputValue.trim()}
                   className="absolute right-2 w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-slate-800 hover:bg-indigo-400 transition-colors"
                 >
                   <Send size={14} className="ml-0.5" />
                 </button>
               </form>
               <p className="text-center mt-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center justify-center gap-1">
                 <Lock size={10} /> 256-bit AES Matrix Active
               </p>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
