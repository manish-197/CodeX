import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mic, 
  Phone, 
  Volume2, 
  VolumeX, 
  CheckCheck, 
  Activity, 
  Sparkles,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function WhatsAppBotModal({ isOpen, onClose }) {
  const { lang, speechLang } = useLanguage();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: lang === 'mr' 
        ? 'नमस्कार! मी आरोग्यरक्षक व्हॉट्सअॅप सहाय्यक आहे. आपल्या आजाराची लक्षणे येथे लिहून किंवा बोलून पाठवा.'
        : 'Namaskar! I am ArogyaRakshak WhatsApp Assistant. Send your health symptoms via voice or text.',
      time: '10:00 AM',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const sentText = inputText;
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sentText, language: lang }),
      });

      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Speak bot response
      speakAudio(data.botReply.replace(/[*#]/g, ''));
    } catch (err) {
      console.warn('[WhatsApp Bot error fallback]', err.message);
      const fallbackReply = lang === 'mr'
        ? `🏥 *आरोग्यरक्षक सहाय्यक*\n\nआपली लक्षणे तपासली आहेत. भरपूर विश्रांती घ्या. आणीबाणी असल्यास १०८ वर कॉल करा.`
        : `🏥 *ArogyaRakshak Bot*\n\nSymptoms evaluated. Rest well and hydrate. For emergencies dial 108.`;
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: fallbackReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      speakAudio(fallbackReply);
    } finally {
      setLoading(false);
    }
  };

  const speakAudio = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#ECE5DD] dark:bg-[#121B22] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px] border border-deep-teal/20"
        data-lenis-prevent="true"
      >
        {/* WhatsApp Header */}
        <div className="bg-[#075E54] dark:bg-[#1F2C34] text-white px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-leaf-green flex items-center justify-center text-white font-bold text-sm shadow-inner">
              AR
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span>ArogyaRakshak AI</span>
                <ShieldCheck className="w-3.5 h-3.5 text-sun-gold" />
              </div>
              <p className="text-[10px] text-white/80">
                Official Rural Health Bot • 24/7 Voice Support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPlayingAudio ? (
              <button
                onClick={stopAudio}
                className="p-1.5 rounded-full bg-alert-crimson text-white text-xs"
                title="Stop voice"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <div className="text-center my-2">
            <span className="bg-[#D1EBE7] dark:bg-[#182229] text-deep-teal dark:text-sky-mist text-[10px] font-semibold px-3 py-1 rounded-lg shadow-sm">
              Elder Care Mode • No Login Required
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#E7FFDB] dark:bg-[#005C4B] text-deep-teal dark:text-[#E9EDEF] rounded-tr-none'
                    : 'bg-white dark:bg-[#202C33] text-deep-teal dark:text-[#D1D7DB] rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.text}
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-60">
                  <span>{msg.time}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-[#202C33] rounded-2xl w-32 text-xs text-deep-teal/60">
              <Activity className="w-3.5 h-3.5 animate-spin text-leaf-green" />
              <span>Typing advice...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Sample Quick Questions for Elders */}
        <div className="px-3 py-1.5 bg-[#F0F2F5] dark:bg-[#202C33] border-t border-deep-teal/10 flex gap-2 overflow-x-auto text-[11px] scrollbar-none">
          <button
            onClick={() => setInputText('मला २ दिवसांपासून ताप आणि खोकला आहे')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-dark-base text-deep-teal dark:text-sky-mist border border-deep-teal/10 whitespace-nowrap hover:border-leaf-green"
          >
            ताप आणि खोकला (Fever & Cough)
          </button>
          <button
            onClick={() => setInputText('छातीत दुखत आहे आणि धाप लागत आहे')}
            className="px-2.5 py-1 rounded-full bg-alert-crimson/10 text-alert-crimson border border-alert-crimson/20 whitespace-nowrap"
          >
            छातीत दुखणे (Chest Pain SOS)
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-[#F0F2F5] dark:bg-[#202C33] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or send message..."
            className="flex-1 px-4 py-2.5 rounded-full bg-white dark:bg-[#2A3942] text-xs text-deep-teal dark:text-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#069374] text-white flex items-center justify-center shrink-0 shadow-md disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
