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
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
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
  RotateCcw,
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
  const [phone, setPhone] = useState(user.phone || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

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
      if (firebaseReady && auth) {
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
            ? `Domain unauthorized in Firebase console. Please add EXACTLY this domain: ${window.location.hostname}`
            : `ফায়ারবেস কনসোলে Authorized Domains-এ হুবহু এই ডোমেনটি যুক্ত করুন: ${window.location.hostname}`
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
      if (firebaseReady && auth) {
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
      if (firebaseReady && auth) {
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

  // Helper: Format raw phone input to E.164 (+8801XXXXXXXXX)
  const formatPhoneNumber = (raw: string): string => {
    let cleaned = raw.replace(/[\s\-()]/g, '').trim();
    if (cleaned.startsWith('01')) {
      return '+88' + cleaned;
    }
    if (cleaned.startsWith('8801')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('1') && cleaned.length === 10) {
      return '+880' + cleaned;
    }
    if (!cleaned.startsWith('+') && cleaned.length > 0) {
      return '+88' + cleaned;
    }
    return cleaned;
  };

  // Firebase Phone Auth - Send SMS OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatPhoneNumber(phone);

    if (!/^\+8801[3-9]\d{8}$/.test(formatted) && !/^\+[1-9]\d{7,14}$/.test(formatted)) {
      setAuthError(
        lang === 'en'
          ? 'Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX)'
          : 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
      );
      return;
    }

    setPhone(formatted);
    setIsSendingOtp(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (firebaseReady && auth) {
        // Clear any previous recaptcha verifier
        if ((window as any).recaptchaVerifier) {
          try {
            (window as any).recaptchaVerifier.clear();
          } catch (e) {
            console.warn('Recaptcha clear notice:', e);
          }
          (window as any).recaptchaVerifier = null;
        }

        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            setAuthError(
              lang === 'en'
                ? 'reCAPTCHA expired. Please try sending OTP again.'
                : 'reCAPTCHA এক্সপায়ার হয়েছে। আবার চেষ্টা করুন।'
            );
          },
        });
        (window as any).recaptchaVerifier = verifier;

        const confirmation = await signInWithPhoneNumber(auth, formatted, verifier);
        setConfirmationResult(confirmation);
        setOtpSent(true);
        setAuthSuccess(
          lang === 'en'
            ? `6-digit SMS OTP sent to ${formatted}`
            : `${formatted} নম্বরে ৬-ডিজিটের SMS OTP কোড পাঠানো হয়েছে`
        );
      } else {
        setOtpSent(true);
        setAuthSuccess(
          lang === 'en'
            ? `Demo OTP sent to ${formatted} (code: 123456)`
            : `টেস্ট OTP পাঠানো হয়েছে: ${formatted} (কোড: 123456)`
        );
      }
    } catch (err: any) {
      console.error('Phone sign-in send OTP error:', err);
      let msg = err.message || 'Failed to send SMS OTP';
      if (err.code === 'auth/invalid-phone-number') {
        msg = lang === 'en' ? 'Invalid mobile phone number format.' : 'মোবাইল নম্বর ফরম্যাট সঠিক নয়।';
      } else if (err.code === 'auth/quota-exceeded' || err.code === 'auth/too-many-requests') {
        msg =
          lang === 'en'
            ? 'SMS quota exceeded or too many attempts. Please try again later.'
            : 'অতিরিক্ত চেষ্টার কারণে সাময়িক ব্লক হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।';
      } else if (err.code === 'auth/captcha-check-failed') {
        msg = lang === 'en' ? 'reCAPTCHA verification failed. Please try again.' : 'reCAPTCHA ভেরিফিকেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg =
          lang === 'en'
            ? `Domain unauthorized. Please add EXACTLY this domain in Firebase console: ${window.location.hostname}`
            : `ফায়ারবেস কনসোলে Authorized Domains-এ হুবহু এই ডোমেনটি যুক্ত করুন: ${window.location.hostname}`;
      }
      setAuthError(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Firebase Phone Auth - Verify SMS OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedOtp = otp.trim();
    if (trimmedOtp.length < 6) {
      setAuthError(
        lang === 'en' ? 'Please enter the 6-digit OTP code' : 'অনুগ্রহ করে ৬ ডিজিটের OTP কোডটি লিখুন'
      );
      return;
    }

    setIsVerifyingOtp(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (confirmationResult) {
        const result = await confirmationResult.confirm(trimmedOtp);
        const fbUser = result.user;

        if (fullName) {
          try {
            await updateProfile(fbUser, { displayName: fullName });
          } catch (e) {
            console.warn('Profile name update notice:', e);
          }
        }

        syncAndApplyUser({
          uid: fbUser.uid,
          phone: fbUser.phoneNumber || phone,
          name: fullName || fbUser.displayName || user.name || (lang === 'en' ? 'Mobile Student' : 'শিক্ষার্থী'),
          academicLevel: level,
          group,
          authProvider: 'phone',
          points: (user.points || 0) + (user.authProvider ? 0 : 50),
        });

        setAuthSuccess(
          lang === 'en'
            ? 'Mobile number verified successfully! Welcome.'
            : 'মোবাইল নম্বর সফলভাবে ভেরিফাই হয়েছে! স্বাগতম।'
        );
        setTimeout(() => onClose(), 700);
      } else {
        if (trimmedOtp !== '123456' && trimmedOtp.length !== 6) {
          setAuthError(
            lang === 'en' ? 'Enter valid OTP (test code: 123456)' : 'সঠিক OTP দিন (টেস্ট কোড: 123456)'
          );
          setIsVerifyingOtp(false);
          return;
        }

        const mockUid = `phone_usr_${phone.replace(/[^0-9]/g, '')}`;
        syncAndApplyUser({
          uid: mockUid,
          phone,
          name: fullName || user.name || (lang === 'en' ? 'Mobile Student' : 'শিক্ষার্থী'),
          academicLevel: level,
          group,
          authProvider: 'phone',
        });

        setAuthSuccess(
          lang === 'en' ? 'Mobile number verified!' : 'মোবাইল নম্বর ভেরিফাইড হয়েছে!'
        );
        setTimeout(() => onClose(), 700);
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      let msg = err.message || 'OTP verification failed';
      if (err.code === 'auth/invalid-verification-code') {
        msg =
          lang === 'en'
            ? 'Incorrect 6-digit OTP code. Please check your SMS and try again.'
            : 'ভুল OTP কোড। অনুগ্রহ করে আপনার SMS চেক করে পুনরায় চেষ্টা করুন।';
      } else if (err.code === 'auth/code-expired') {
        msg =
          lang === 'en'
            ? 'OTP code expired. Please request a new OTP code.'
            : 'OTP কোডের মেয়াদ শেষ হয়েছে। পুনরায় নতুন OTP কোড নিন।';
      }
      setAuthError(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#002b24] border border-white/20 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
        <div id="recaptcha-container"></div>

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
                  ? 'Mobile Phone Sign In / Up'
                  : 'মোবাইল নম্বর দিয়ে সাইন-ইন'}
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
              setOtpSent(false);
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
              setOtpSent(false);
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
            {lang === 'en' ? 'Mobile' : 'মোবাইল'}
          </button>
        </div>

        {/* Google 1-Click Button */}
        <div className="space-y-3 relative z-10">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isSendingOtp || isVerifyingOtp}
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

        {/* Mobile Phone Auth (Firebase SMS OTP) */}
        {authMode === 'phone' && (
          <div className="space-y-4 relative z-10">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                    {lang === 'en' ? 'Student Name (Optional)' : 'শিক্ষার্থীর নাম (ঐচ্ছিক)'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-300/60" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white placeholder-emerald-300/40 focus:border-amber-400 focus:outline-none font-medium"
                      placeholder={lang === 'en' ? 'e.g. Tanvir Hossain' : 'যেমন: তানভীর হোসেন'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                    {lang === 'en' ? 'Mobile Number (All Operators)' : 'মোবাইল নম্বর (সকল অপারেটর)'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-300/60" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#003d34] border border-white/20 rounded-2xl text-xs text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                      placeholder="01712345678"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-emerald-300/80 mt-1 font-medium">
                    {lang === 'en'
                      ? 'Enter 11-digit mobile number (GP, Banglalink, Robi, Airtel, Teletalk)'
                      : 'যেকোনো ১১ ডিজিটের মোবাইল নম্বর দিন (GP, বাংলালিংক, রবি, এয়ারটেল, টেলিটক)'}
                  </p>
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
                  disabled={isSendingOtp}
                  className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-[#002b24] font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isSendingOtp ? (
                    <span>{lang === 'en' ? 'Sending SMS OTP...' : 'SMS পাঠানো হচ্ছে...'}</span>
                  ) : (
                    <>
                      {lang === 'en' ? 'Send SMS OTP Code' : 'SMS এ OTP কোড পাঠান'}{' '}
                      <ArrowRight className="w-4 h-4 text-[#002b24]" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-emerald-500/20 border border-emerald-500/40 p-3.5 rounded-2xl text-xs text-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-emerald-200/80 block text-[11px]">
                      {lang === 'en' ? 'SMS OTP sent to:' : 'SMS পাঠানো হয়েছে:'}
                    </span>
                    <span className="font-mono font-bold text-amber-300 text-sm">{phone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setAuthError('');
                    }}
                    className="text-[11px] text-emerald-300 hover:text-white underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {lang === 'en' ? 'Change Number' : 'নম্বর পরিবর্তন'}
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">
                    {lang === 'en' ? 'Enter 6-Digit SMS OTP' : '৬ ডিজিটের SMS OTP দিন'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center py-3.5 bg-[#003d34] border border-white/20 rounded-2xl text-xl font-mono font-black tracking-widest text-amber-400 focus:border-amber-400 focus:outline-none"
                    placeholder="••••••"
                    autoFocus
                    required
                  />
                  <p className="text-[11px] text-emerald-200/70 mt-1.5 text-center">
                    {lang === 'en'
                      ? 'Enter the 6-digit code received on your mobile SMS'
                      : 'আপনার মোবাইলে আসা ৬ ডিজিটের কোডটি এখানে লিখুন'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp || otp.length < 6}
                  className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-[#002b24] font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <span>{lang === 'en' ? 'Verifying OTP...' : 'ভেরিফাই হচ্ছে...'}</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#002b24]" />
                      {lang === 'en' ? 'Verify & Sign In' : 'ভেরিফাই করে লগইন করুন'}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

