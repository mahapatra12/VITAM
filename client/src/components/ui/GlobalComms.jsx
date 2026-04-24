import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCheck,
  Hash,
  Lock,
  MessageSquare,
  Send,
  ShieldCheck,
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MOCK_CHANNELS = [
  { id: 'c1', name: 'Global Announcements', type: 'public', unread: 2 },
  { id: 'c2', name: 'Academic Senate', type: 'private', unread: 0 },
  { id: 'c3', name: 'Emergency Broadcast', type: 'alert', unread: 1 }
];

const MOCK_DM = [
  { id: 'd1', name: 'Dr. Sarah', role: 'HOD', online: true, lastMsg: 'Syllabus approved.' },
  { id: 'd2', name: 'Finance Terminal', role: 'FINANCE', online: true, lastMsg: 'Ledger updated.' },
  { id: 'd3', name: 'Campus Security', role: 'ADMIN', online: false, lastMsg: 'Gate 4 secured.' }
];

export default function GlobalComms({ isOpen, onClose }) {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(MOCK_CHANNELS[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'System Relay', role: 'SYSTEM', text: 'Secure collaboration channel initialized.', isSystem: true, time: '09:00' },
    { id: 2, sender: 'Dr. Allen', role: 'CHAIRMAN', text: 'All departments can proceed with today’s release plan.', isSystem: false, time: '09:05' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const replyTimeoutsRef = useRef([]);

  const clearReplyTimers = useCallback(() => {
    replyTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    replyTimeoutsRef.current = [];
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      clearReplyTimers();
      setInputValue('');
    }
  }, [clearReplyTimers, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => () => {
    clearReplyTimers();
  }, [clearReplyTimers]);

  const handleSend = (event) => {
    event.preventDefault();
    const nextText = inputValue.trim();
    if (!nextText) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: user?.name || 'Unknown Identity',
      role: user?.role || 'GUEST',
      text: nextText,
      isSystem: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };

    setMessages((previous) => [...previous, newMessage]);
    setInputValue('');

    const timeoutId = setTimeout(() => {
      replyTimeoutsRef.current = replyTimeoutsRef.current.filter((id) => id !== timeoutId);
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          sender: 'Network Relay',
          role: 'SYSTEM',
          text: 'Message delivered and indexed in the collaboration ledger.',
          isSystem: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);

    replyTimeoutsRef.current.push(timeoutId);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 360 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 360 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 z-[100] flex w-full justify-end bg-[rgba(2,8,23,0.38)] backdrop-blur-sm"
      >
        <div className="premium-card m-3 flex h-[calc(100vh-1.5rem)] w-full max-w-[28rem] overflow-hidden rounded-[2rem] p-0">
          <div className="flex w-full flex-col">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-200">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">
                      Global Comms
                    </h2>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                      Encrypted collaboration live
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-400 transition-all hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="border-b border-white/5 px-4 py-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {MOCK_CHANNELS.map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setActiveChat(channel)}
                    className={`${activeChat.id === channel.id ? 'status-pill border-indigo-500/25 bg-indigo-500/10 text-indigo-200' : 'status-pill'} relative whitespace-nowrap`}
                  >
                    {channel.type === 'public' ? <Hash size={12} /> : channel.type === 'alert' ? <ShieldCheck size={12} /> : <Lock size={12} />}
                    {channel.name}
                    {channel.unread > 0 ? (
                      <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                        {channel.unread}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid flex-1 grid-rows-[auto_1fr_auto] overflow-hidden">
              <div className="border-b border-white/5 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-white">
                      {activeChat.name}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {activeChat.type ? `Channel ${activeChat.id.toUpperCase()}` : 'Direct secure thread'}
                    </p>
                  </div>
                  <div className="status-pill border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                    Live
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    if (message.isSystem) {
                      return (
                        <div key={message.id} className="flex justify-center">
                          <span className="status-pill">
                            <Zap size={11} />
                            {message.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${message.isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div className="mb-1 flex items-center gap-2 px-1">
                          {!message.isSelf ? (
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                              {message.sender}
                            </span>
                          ) : null}
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                            {message.role}
                          </span>
                        </div>

                        <div className={`max-w-[84%] rounded-[1.3rem] px-4 py-3 text-sm leading-6 ${
                          message.isSelf
                            ? 'rounded-tr-md bg-indigo-600 text-white'
                            : 'rounded-tl-md border border-white/10 bg-slate-950/75 text-slate-100'
                        }`}>
                          {message.text}
                        </div>

                        <div className="mt-1 flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                          <span>{message.time}</span>
                          {message.isSelf ? <CheckCheck size={11} className="text-indigo-300" /> : null}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-white/10 p-4">
                <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
                  {MOCK_DM.map((peer) => (
                    <button
                      key={peer.id}
                      type="button"
                      onClick={() => setActiveChat(peer)}
                      className={`status-pill whitespace-nowrap ${activeChat.id === peer.id ? 'border-cyan-500/25 bg-cyan-500/10 text-cyan-100' : ''}`}
                    >
                      {peer.name}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSend} className="flex items-center gap-2 rounded-[1.4rem] border border-white/10 bg-slate-950/75 px-2 py-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder="Send a secure message..."
                    className="flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white transition-all hover:bg-indigo-500 disabled:opacity-40"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
