import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  ChevronDown,
  CornerDownLeft,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react';
import { ChatMessage, User } from '../types';

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content:
      'Halo! Saya **Asisten Konsultan TPK Kota Yogyakarta**. Siap membantu pendampingan di 14 Kemantren dan 45 Kelurahan.\n\n' +
      'Ada yang ingin dikonsultasikan terkait pemantauan sasaran **CATIN**, **BUFAS**, atau **IBU HAMIL** hari ini?',
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTIONS = [
  'Batas normal Hb & LiLA sasaran KEK',
  'Rekomendasi KBPP untuk ibu nifas menyusui',
  'Kriteria penerima PMT DAIS vs Puskesmas',
  'Alur rujukan stunting & BBLR ke Puskesmas',
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('tpk_gemini_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_MESSAGES;
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('tpk_gemini_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    setErrorMessage(null);
    setInputPrompt('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Call server-side Gemini API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          systemInstruction:
            `Anda adalah Konsultan Ahli Pendampingan Stunting & TPK (Tim Pendamping Keluarga) Kota Yogyakarta - BKKBN. ` +
            `Pengguna yang sedang bertanya adalah ${currentUser.full_name} (${currentUser.role}, ${currentUser.kelurahan_nama ? `Kelurahan ${currentUser.kelurahan_nama}, Kemantren ${currentUser.kemantren_nama}` : 'Wilayah Kota Yogyakarta'}). ` +
            `Berikan rekomendasi spesifik dan aplikatif seputar sasaran CATIN, BUFAS, BUMIL, PMT (DAIS/Puskesmas/GENTING), pencegahan stunting, dan alur rujukan Puskesmas di Kota Yogyakarta. ` +
            `Format jawaban menggunakan bullet points atau numbering yang rapi dan mudah dibaca oleh kader lapangan.`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Maaf, belum ada jawaban.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newHistory, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Gagal menghubungi Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    sessionStorage.removeItem('tpk_gemini_chat_history');
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-2 sm:inset-6 flex flex-col'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[460px] h-[600px] max-h-[85vh] flex flex-col'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                  Tanya AI Konsultan TPK
                </h3>
                <span className="text-[10px] bg-teal-500/30 text-teal-200 px-1.5 py-0.2 rounded font-mono">
                  gemini-3.5-flash
                </span>
              </div>
              <p className="text-[11px] text-teal-100/80">
                Pakar Stunting &amp; Pendampingan 14 Kemantren
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <button
              onClick={handleResetChat}
              title="Mulai percakapan baru"
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Kecilkan' : 'Perbesar'}
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Tutup Chat"
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 text-xs">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                    isUser
                      ? 'bg-teal-700 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  {/* Clean text renderer with basic markdown formatting */}
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {msg.content.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <div key={i} className="font-bold text-slate-900 mt-1 mb-0.5">
                            {line.replace(/\*\*/g, '')}
                          </div>
                        );
                      }
                      return (
                        <span key={i} className="block">
                          {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </span>
                      );
                    })}
                  </div>
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      isUser ? 'text-teal-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-3.5 py-2.5 text-xs text-slate-500 shadow-xs flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                <span
                  className="inline-block w-2 h-2 rounded-full bg-teal-600 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="inline-block w-2 h-2 rounded-full bg-teal-600 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
                <span className="ml-1 text-[11px] text-slate-500">Menganalisis protokol stunting...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Terjadi Gangguan Komunikasi</span>
                <span className="text-[11px]">{errorMessage}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Saran:
          </span>
          {SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              disabled={isLoading}
              className="text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-800 rounded-lg px-2.5 py-1 whitespace-nowrap shadow-2xs transition-colors shrink-0 disabled:opacity-50"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan protokol stunting, PMT, KBPP, rujukan..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none focus:bg-white resize-none max-h-24"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="p-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 shrink-0 flex items-center justify-center"
              title="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>Tekan Enter untuk mengirim · Shift+Enter untuk baris baru</span>
            <span>Didukung Gemini 3.5 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
};
