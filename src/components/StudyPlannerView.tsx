import React, { useState } from 'react';
import { UserProfile, AcademicLevel, AcademicGroup, StudySlot } from '../types';
import { useLanguage } from '../LanguageContext';
import { StudyReminderCard } from './StudyReminderCard';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  RotateCcw,
  GripVertical,
  Award,
  Check,
  Edit3,
  X,
  Target,
} from 'lucide-react';

interface StudyPlannerViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

const DAYS_BN = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];
const DAYS_EN = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_KEYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const SLOTS_BN = [
  { key: 'morning', name: 'সকাল (০৮:০০ - ১১:০০)', icon: '🌅' },
  { key: 'afternoon', name: 'দুপুর/বিকাল (০২:০০ - ০৫:০০)', icon: '☀️' },
  { key: 'evening', name: 'সন্ধ্যা (০৬:০০ - ০৮:৩০)', icon: '🌆' },
  { key: 'night', name: 'রাত (০৯:০০ - ১১:৩০)', icon: '🌙' },
];

const SLOTS_EN = [
  { key: 'morning', name: 'Morning (08:00-11:00 AM)', icon: '🌅' },
  { key: 'afternoon', name: 'Afternoon (02:00-05:00 PM)', icon: '☀️' },
  { key: 'evening', name: 'Evening (06:00-08:30 PM)', icon: '🌆' },
  { key: 'night', name: 'Night (09:00-11:30 PM)', icon: '🌙' },
];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Physics: { bg: 'bg-cyan-500/20', text: 'text-cyan-200', border: 'border-cyan-400/40', badge: 'bg-cyan-400 text-slate-900' },
  Chemistry: { bg: 'bg-purple-500/20', text: 'text-purple-200', border: 'border-purple-400/40', badge: 'bg-purple-400 text-slate-900' },
  'Higher Math': { bg: 'bg-amber-500/20', text: 'text-amber-200', border: 'border-amber-400/40', badge: 'bg-amber-400 text-slate-900' },
  Biology: { bg: 'bg-emerald-500/20', text: 'text-emerald-200', border: 'border-emerald-400/40', badge: 'bg-emerald-400 text-slate-900' },
  ICT: { bg: 'bg-indigo-500/20', text: 'text-indigo-200', border: 'border-indigo-400/40', badge: 'bg-indigo-400 text-slate-900' },
  English: { bg: 'bg-rose-500/20', text: 'text-rose-200', border: 'border-rose-400/40', badge: 'bg-rose-400 text-slate-900' },
  Bangla: { bg: 'bg-teal-500/20', text: 'text-teal-200', border: 'border-teal-400/40', badge: 'bg-teal-400 text-slate-900' },
  Accounting: { bg: 'bg-blue-500/20', text: 'text-blue-200', border: 'border-blue-400/40', badge: 'bg-blue-400 text-slate-900' },
  Economics: { bg: 'bg-orange-500/20', text: 'text-orange-200', border: 'border-orange-400/40', badge: 'bg-orange-400 text-slate-900' },
  History: { bg: 'bg-pink-500/20', text: 'text-pink-200', border: 'border-pink-400/40', badge: 'bg-pink-400 text-slate-900' },
  DEFAULT: { bg: 'bg-slate-500/20', text: 'text-slate-200', border: 'border-slate-400/40', badge: 'bg-slate-400 text-slate-900' },
};

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({ user, onUpdateUser }) => {
  const { lang } = useLanguage();

  const isHsc = user.academicLevel === 'HSC';
  const group = user.group || 'Science';

  // Sample initial study routine schedule
  const [schedule, setSchedule] = useState<StudySlot[]>(() => [
    { id: 'Sat-morning', day: 'Sat', timeSlot: 'morning', subject: 'Physics', topic: 'ভেক্টর ও গতিবিদ্যা (Vector)', completed: true },
    { id: 'Sat-evening', day: 'Sat', timeSlot: 'evening', subject: 'Higher Math', topic: 'ম্যাট্রিক্স ও নির্ণায়ক', completed: true },
    { id: 'Sun-morning', day: 'Sun', timeSlot: 'morning', subject: 'Chemistry', topic: 'পরমাণুর গঠন ও পর্যায় সারণি', completed: false },
    { id: 'Sun-night', day: 'Sun', timeSlot: 'night', subject: 'ICT', topic: 'এইচটিএমএল ও সংখ্যা পদ্ধতি', completed: false },
    { id: 'Mon-morning', day: 'Mon', timeSlot: 'morning', subject: 'Biology', topic: 'কোষ ও এর গঠন (Cell Biology)', completed: false },
    { id: 'Tue-evening', day: 'Tue', timeSlot: 'evening', subject: 'English', topic: 'Grammar & Modifiers practice', completed: false },
    { id: 'Wed-morning', day: 'Wed', timeSlot: 'wednesday', subject: 'Physics', topic: 'কাজ, ক্ষমতা ও শক্তি', completed: false },
  ]);

  const [selectedSubject, setSelectedSubject] = useState<string | null>('Physics');
  const [draggedSubject, setDraggedSubject] = useState<string | null>(null);

  // Edit/Add Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCellSlot, setActiveCellSlot] = useState<{ day: string; timeSlot: string } | null>(null);
  const [modalSubject, setModalSubject] = useState('Physics');
  const [modalTopic, setModalTopic] = useState('');

  // Available subjects palette based on user group
  const subjectsPalette =
    group === 'Science'
      ? ['Physics', 'Chemistry', 'Higher Math', 'Biology', 'ICT', 'English', 'Bangla']
      : group === 'Commerce'
      ? ['Accounting', 'Economics', 'Business Org', 'ICT', 'English', 'Bangla']
      : ['History', 'Economics', 'Civics', 'ICT', 'English', 'Bangla'];

  const daysList = lang === 'en' ? DAYS_EN : DAYS_BN;
  const timeSlotsList = lang === 'en' ? SLOTS_EN : SLOTS_BN;

  // Handle Drag & Drop
  const handleDragStart = (subjectName: string) => {
    setDraggedSubject(subjectName);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (day: string, timeSlot: string) => {
    const subjectToAssign = draggedSubject || selectedSubject;
    if (!subjectToAssign) return;

    const existingIndex = schedule.findIndex((s) => s.day === day && s.timeSlot === timeSlot);
    if (existingIndex >= 0) {
      const updated = [...schedule];
      updated[existingIndex] = {
        ...updated[existingIndex],
        subject: subjectToAssign,
      };
      setSchedule(updated);
    } else {
      const newSlot: StudySlot = {
        id: `${day}-${timeSlot}-${Date.now()}`,
        day,
        timeSlot,
        subject: subjectToAssign,
        topic: `${subjectToAssign} Revision Chapter`,
        completed: false,
      };
      setSchedule([...schedule, newSlot]);
    }
    setDraggedSubject(null);
  };

  // Open slot picker dialog
  const handleCellClick = (day: string, timeSlot: string) => {
    const existing = schedule.find((s) => s.day === day && s.timeSlot === timeSlot);
    setActiveCellSlot({ day, timeSlot });
    setModalSubject(existing ? existing.subject : selectedSubject || subjectsPalette[0]);
    setModalTopic(existing ? existing.topic || '' : '');
    setModalOpen(true);
  };

  const handleSaveModalSlot = () => {
    if (!activeCellSlot) return;
    const { day, timeSlot } = activeCellSlot;

    const existingIndex = schedule.findIndex((s) => s.day === day && s.timeSlot === timeSlot);
    if (existingIndex >= 0) {
      const updated = [...schedule];
      updated[existingIndex] = {
        ...updated[existingIndex],
        subject: modalSubject,
        topic: modalTopic,
      };
      setSchedule(updated);
    } else {
      const newSlot: StudySlot = {
        id: `${day}-${timeSlot}-${Date.now()}`,
        day,
        timeSlot,
        subject: modalSubject,
        topic: modalTopic,
        completed: false,
      };
      setSchedule([...schedule, newSlot]);
    }
    setModalOpen(false);
  };

  const handleRemoveSlot = (day: string, timeSlot: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSchedule(schedule.filter((s) => !(s.day === day && s.timeSlot === timeSlot)));
  };

  const handleToggleComplete = (day: string, timeSlot: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSchedule(
      schedule.map((s) => {
        if (s.day === day && s.timeSlot === timeSlot) {
          const nextState = !s.completed;
          if (nextState) {
            // Reward 10 XP on completion!
            onUpdateUser({ points: user.points + 10 });
          }
          return { ...s, completed: nextState };
        }
        return s;
      })
    );
  };

  // Auto-generate AI Routine
  const handleGenerateAiRoutine = () => {
    const aiRoutine: StudySlot[] = [
      { id: 'Sat-m', day: 'Sat', timeSlot: 'morning', subject: 'Physics', topic: '১ম অধ্যায়: ভেক্টর ও গতিবিদ্যা', completed: true },
      { id: 'Sat-e', day: 'Sat', timeSlot: 'evening', subject: 'Higher Math', topic: '৩য় অধ্যায়: ম্যাট্রিক্স ও নির্ণায়ক', completed: false },
      { id: 'Sun-m', day: 'Sun', timeSlot: 'morning', subject: 'Chemistry', topic: '২য় অধ্যায়: পরমাণুর গঠন', completed: false },
      { id: 'Sun-n', day: 'Sun', timeSlot: 'night', subject: 'ICT', topic: '৩য় অধ্যায়: সংখ্যা পদ্ধতি', completed: false },
      { id: 'Mon-m', day: 'Mon', timeSlot: 'morning', subject: 'Biology', topic: '১ম অধ্যায়: কোষ ও এর গঠন', completed: false },
      { id: 'Mon-e', day: 'Mon', timeSlot: 'evening', subject: 'Physics', topic: '৪র্থ অধ্যায়: নিউটনীয় বলবিদ্যা', completed: false },
      { id: 'Tue-m', day: 'Tue', timeSlot: 'morning', subject: 'Higher Math', topic: '৭ম অধ্যায়: ত্রিকোণমিতি', completed: false },
      { id: 'Tue-n', day: 'Tue', timeSlot: 'night', subject: 'English', topic: 'Completing Sentences & Modifiers', completed: false },
      { id: 'Wed-m', day: 'Wed', timeSlot: 'morning', subject: 'Chemistry', topic: '৪র্থ অধ্যায়: রাসায়নিক পরিবর্তন', completed: false },
      { id: 'Wed-e', day: 'Wed', timeSlot: 'evening', subject: 'Bangla', topic: 'ব্যাকরণ ও সমাস অনুশীলন', completed: false },
      { id: 'Thu-m', day: 'Thu', timeSlot: 'morning', subject: 'Biology', topic: '২য় অধ্যায়: কোষ বিভাজন', completed: false },
      { id: 'Thu-n', day: 'Thu', timeSlot: 'night', subject: 'ICT', topic: '৪র্থ অধ্যায়: ওয়েব ডিজাইন পরিচিতি', completed: false },
      { id: 'Fri-m', day: 'Fri', timeSlot: 'morning', subject: 'Physics', topic: 'সাপ্তাহিক মডেল টেস্ট প্র্যাকটিস', completed: false },
      { id: 'Fri-e', day: 'Fri', timeSlot: 'evening', subject: 'Higher Math', topic: 'সাপ্তাহিক রিভিশন ও কুইজ', completed: false },
    ];
    setSchedule(aiRoutine);
  };

  const totalSlots = schedule.length;
  const completedSlots = schedule.filter((s) => s.completed).length;
  const progressPercent = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 my-4">
      {/* Top Banner & AI Recommendation */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-teal-900/60 via-[#003d34] to-cyan-950/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-400 text-[#002b24] font-black rounded-xl shadow-md">
                <Calendar className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-black text-white">
                {lang === 'en' ? 'Smart Board Study Planner' : 'স্মার্ট বোর্ড স্টাডি প্ল্যানার'}
              </h2>
            </div>
            <p className="text-xs text-emerald-200/90 max-w-2xl">
              {lang === 'en'
                ? 'Organize your weekly revision routine for SSC & HSC board exams. Drag subjects into study slots or click any grid cell to customize your preparation targets!'
                : 'SSC ও HSC বোর্ড পরীক্ষার জন্য আপনার সাপ্তাহিক পড়ার রুটিন প্ল্যান করুন। বিষয় নির্বাচন করে ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা যেকোনো স্লটে ক্লিক করে টপিক সিলেক্ট করুন!'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleGenerateAiRoutine}
              className="px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#002b24] font-extrabold text-xs rounded-2xl shadow-xl shadow-amber-900/30 flex items-center gap-2 transition-all active:scale-95 uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-[#002b24]" />
              {lang === 'en' ? 'Auto-Generate AI Routine' : 'এআই রুটিন তৈরি করুন'}
            </button>
          </div>
        </div>

        {/* Weekly Study Progress Metric */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                {lang === 'en' ? 'Scheduled Slots' : 'নির্ধারিত পড়াশোনা'}
              </p>
              <p className="text-xl font-black text-white font-mono">{totalSlots} {lang === 'en' ? 'Sessions' : 'সেশন'}</p>
            </div>
            <BookOpen className="w-8 h-8 text-emerald-300/40" />
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                {lang === 'en' ? 'Completed Sessions' : 'সম্পন্ন পড়ার সেশন'}
              </p>
              <p className="text-xl font-black text-amber-300 font-mono">{completedSlots} / {totalSlots}</p>
            </div>
            <Award className="w-8 h-8 text-amber-300/40" />
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1.5 flex flex-col justify-center">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-emerald-200">{lang === 'en' ? 'Weekly Target Completion' : 'সাপ্তাহিক টার্গেট'}</span>
              <span className="text-amber-300 font-mono font-black">{progressPercent}%</span>
            </div>
            <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Study Reminder Notification Card */}
      <StudyReminderCard user={user} onUpdateUser={onUpdateUser} />

      {/* Interactive Subject Drag Palette */}
      <div className="p-5 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/20 text-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
              {lang === 'en' ? 'Select or Drag Subject Palette:' : 'বিষয় নির্বাচন করুন (ড্র্যাগ অথবা ক্লিক করুন):'}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-200/70 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            {user.academicLevel} • {user.group}
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {subjectsPalette.map((sub) => {
            const colors = SUBJECT_COLORS[sub] || SUBJECT_COLORS.DEFAULT;
            const isSelected = selectedSubject === sub;

            return (
              <div
                key={sub}
                draggable
                onDragStart={() => handleDragStart(sub)}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3.5 py-2 rounded-2xl border ${colors.bg} ${colors.border} text-xs font-bold flex items-center gap-2 cursor-grab active:cursor-grabbing transition-all hover:scale-105 select-none ${
                  isSelected ? 'ring-2 ring-amber-400 shadow-lg scale-105' : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${colors.badge}`}></span>
                <span className={colors.text}>{sub}</span>
                <GripVertical className="w-3 h-3 opacity-40" />
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-emerald-200/60 italic font-mono">
          💡 {lang === 'en'
            ? 'Tip: Drag any subject onto a time slot in the schedule below, or simply click any calendar cell.'
            : 'পরামর্শ: ওপরের যেকোনো বিষয়টি ড্র্যাগ করে নিচের ক্যালেন্ডার স্লটে ছেড়ে দিন অথবা যেকোনো স্লটে ক্লিক করুন।'}
        </p>
      </div>

      {/* Calendar Weekly Grid */}
      <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 text-white space-y-4 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header Row (Days of Week) */}
          <div className="grid grid-cols-8 gap-2 mb-3 text-center border-b border-white/15 pb-3">
            <div className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Time Slot' : 'সময়সূচী'}
            </div>
            {DAY_KEYS.map((key, idx) => (
              <div key={key} className="p-2 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs font-black text-white">{daysList[idx]}</p>
                <p className="text-[10px] text-emerald-300 font-mono font-bold">{key}</p>
              </div>
            ))}
          </div>

          {/* Time Slots Rows */}
          <div className="space-y-3">
            {timeSlotsList.map((slotObj, slotIdx) => {
              const slotKey = SLOTS_EN[slotIdx].key; // 'morning', 'afternoon', etc.

              return (
                <div key={slotKey} className="grid grid-cols-8 gap-2 items-stretch">
                  {/* Slot Label */}
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-center text-center">
                    <span className="text-lg mb-1">{slotObj.icon}</span>
                    <p className="text-[11px] font-extrabold text-amber-300 leading-tight">
                      {slotObj.name.split(' ')[0]}
                    </p>
                    <p className="text-[9px] text-emerald-200/70 font-mono mt-0.5">
                      {slotObj.name.substring(slotObj.name.indexOf('('))}
                    </p>
                  </div>

                  {/* Days Cells */}
                  {DAY_KEYS.map((dayKey) => {
                    const scheduledSlot = schedule.find((s) => s.day === dayKey && s.timeSlot === slotKey);
                    const colors = scheduledSlot
                      ? SUBJECT_COLORS[scheduledSlot.subject] || SUBJECT_COLORS.DEFAULT
                      : null;

                    return (
                      <div
                        key={`${dayKey}-${slotKey}`}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(dayKey, slotKey)}
                        onClick={() => handleCellClick(dayKey, slotKey)}
                        className={`p-2.5 rounded-2xl border transition-all min-h-[95px] flex flex-col justify-between cursor-pointer group relative ${
                          scheduledSlot
                            ? `${colors?.bg} ${colors?.border} hover:border-amber-400`
                            : 'bg-white/5 border-dashed border-white/15 hover:border-emerald-400/60 hover:bg-white/10'
                        }`}
                      >
                        {scheduledSlot ? (
                          <>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${colors?.badge}`}>
                                  {scheduledSlot.subject}
                                </span>

                                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                                  <button
                                    onClick={(e) => handleToggleComplete(dayKey, slotKey, e)}
                                    title={scheduledSlot.completed ? 'Mark Incomplete' : 'Mark Completed (+10 XP)'}
                                    className="p-1 hover:bg-white/20 rounded-md transition-all"
                                  >
                                    {scheduledSlot.completed ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-300 fill-emerald-500/30" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-amber-300 hover:text-emerald-300" />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => handleRemoveSlot(dayKey, slotKey, e)}
                                    title="Remove Slot"
                                    className="p-1 hover:bg-rose-500/20 text-rose-300 rounded-md transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <p
                                className={`text-[11px] font-medium leading-snug line-clamp-2 ${
                                  scheduledSlot.completed ? 'line-through opacity-70 text-emerald-200' : 'text-white'
                                }`}
                              >
                                {scheduledSlot.topic || 'Revision Session'}
                              </p>
                            </div>

                            <div className="pt-1 flex items-center justify-between text-[9px] text-emerald-300/80 font-mono">
                              <span>{scheduledSlot.completed ? '✓ Completed (+10 XP)' : '• Scheduled'}</span>
                              <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 group-hover:opacity-100 transition-opacity space-y-1 my-auto">
                            <Plus className="w-4 h-4 text-emerald-300" />
                            <span className="text-[10px] text-emerald-200 font-medium">
                              {lang === 'en' ? '+ Add Slot' : '+ যোগ করুন'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add / Edit Slot Modal Dialog */}
      {modalOpen && activeCellSlot && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#002b24] border-2 border-amber-400/50 p-6 rounded-3xl max-w-md w-full text-white space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2.5 bg-amber-400 text-[#002b24] font-black rounded-2xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {lang === 'en' ? 'Schedule Study Slot' : 'পড়ার স্লট সিডিউল করুন'}
                </h3>
                <p className="text-xs text-emerald-300/90 font-mono">
                  {activeCellSlot.day} • {activeCellSlot.timeSlot.toUpperCase()} Session
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-emerald-300 uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Select Subject:' : 'বিষয় নির্বাচন করুন:'}
                </label>
                <select
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                >
                  {subjectsPalette.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Target Topic / Chapter:' : 'টার্গেট অধ্যায় / বিষয়বস্তু:'}
                </label>
                <input
                  type="text"
                  value={modalTopic}
                  onChange={(e) => setModalTopic(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'e.g. Chapter 2: Vector Math & Formula Revision'
                      : 'যেমন: ২য় অধ্যায়: ভেক্টর ম্যাথ ও সূত্র রিভিশন'
                  }
                  className="w-full px-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white placeholder-emerald-300/40 focus:border-amber-400 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-1/3 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl transition-all"
              >
                {lang === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                type="button"
                onClick={handleSaveModalSlot}
                className="w-2/3 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
              >
                <Check className="w-4 h-4 text-amber-300" />
                {lang === 'en' ? 'Save Schedule' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
