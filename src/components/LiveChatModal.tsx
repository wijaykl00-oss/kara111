import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Headphones, ShieldCheck, User } from 'lucide-react';
import { UserProfile } from '../types.ts';

interface LiveChatModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'cs' | 'user';
  text: string;
  time: string;
}

export const LiveChatModal: React.FC<LiveChatModalProps> = ({
  isOpen,
  user,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'cs',
      text: 'Halo! Selamat datang di Layanan Customer Service 24 Jam KARA111. Ada yang bisa kami bantu seputar pendaftaran, deposit, withdraw, atau promo hari ini?',
      time: 'Baru saja'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    const sendQuery = inputText.trim();
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/support/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sendQuery,
          username: user?.username || 'Tamu'
        })
      });
      const data = await res.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: 'cs',
            text: data.reply || 'Customer Service KARA111 siap melayani Anda 24 jam.',
            time: data.timestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-[#1a120b] border border-amber-500/50 rounded-2xl shadow-2xl flex flex-col h-[520px] overflow-hidden">
        {/* Top CS Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 p-3 flex items-center justify-between text-stone-950 shadow-md">
          <div className="flex items-center gap-2">
            <div className="relative w-9 h-9 rounded-full bg-stone-950 text-amber-400 flex items-center justify-center border border-amber-300 shadow">
              <Headphones className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-stone-950" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-wide text-stone-950 flex items-center gap-1">
                KARA111 Live Support
              </h3>
              <span className="text-[10px] font-bold text-stone-900/80">
                Online 24/7 • Respon Cepat &lt; 1 Menit
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-stone-950/20 hover:bg-stone-950/40 text-stone-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#120a05]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-stone-950 font-semibold rounded-br-none shadow'
                    : 'bg-[#26190e] text-amber-100 border border-amber-900/50 rounded-bl-none shadow-sm'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-amber-400/50 mt-0.5 px-1 font-mono">
                {m.time}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-1 text-amber-400 text-xs italic">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Customer service sedang mengetik...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Question Buttons */}
        <div className="px-2 py-1.5 bg-[#1a1008] border-t border-amber-950 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {['Cara Deposit?', 'Berapa Minimal WD?', 'Promo New Member', 'Game Gacor Hari Ini'].map((txt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(txt)}
              className="px-2.5 py-1 rounded-full bg-[#27190e] hover:bg-amber-500 hover:text-stone-950 text-[10px] font-bold text-amber-300 border border-amber-900/40 whitespace-nowrap transition-colors cursor-pointer"
            >
              {txt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-2 bg-[#1f140b] border-t border-amber-900/40 flex items-center gap-2">
          <input
            type="text"
            placeholder="Tulis pesan Anda di sini..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-[#120a05] border border-amber-900/60 rounded-xl px-3 py-2 text-xs text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
