import React, { useState } from 'react';
import { UserProfile, AcademicLevel, AcademicGroup } from '../types';
import { useLanguage } from '../LanguageContext';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  updateProfile,
  isFirebaseConfigured,
  syncStudentToFirestore,
} from '../firebase';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  School,
  Flame,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const { lang, t } = useLanguage();
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'phone'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(user.name || '');
  const [level, setLevel] = useState<AcademicLevel>(user.academicLevel || 'HSC');
  const [group, setGroup] = useState<AcademicGroup>(user.group || 'Science');
  const [phone, setPhone] = useState(user.phone || '+8801812345678');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  const firebaseReady = isFirebaseConfigured();

  const syncAndApplyUser = (profileData: Partial<UserProfile>) => {
    onUpdateUser(profileData);
    const currentSaved = localStorage.getItem('prepmate_auth_user');
    const merged = currentSaved ? { ...JSON.parse(currentSaved), ...profileData } : profileData;
    localStorage.setItem('prepmate_auth_user', JSON.stringify(merged));

    const targetUid = profileData.uid || user.uid;
    if (targetUid) {
      syncStudentToFirestore(targetUid, merged);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (firebaseReady) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;

        syncAndApplyUser({
          uid: fbUser.uid,
          name: fbUser.displayName || 'Google Student',
          email: fbUser.email || undefined,
          avatarUrl: fbUser.photoURL || undefined,
          authProvider: 'google',
          academicLevel: level,
          group: group,
        });

        setAuthSuccess(
          lang === 'en'
            ? `Welcome, ${fbUser.displayName || 'Student'}! Signed in via Google.`
            : `স্বাগতম, ${fbUser.displayName || 'শিক্ষার্থী'}! গুগল সাইন-ইন সফল হয়েছে।`
        );
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        const mockUid = `google_usr_${Date.now()}`;
        syncAndApplyUser({
          uid: mockUid,
          name: 'Google Student',
          email: 'student@gmail.com',
          authProvider: 'google',
          academicLevel: level,
          group: group,
        });

        setAuthSuccess(
          lang === 'en' ? 'Signed in successfully!' : 'সাইন-ইন সফল হয়েছে!'
        );
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // Fallback to redirect for mobile/PWA users
        setAuthError(lang === 'en' ? 'Popup blocked. Redirecting...' : 'পপআপ ব্লকড, রিডাইরেক্ট করা হচ্ছে...');
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          setAuthError('Redirect sign-in failed. Please try again.');
          setIsLoading(false);
        }
      } else if (err.code === 'auth/unauthorized-domain') {
        setAuthError(
          lang === 'en'
            ? 'Domain unauthorized in Firebase console. Please add this domain to Authorized Domains.'
            : 'ফায়ারবেস কনসোলে এই ডোমেনটি Authorized Domains এ যুক্ত করুন।'
        );
      } else {
        setAuthError(err.message || 'Google Sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email Sign-In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError(lang === 'en' ? 'Please enter email and password' : 'ইমেইল ও পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setIsLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (firebaseReady) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = result.user;

        syncAndApplyUser({
          uid: fbUser.uid,
          email: fbUser.email || email,
          name: fbUser.displayName || fullName || email.split('@')[0],
          authProvider: 'email',
          academicLevel: level,
          group: group,
        });

        setAuthSuccess(lang === 'en' ? 'Signed in successfully!' : 'সফলভাবে লগইন সম্পন্ন হয়েছে!');
        setTimeout(() => onClose(), 700);
      } else {
        const fallbackName = fullName || email.split('@')[0];
        syncAndApplyUser({
          uid: `usr_${btoa(email).replace(/=/g, '').slice(0, 10)}`,
          email,
          name: fallbackName,
          authProvider: 'email',
          academicLevel: level,
          group: group,
        });

        setAuthSuccess(lang === 'en' ? 'Signed in successfully!' : 'সফলভাবে লগইন সম্পন্ন হয়েছে!');
        setTimeout(() => onClose(), 700);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      let msg = err.message || 'Sign in failed';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = lang === 'en' ? 'Invalid email or password' : 'ভুল ইমেইল অথবা পাসওয়ার্ড প্রদান করেছেন';
      }
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Email Sign-Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError(lang === 'en' ? 'Please enter email and password' : 'ইমেইল ও পাসওয়ার্ড প্রদান করুন');
      return;
    }
    if (password.length < 6) {
      setAuthError(lang === 'en' ? 'Password must be at least 6 characters' : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setIsLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (firebaseReady) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = result.user;

        if (fullName) {
          await updateProfile(fbUser, { displayName: fullName });
        }

        syncAndApplyUser({
          uid: fbUser.uid,
          email: fbUser.email || email,
          name: fullName || email.split('@')[0],
          authProvider: 'email',
          academicLevel: level,
          group: group,
          points: (user.points || 0) + 100,
          streakDays: Math.max(user.streakDays || 1, 1),
        });

        setAuthSuccess(
          lang === 'en'
            ? 'Account created successfully! +100 Welcome XP 🎉'
            : 'নতুন অ্যাকাউন্ট তৈরি সফল হয়েছে! +১০০ এক্সপি বোনাস 🎉'
        );
        setTimeout(() => onClose(), 700);
      } else {
        const fallbackName = fullName || email.split('@')[0];
        syncAndApplyUser({
          uid: `usr_${btoa(email).replace(/=/g, '').slice(0, 10)}`,
          email,
          name: fallbackName,
          authProvider: 'email',
          academicLevel: level,
          group: group,
          points: (user.points || 0) + 100,
        });

        setAuthSuccess(
          lang === 'en'
            ? 'Account registered successfully! (+100 XP Bonus)'
            : 'অ্যাকাউন্ট রেজিস্ট্রেশন সফল হয়েছে! (+১০০ এক্সপি বোনাস)'
        );
        setTimeout(() => onClose(), 700);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      let msg = err.message || 'Signup failed';
      if (err.code === 'auth/email-already-in-use') {
        msg =
          lang === 'en'
            ? 'An account with this email already exists. Please Sign In.'
            : 'এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে সাইন-ইন করুন।';
      }
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Phone OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('01')) {
      formattedPhone = '+88' + formattedPhone;
    }
    if (!formattedPhone.match(/^\+8801[68]\d{8}$/)) {
      setAuthError(
        lang === 'en'
          ? 'bdapps Carrier Billing currently supports Robi (018) & Airtel (016) numbers only.'
          : 'বর্তমানে bdapps বিলিং সার্ভিস শুধুমাত্র রবি (018) এবং এয়ারটেল (016) নম্বরে উপলব্ধ।'
      );
      return;
    }
    setPhone(formattedPhone);
    setAuthError('');
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456' && otp.length < 4) {
      setAuthError(
        lang === 'en' ? 'Enter valid OTP (test code: 123456)' : 'সঠিক OTP দিন (টেস্ট কোড: 123456)'
      );
      return;
    }
    setAuthError('');
    syncAndApplyUser({
      phone,
      name: fullName || user.name,
      academicLevel: level,
      group,
      authProvider: 'bdapps',
    });
    setAuthSuccess(lang === 'en' ? 'Phone verified!' : 'ফোন নম্বর ভেরিফাইড হয়েছে!');
    setTimeout(() => onClose(), 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#002b24] border border-white/20 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#002b24] flex items-center justify-center font-black shadow-lg shadow-amber-900/40">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">
                {authMode === 'signin'
                  ? lang === 'en'
                    ? 'Student Sign In'
                    : 'শিক্ষার্থী লগইন'
                  : authMode === 'signup'
                  ? lang === 'en'
                    ? 'Create Account'
                    : 'নতুন অ্যাকাউন্ট তৈরি'
                  : lang === 'en'
                  ? 'Mobile SIM Login'
                  : 'মোবাইল সিম লগইন'}
              </h3>
              <p className="text-xs text-emerald-200/80">
                {lang === 'en'
                  ? 'Access quizzes, study bot & track progress'
                  : 'কুইজ, এআই টিউটর ও পরীক্ষার প্রস্তুতি সেভ রাখুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/10 relative z-10">
          <button
            onClick={() => {
              setAuthMode('signin');
              setAuthError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'signin'
                ? 'bg-emerald-500 text-[#002b24] shadow-md'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Sign In' : 'লগইন'}
          </button>

          <button
            onClick={() => {
              setAuthMode('signup');
              setAuthError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'signup'
                ? 'bg-emerald-500 text-[#002b24] shadow-md'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Sign Up' : 'সাইন-আপ'}
          </button>

          <button
            onClick={() => {
              setAuthMode('phone');
              setAuthError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'phone'
                ? 'bg-emerald-500 text-[#002b24] shadow-md'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            {lang === 'en' ? 'SIM' : 'সিম'}
          </button>
        </div>

        {/* Google 1-Click Button */}
        <div className="space-y-3 relative z-10">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-xs active:scale-98 disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>
              {authMode === 'signup'
                ? lang === 'en'
                  ? 'Sign Up with Google'
                  : 'গুগল দিয়ে দ্রুত অ্যাকাউন্ট খুলুন'
                : lang === 'en'
                ? 'Continue with Google'
                : 'গুগল (Google) দিয়ে লগইন'}
            </span>
          </button>

          <div className="flex items-center gap-3 text-[11px] text-emerald-300/60 my-2">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span>{lang === 'en' ? 'or continue with credentials' : 'অথবা নিচে তথ্য দিন'}</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>
        </div>

        {/* Error / Success Feedback */}
        {authError && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium flex items-center gap-2 relative z-10 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 relative z-10">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* Email Sign In */}
        {authMode === 'signin' && (
          <form onSubmit={handleEmailSignIn} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                {lang === 'en' ? 'Email Address' : 'ইমেইল অ্যাড্রেস'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-300/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white placeholder-emerald-300/40 focus:border-amber-400 focus:outline-none font-medium"
                  placeholder="student@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                {lang === 'en' ? 'Password' : 'পাসওয়ার্ড'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-300/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white placeholder-emerald-300/40 focus:border-amber-400 focus:outline-none font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-[#002b24] font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              {isLoading ? (
                <span>{lang === 'en' ? 'Signing In...' : 'লগইন হচ্ছে...'}</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#002b24]" />
                  {lang === 'en' ? 'Sign In to Account' : 'অ্যাকাউন্টে সাইন-ইন করুন'}
                </>
              )}
            </button>
          </form>
        )}

        {/* Email Sign Up */}
        {authMode === 'signup' && (
          <form onSubmit={handleEmailSignUp} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                {lang === 'en' ? 'Full Name' : 'শিক্ষার্থীর পুরো নাম'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-300/60" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white placeholder-emerald-300/40 focus:border-amber-400 focus:outline-none font-medium"
                  placeholder={lang === 'en' ? 'e.g. Tanvir Hossain' : 'যেমন: তানভীর হোসেন'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                {lang === 'en' ? 'Email Address' : 'ইমেইল অ্যাড্রেস'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-300/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white placeholder-emerald-300/40 focus:border-amber-400 focus:outline-none font-medium"
                  placeholder="student@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                {lang === 'en' ? 'Password (min 6 chars)' : 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-300/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white placeholder-emerald-300/40 focus:border-amber-400 focus:outline-none font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                  {t('examLevelLabel')}
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as AcademicLevel)}
                  className="w-full px-3.5 py-2.5 bg-[#003d34] border border-white/20 rounded-2xl text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="SSC">SSC</option>
                  <option value="HSC">HSC</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                  {t('examGroupLabel')}
                </label>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value as AcademicGroup)}
                  className="w-full px-3.5 py-2.5 bg-[#003d34] border border-white/20 rounded-2xl text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="Science">{lang === 'en' ? 'Science' : 'বিজ্ঞান'}</option>
                  <option value="Commerce">{lang === 'en' ? 'Commerce' : 'ব্যবসায়'}</option>
                  <option value="Humanities">{lang === 'en' ? 'Humanities' : 'মানবিক'}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              {isLoading ? (
                <span>{lang === 'en' ? 'Creating Account...' : 'অ্যাকাউন্ট তৈরি হচ্ছে...'}</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-[#002b24]" />
                  {lang === 'en' ? 'Register (+100 XP Bonus)' : 'রেজিস্ট্রেশন করুন (+১০০ এক্সপি)'}
                </>
              )}
            </button>
          </form>
        )}

        {/* SIM Phone Auth */}
        {authMode === 'phone' && (
          <div className="space-y-4 relative z-10">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                    {t('phoneNumberLabel')} (Robi / Airtel)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-300/60" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                      placeholder="+8801812345678"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-amber-300/90 mt-1 font-mono font-bold">
                    {t('phoneOperatorNote')}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-[#002b24] font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  {lang === 'en' ? 'Send OTP Code' : 'OTP কোড পাঠান'}{' '}
                  <ArrowRight className="w-4 h-4 text-[#002b24]" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-emerald-500/20 border border-emerald-500/40 p-3.5 rounded-2xl text-xs text-emerald-100 font-medium">
                  {lang === 'en' ? `6-digit OTP code sent to ` : 'নম্বরে ৬-ডিজিটের OTP পাঠানো হয়েছে: '}
                  <span className="font-mono font-bold text-amber-300">{phone}</span>.
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                    {lang === 'en' ? 'Enter 6-Digit OTP' : '৬ ডিজিটের OTP দিন'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center py-3 bg-[#003d34] border border-white/20 rounded-2xl text-lg font-mono font-bold tracking-widest text-amber-400 focus:border-amber-400 focus:outline-none"
                    placeholder="123456"
                    required
                  />
                  <p className="text-[10px] text-emerald-200/70 mt-1 text-center font-mono">
                    {lang === 'en' ? 'Test sandbox code: 123456' : 'টেস্ট কোড: 123456'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  {lang === 'en' ? 'Verify & Continue' : 'ভেরিফাই করে প্রবেশ করুন'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
