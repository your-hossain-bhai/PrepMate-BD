import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../LanguageContext';
import {
  Bot,
  Send,
  Image as ImageIcon,
  X,
  Sparkles,
  ShieldAlert,
  Trash2,
  Copy,
  Check,
  BookOpen,
  HelpCircle,
  Loader2,
  Zap,
  Target,
} from 'lucide-react';
import { cleanMathText } from '../utils/mathFormatter';

interface StudyBotViewProps {
  user: UserProfile;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  image?: string | null;
  timestamp: string;
  isOffTopic?: boolean;
}

export const StudyBotView: React.FC<StudyBotViewProps> = ({ user, onUpdateUser }) => {
  const { lang } = useLanguage();
  const isEnglish = lang === 'en';

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'bot',
      text: isEnglish
        ? `👋 Assalamu Alaikum! I am your dedicated **PrepMate SSC & HSC AI Study Assistant**!\n\nI am here to help you prepare for **SSC (Class 9-10)** and **HSC (Class 11-12)** board exams across Science, Commerce, and Humanities. Ask me any study question, math problem, or upload a photo of your textbook page! 📚✨`
        : `👋 আসসালামু আলাইকুম! আমি আপনার **প্রেপমেট এসএসসি ও এইচএসসি এআই স্টাডি বট**!\n\nআমি **এসএসসি (৯ম-১০ম)** এবং **এইচএসসি (১১দশ-১২দশ)** বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা সকল বিভাগের বোর্ড পরীক্ষা প্রস্তুতির জন্য প্রস্তুত। পদার্থবিজ্ঞান, রসায়ন, গণিত, আইসিটি সহ যেকোনো প্রশ্ন লিখে বা বইয়ের পাতার ছবি তুলে সমাধান নিতে পারেন! 📚✨`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle Image Selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(isEnglish ? 'Image size must be less than 5MB.' : 'ছবি ফাইল সাইজ ৫ মেগাবাইটের কম হতে হবে।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim() && !selectedImage) return;

    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: text.trim(),
      image: selectedImage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText('');
    setSelectedImage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/study-bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          image: selectedImage,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          academicLevel: user.academicLevel,
          group: user.group,
          language: lang,
        }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || (isEnglish ? 'I am here to help with your studies!' : 'আমি আপনার পড়ালেখায় সাহায্য করতে প্রস্তুত!'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOffTopic: data.isOffTopic,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Study bot chat error:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: isEnglish
          ? '❌ Temporary connection issue. Please make sure your query is study-related and try again.'
          : '❌ নেটওয়ার্ক সংযোগ সমস্যা হয়েছে। অনুগ্রহ করে আপনার পড়ার প্রশ্নটি পুনরায় জমা দিন।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: 'bot',
        text: isEnglish
          ? '✨ Chat reset! Ready to solve your SSC/HSC study questions. Ask away or upload a problem photo! 📚'
          : '✨ নতুন চ্যাট শুরু হয়েছে! আপনার এসএসসি/এইচএসসি পরীক্ষার প্রশ্ন বা বইয়ের পাতার ছবি দিন, আমি বুঝিয়ে দেব। 📚',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputText('');
    setSelectedImage(null);
    setLoading(false);
  };

  // Preset Prompts for Quick Study Questions
  const PRESET_CHIPS = [
    {
      label: isEnglish ? '🇬🇧 English Question (Newton Law)' : '🇬🇧 ইংরেজি প্রশ্ন (Newton Law)',
      query: 'What is Newton second law of motion? Explain with formula and example for exam.',
    },
    {
      label: isEnglish ? '🇧🇩 Bangla Question (Vector)' : '🇧🇩 বাংলা প্রশ্ন (ভেক্টর লব্ধি)',
      query: 'ভেক্টর রাশির ক্ষেত্রে দুইটি ভেক্টর P ও Q এর লব্ধি R নির্ণয়ের সূত্র উদাহরণসহ বুঝিয়ে দাও।',
    },
    {
      label: isEnglish ? '🔤 Banglish Test ("ami bujhi nai")' : '🔤 বাংলিশ টেস্ট ("ami bujhi nai")',
      query: 'ami physics r organic chemistry khub kothin lage, board exam a kivabe a+ pabo? ekta study routine daw to.',
    },
    {
      label: isEnglish ? '⚡ SSC Math/Physics Formula' : '⚡ এসএসসি সাধারণ গণিত সূত্র',
      query: 'এসএসসি সাধারণ গণিত ও পদার্থবিজ্ঞানের গুরুত্বপূর্ণ সূত্রগুলোর তালিকা দাও।',
    },
    {
      label: isEnglish ? '🎬 Test Movie Guardrail (Off-Topic)' : '🎬 সিনেমা বিষয়ক প্রশ্ন (পরীক্ষা)',
      query: 'আমায় একটি ভালো সিনেমার সাজেশন দাও তো!',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 my-4">
      {/* Top Header Card */}
      <div className="p-6 bg-gradient-to-r from-emerald-900/80 via-[#003d34] to-cyan-950/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 text-white space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-[#002b24] flex items-center justify-center font-black shadow-lg shadow-amber-900/40 shrink-0">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-amber-300 uppercase tracking-widest bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {isEnglish ? 'SSC & HSC AI Study Assistant' : 'এসএসসি ও এইচএসসি এআই স্টাডি বট'}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                {isEnglish ? '24/7 Personal Board Exam AI Tutor' : '২৪/৭ পার্সোনাল বোর্ড এক্সাম এআই টিউটর'}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Level Selector */}
            <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/15">
              <button
                onClick={() => onUpdateUser && onUpdateUser({ academicLevel: 'SSC' })}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  user.academicLevel === 'SSC'
                    ? 'bg-amber-400 text-[#002b24] shadow-md'
                    : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                SSC
              </button>
              <button
                onClick={() => onUpdateUser && onUpdateUser({ academicLevel: 'HSC' })}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  user.academicLevel === 'HSC'
                    ? 'bg-amber-400 text-[#002b24] shadow-md'
                    : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                HSC
              </button>
            </div>

            {/* Group Selector */}
            <select
              value={user.group || 'Science'}
              onChange={(e) => onUpdateUser && onUpdateUser({ group: e.target.value as any })}
              className="px-3 py-1.5 bg-black/40 border border-white/20 text-xs font-bold text-amber-300 rounded-2xl focus:outline-none"
            >
              <option value="Science">Science (বিজ্ঞান)</option>
              <option value="Commerce">Commerce (ব্যবসায় শিক্ষা)</option>
              <option value="Humanities">Humanities (মানবিক)</option>
            </select>

            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-300" />
              <span>{isEnglish ? 'Clear' : 'নতুন চ্যাট'}</span>
            </button>
          </div>
        </div>

        {/* Strict Focus Guardrail Banner */}
        <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-300 font-extrabold uppercase tracking-wider">
              {isEnglish ? '🎯 Strict Focus Guarantee: ' : '🎯 স্টাডি ফোকাস গ্যারান্টি: '}
            </strong>
            {isEnglish
              ? 'Study Focus: Answers SSC & HSC academic questions in English or Bangla. Off-topic queries will be redirected back to your studies!'
              : 'স্টাডি ফোকাস: এসএসসি ও এইচএসসি পরীক্ষার যেকোনো পড়াশোনার প্রশ্ন করতে পারেন। অফ-টপিক বিনোদনমূলক প্রশ্ন এড়িয়ে পড়ার টেবিলে ফোকাস নিশ্চিত করা হয়!'}
          </p>
        </div>
      </div>

      {/* Preset Quick Question Chips */}
      <div className="p-4 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/15 text-white space-y-2">
        <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          {isEnglish ? 'Quick Exam Prep Questions:' : 'দ্রুত প্রশ্ন জিজ্ঞাসা করুন:'}
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.query)}
              disabled={loading}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-white/15 text-emerald-100 hover:text-white rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-4 sm:p-6 shadow-2xl min-h-[420px] max-h-[550px] flex flex-col justify-between space-y-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-[#002b24] flex items-center justify-center font-black shadow-md shrink-0 mt-1">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 space-y-2 relative shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none border border-emerald-400/30'
                      : msg.isOffTopic
                      ? 'bg-gradient-to-r from-amber-900/90 via-amber-950 to-amber-900/90 border-2 border-amber-400 text-amber-100 rounded-tl-none'
                      : 'bg-[#002b24]/90 border border-white/20 text-white rounded-tl-none'
                  }`}
                >
                  {/* User Attached Image */}
                  {msg.image && (
                    <div className="rounded-xl overflow-hidden border border-white/20 max-h-48 mb-2 bg-black/40">
                      <img src={msg.image} alt="User attachment" className="object-cover w-full h-full" />
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {cleanMathText(msg.text)}
                  </div>

                  {/* Footer Meta & Actions */}
                  <div className="flex items-center justify-between text-[10px] text-emerald-200/60 font-mono pt-1 border-t border-white/10">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="hover:text-white flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded bg-white/5 border border-white/10"
                        title="Copy Answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-amber-300" />
                            <span className="text-amber-300 font-bold">
                              {isEnglish ? 'Copied' : 'কপি হয়েছে'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{isEnglish ? 'Copy' : 'কপি'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shrink-0 mt-1 text-xs">
                    YOU
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 justify-start text-emerald-200 text-xs font-semibold animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#002b24]/80 p-3 rounded-2xl border border-white/15">
                {isEnglish
                  ? 'AI Study Tutor is solving your question...'
                  : 'এআই স্টাডি বট আপনার প্রশ্নের সমাধান তৈরি করছে...'}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Selected Image Preview before sending */}
        {selectedImage && (
          <div className="relative inline-block border border-amber-400/60 rounded-2xl overflow-hidden p-1 bg-black/50 self-start">
            <img src={selectedImage} alt="Attachment preview" className="h-16 w-16 object-cover rounded-xl" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 border-t border-white/15"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={isEnglish ? 'Upload Question Photo' : 'ছবি আপলোড করুন'}
            className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-emerald-300 hover:text-white transition-all active:scale-95 shrink-0"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isEnglish
                ? `Ask your ${user.academicLevel} study question, problem, or concept...`
                : `আপনার ${user.academicLevel} এর যেকোনো প্রশ্ন বা অংক লিখে সমাধান চান...`
            }
            className="flex-1 px-4 py-3 bg-[#002b24]/90 border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder-emerald-200/40 focus:border-amber-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || (!inputText.trim() && !selectedImage)}
            className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#002b24] font-black text-xs rounded-2xl shadow-xl shadow-amber-900/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shrink-0 uppercase tracking-wider"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#002b24]" />
            ) : (
              <>
                <Send className="w-4 h-4 text-[#002b24]" />
                <span className="hidden sm:inline">{isEnglish ? 'Send' : 'পাঠান'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
