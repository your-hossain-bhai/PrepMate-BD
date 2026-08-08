import React, { useState } from 'react';
import { CommunityPost, UserProfile, CommentItem } from '../types';
import { INITIAL_POSTS } from '../data/mockCommunity';
import { useLanguage } from '../LanguageContext';
import { ThumbsUp, MessageSquare, Send, PlusCircle, Bot, Sparkles, Filter, Loader2, Trophy, Users } from 'lucide-react';
import { Leaderboard } from './Leaderboard';

interface CommunityFeedViewProps {
  user: UserProfile;
}

export const CommunityFeedView: React.FC<CommunityFeedViewProps> = ({ user }) => {
  const { lang, t } = useLanguage();
  const [activeCommunityTab, setActiveCommunityTab] = useState<'feed' | 'leaderboard'>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // New post state
  const [newSubject, setNewSubject] = useState('Physics');
  const [newQuestion, setNewQuestion] = useState('');
  const [newPostLoading, setNewPostLoading] = useState(false);

  // Comment state
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // AI Tutor response loading on post
  const [aiLoadingPostId, setAiLoadingPostId] = useState<string | null>(null);

  const subjects = ['All', 'Physics', 'Chemistry', 'Higher Math', 'ICT', 'Biology'];

  const filteredPosts = posts.filter(
    (p) => selectedSubjectFilter === 'All' || p.subject.toLowerCase().includes(selectedSubjectFilter.toLowerCase())
  );

  const handleToggleUpvote = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const userUpvoted = !p.userUpvoted;
          return {
            ...p,
            userUpvoted,
            upvotes: userUpvoted ? p.upvotes + 1 : p.upvotes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setNewPostLoading(true);

    setTimeout(() => {
      const newEntry: CommunityPost = {
        id: `post-${Date.now()}`,
        author: `${user.name} (${user.academicLevel})`,
        level: user.academicLevel,
        subject: newSubject,
        questionText: newQuestion,
        timestamp: lang === 'en' ? 'Just now' : 'এখনই',
        upvotes: 1,
        userUpvoted: true,
        comments: [],
      };

      setPosts([newEntry, ...posts]);
      setNewQuestion('');
      setShowNewPostModal(false);
      setNewPostLoading(false);
    }, 400);
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: user.name,
      text: commentInput,
      timestamp: lang === 'en' ? 'Just now' : 'এখনই',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );

    setCommentInput('');
  };

  const handleTriggerAiTutorForPost = async (post: CommunityPost) => {
    setAiLoadingPostId(post.id);

    try {
      const res = await fetch('/api/tutor/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: post.questionText,
          selectedOption: 'Community Question Query',
          correctOption: 'Comprehensive Solution',
          subject: post.subject,
          academicLevel: post.level,
          language: lang,
        }),
      });

      const data = await res.json();

      const aiComment: CommentItem = {
        id: `ai-${Date.now()}`,
        author: 'PrepMate AI Tutor 🤖',
        text: data.explanation || '💡 Gemini AI Tutor: Always review textbook key formulas for this concept.',
        isAiTutor: true,
        timestamp: lang === 'en' ? 'Just now' : 'এখনই',
      };

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === post.id) {
            return {
              ...p,
              comments: [aiComment, ...p.comments],
            };
          }
          return p;
        })
      );
      setActiveCommentPostId(post.id);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoadingPostId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* View Switcher Tabs */}
      <div className="bg-white/10 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/20 flex items-center justify-between gap-2 shadow-lg">
        <button
          onClick={() => setActiveCommunityTab('feed')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeCommunityTab === 'feed'
              ? 'bg-amber-400 text-[#002b24] shadow-md font-black'
              : 'text-emerald-200 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" /> {t('feedTab')}
        </button>

        <button
          onClick={() => setActiveCommunityTab('leaderboard')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeCommunityTab === 'leaderboard'
              ? 'bg-amber-400 text-[#002b24] shadow-md font-black'
              : 'text-emerald-200 hover:text-white hover:bg-white/10'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" /> {t('leaderboardTab')}
        </button>
      </div>

      {activeCommunityTab === 'leaderboard' ? (
        <Leaderboard currentUser={user} />
      ) : (
        <>
          {/* Header & Post Modal Trigger */}
          <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Users className="w-3.5 h-3.5 text-amber-300" /> SSC & HSC Student Forum
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">{t('communityHeader')}</h2>
              <p className="text-xs text-emerald-200/80 mt-1">
                {t('communitySubtitle')}
              </p>
            </div>

            <button
              onClick={() => setShowNewPostModal(true)}
              className="py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-white" /> {t('postQuestionBtn')}
            </button>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 shrink-0 px-2 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-amber-300" /> {t('subjectFilter')}
            </span>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubjectFilter(sub)}
                className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all border ${
                  selectedSubjectFilter === sub
                    ? 'bg-amber-400 text-[#002b24] border-amber-300 shadow-md font-extrabold'
                    : 'bg-white/10 border-white/15 text-emerald-200/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                {sub === 'All' ? t('filterAll') : sub}
              </button>
            ))}
          </div>

          {/* Feed List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4">
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-400 text-[#002b24] font-black rounded-2xl flex items-center justify-center text-sm shadow-md">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{post.author}</h4>
                      <span className="text-[10px] text-emerald-300/70">{post.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-[11px] rounded-full border border-emerald-500/30">
                      {post.subject}
                    </span>
                    <span className="px-2.5 py-1 bg-white/10 text-white font-mono font-bold text-[10px] rounded-lg border border-white/15">
                      {post.level}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm font-medium text-slate-100 leading-relaxed whitespace-pre-line pt-1">
                  {post.questionText}
                </p>

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-emerald-200">
                  <button
                    onClick={() => handleToggleUpvote(post.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-bold transition-all ${
                      post.userUpvoted
                        ? 'bg-amber-400 text-[#002b24] border-amber-300 shadow'
                        : 'border-white/15 bg-white/5 hover:bg-white/15 text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.upvotes}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 font-semibold text-white transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                    <span>{post.comments.length} {lang === 'en' ? 'Replies' : 'টি উত্তর'}</span>
                  </button>

                  <button
                    onClick={() => handleTriggerAiTutorForPost(post)}
                    disabled={aiLoadingPostId === post.id}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all shadow-lg shadow-emerald-900/30"
                  >
                    {aiLoadingPostId === post.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5 text-amber-300" /> {lang === 'en' ? 'AI Solution' : 'AI Tutor উত্তর'}
                      </>
                    )}
                  </button>
                </div>

                {/* Comments Drawer */}
                {(activeCommentPostId === post.id || post.comments.length > 0) && (
                  <div className="pt-3 space-y-2.5 border-t border-white/10">
                    {post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                          comment.isAiTutor
                            ? 'bg-[#001f1a] text-slate-100 border border-emerald-500/40 shadow-inner'
                            : 'bg-white/5 border border-white/10 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className={comment.isAiTutor ? 'text-amber-300 flex items-center gap-1.5' : 'text-white'}>
                            {comment.isAiTutor && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                            {comment.author}
                          </span>
                          <span className="text-[10px] text-emerald-300/60 font-mono">{comment.timestamp}</span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed text-emerald-100/90">{comment.text}</p>
                      </div>
                    ))}

                    {/* Comment Input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder={t('addCommentPlaceholder')}
                        className="flex-1 px-3.5 py-2.5 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl text-xs flex items-center gap-1 shadow transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal: Create Post */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#002b24] border border-white/20 max-w-lg w-full p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 text-white">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> {t('newPostTitle')}
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                  {t('subjectPickerLabel')}
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#003d34] border border-white/20 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Higher Math">Higher Math</option>
                  <option value="ICT">ICT</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                  {t('questionTitleLabel')}
                </label>
                <textarea
                  rows={4}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. Having difficulty understanding projectile motion formulas...' : 'যেমন: গতিবিদ্যা অধ্যায়ের এই সুত্রটির প্রয়োগ বুঝতে সমস্যা হচ্ছে...'}
                  className="w-full p-3.5 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white placeholder-emerald-300/40 focus:border-amber-400 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-emerald-200 hover:bg-white/10 rounded-2xl transition-all"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  disabled={newPostLoading}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl text-xs shadow-lg flex items-center gap-2 transition-all"
                >
                  {newPostLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" /> : (lang === 'en' ? 'Post Question' : 'পোস্ট নিশ্চিত করুন')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
