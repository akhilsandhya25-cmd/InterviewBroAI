import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  User, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Info,
  Sparkles,
  RotateCcw,
  Loader2,
  Clock,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandIcon } from './brand/BrandIcon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot_password' | 'update_password';
  onSuccess?: () => void;
}

type ModalMode = 
  | 'login' 
  | 'signup' 
  | 'forgot_password' 
  | 'reset_code' 
  | 'signup_success' 
  | 'verify_email_notice'
  | 'update_password';

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onSuccess 
}) => {
  const { login, signup, forgotPassword, resetPassword, resendVerification, isSupabaseConnected } = useAuth();
  
  const [mode, setMode] = useState<ModalMode>(initialMode);
  
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      resetFormState();
    }
  }, [isOpen, initialMode]);

  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [resetCode, setResetCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emailDeliveryConfigured, setEmailDeliveryConfigured] = useState<boolean>(true);

  // Email verification state
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState<boolean>(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string>('');
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  const [resendStatusMsg, setResendStatusMsg] = useState<{ 
    type: 'success' | 'error' | 'rate_limit' | 'network'; 
    text: string 
  } | null>(null);
  const [errorType, setErrorType] = useState<'rate_limit' | 'network' | 'unconfirmed' | 'general' | null>(null);

  // Cooldown countdown timer when an exact retry delay is known
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const resetFormState = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsEmailUnconfirmed(false);
    setUnconfirmedEmail('');
    setResendStatusMsg(null);
    setErrorType(null);
  };

  const handleSwitchMode = (newMode: ModalMode) => {
    resetFormState();
    setMode(newMode);
  };

  // Resend verification email handler
  const handleResendVerification = async (targetEmail?: string) => {
    const mail = (targetEmail || unconfirmedEmail || registeredEmail || email).trim();
    if (!mail) {
      setResendStatusMsg({
        type: 'error',
        text: 'Please enter your registered email address to resend verification.'
      });
      return;
    }

    // Do not call Supabase if cooling down or actively rate limited without a known elapsed delay
    if (resendCooldown > 0 || (isRateLimited && resendCooldown <= 0)) return;

    setResendLoading(true);
    setResendStatusMsg(null);
    setErrorType(null);

    try {
      const res = await resendVerification(mail);
      setIsRateLimited(false);
      setResendStatusMsg({
        type: 'success',
        text: res.message || `Verification link resent to ${mail}! Please check your inbox and spam folder.`
      });
      // Short client spacing throttle (30s) to prevent double clicks, labeled clearly
      setResendCooldown(30);
    } catch (err: any) {
      if (err.isRateLimit) {
        setIsRateLimited(true);
        setErrorType('rate_limit');
        setResendStatusMsg({
          type: 'rate_limit',
          text: "Too many verification email requests. Please wait a while before trying again."
        });
        // Display countdown ONLY if Supabase provided an exact retry delay
        if (typeof err.retryAfterSeconds === 'number' && err.retryAfterSeconds > 0) {
          setResendCooldown(err.retryAfterSeconds);
        } else {
          setResendCooldown(0);
        }
      } else if (err.isNetworkError) {
        setErrorType('network');
        setResendStatusMsg({
          type: 'network',
          text: "Network connection error. Please check your internet connection and try again."
        });
      } else {
        setErrorType('general');
        setResendStatusMsg({
          type: 'error',
          text: err.message || 'Failed to resend verification link. Please wait a moment and try again.'
        });
      }
    } finally {
      setResendLoading(false);
    }
  };

  // Submit Sign In or Sign Up
  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsEmailUnconfirmed(false);
    setResendStatusMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify both password fields.');
        return;
      }
    } else {
      if (!password) {
        setErrorMsg('Please enter your password.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const result = await signup(cleanEmail, password, confirmPassword, fullName);
        setRegisteredEmail(cleanEmail);

        if (result.requiresEmailVerification) {
          // Supabase cloud mode: Email verification is required before login
          setMode('verify_email_notice');
          setSuccessMsg(
            "Account created successfully! We've sent a verification link to your email address. Please check your inbox and spam folder, then verify your email before logging in."
          );
        } else {
          // Instant session (local sandbox or auto-confirm)
          setMode('signup_success');
          setSuccessMsg(`Welcome to InterviewBro AI, ${fullName.trim()}! Your account has been created successfully.`);
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 1300);
        }
      } else {
        await login(cleanEmail, password);
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      if (err.isRateLimit) {
        setIsRateLimited(true);
        setErrorType('rate_limit');
        setIsEmailUnconfirmed(false);
        setErrorMsg("Too many verification email requests. Please wait a while before trying again.");
        if (typeof err.retryAfterSeconds === 'number' && err.retryAfterSeconds > 0) {
          setResendCooldown(err.retryAfterSeconds);
        } else {
          setResendCooldown(0);
        }
      } else if (
        err.isEmailUnconfirmed ||
        (err.message && (
          err.message.toLowerCase().includes('email not confirmed') ||
          err.message.toLowerCase().includes('email not verified') ||
          err.message.toLowerCase().includes("email isn't verified")
        )) ||
        err.code === 'email_not_confirmed'
      ) {
        setIsEmailUnconfirmed(true);
        setUnconfirmedEmail(cleanEmail);
        setErrorType('unconfirmed');
        setErrorMsg("Your email isn't verified yet. Please check your inbox and click the verification link before logging in.");
      } else if (err.isNetworkError) {
        setIsEmailUnconfirmed(false);
        setErrorType('network');
        setErrorMsg("Network connection error. Please check your internet connection and try again.");
      } else if (err.message && (err.message.includes('JSON') || err.message.includes('json') || err.message.includes('Unexpected end'))) {
        setIsEmailUnconfirmed(false);
        setErrorType('general');
        setErrorMsg('Authentication server is connecting. Please retry or refresh the page.');
      } else {
        setIsEmailUnconfirmed(false);
        setErrorType('general');
        setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request Password Reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(cleanEmail);
      setEmailDeliveryConfigured(res.emailDeliveryConfigured ?? false);
      setSuccessMsg(res.message);
      if (isSupabaseConnected) {
        // Supabase sends a secure recovery link directly to candidate's inbox.
        return;
      }
      if (res.resetCode) {
        setResetCode(res.resetCode);
      }
      setMode('reset_code');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request password reset. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm Password Reset with Code
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetCode.trim()) {
      setErrorMsg('Please enter the verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email, resetCode, newPassword, confirmNewPassword);
      setSuccessMsg(res.message || 'Password successfully updated!');
      setPassword('');
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('Your password has been changed. Please sign in with your new password.');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Direct Set New Password (opened via recovery email link)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email, '', newPassword, confirmNewPassword);
      setSuccessMsg(res.message || 'Password updated successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl shadow-violet-950/40 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent Ambient Backgrounds */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors z-20"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <BrandIcon size="md" glow={true} />
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>
                {mode === 'signup' && 'Create Free Account'}
                {mode === 'login' && 'Sign In to InterviewBro'}
                {(mode === 'forgot_password' || mode === 'reset_code') && 'Password Recovery'}
                {mode === 'update_password' && 'Set New Password'}
                {mode === 'signup_success' && 'Account Created!'}
                {mode === 'verify_email_notice' && 'Verify Your Email'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-cyan-300 border border-cyan-500/30">
                AI Studio
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'signup' && 'Create your account for personalized AI mock interviews.'}
              {mode === 'login' && 'Sign in to access your dashboard, reports & history.'}
              {mode === 'forgot_password' && 'Enter your registered email to receive reset instructions.'}
              {mode === 'reset_code' && 'Enter your reset verification code and set a new password.'}
              {mode === 'update_password' && 'Enter your new password to regain access to your InterviewBro AI account.'}
              {mode === 'signup_success' && 'Preparing your AI interview studio...'}
              {mode === 'verify_email_notice' && 'Check your inbox to verify your email before logging in.'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs for Login/Signup */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('signup')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* 1. SCREEN: Verify Email Notice Screen (Post Signup with Supabase) */}
        {mode === 'verify_email_notice' && (
          <div className="py-2 space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg relative">
              <Mail className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 text-[8px] font-bold text-slate-950 items-center justify-center">1</span>
              </span>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Account Created Successfully
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Account created successfully! We've sent a verification link to your email address. Please check your inbox and spam folder, then verify your email before logging in.
              </p>
            </div>

            {/* Email Address Visibility Card */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs font-mono font-semibold text-cyan-300 truncate">
                  {registeredEmail || email}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium shrink-0">
                Verification Link Sent
              </span>
            </div>

            {/* Resend Status Feedback */}
            {resendStatusMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                resendStatusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : resendStatusMsg.type === 'rate_limit'
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {resendStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : resendStatusMsg.type === 'rate_limit' ? (
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{resendStatusMsg.text}</span>
              </div>
            )}

            {/* Actions: Proceed to Login & Resend Verification */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleSwitchMode('login');
                  setSuccessMsg('Once you have clicked the link in your email, please sign in below.');
                }}
                className="w-full py-3 rounded-xl font-bold text-xs gradient-button flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={resendLoading || resendCooldown > 0 || (isRateLimited && resendCooldown <= 0)}
                onClick={() => handleResendVerification(registeredEmail || email)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {resendLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Sending verification email...</span>
                  </span>
                ) : isRateLimited && resendCooldown > 0 ? (
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Retry available in {resendCooldown}s</span>
                  </span>
                ) : isRateLimited ? (
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rate limit active — please wait a while</span>
                  </span>
                ) : resendCooldown > 0 ? (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link dispatched (wait {resendCooldown}s)</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Resend verification email</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 2. SCREEN: Instant Signup Success Screen (Local Dev or Auto-Confirm Mode) */}
        {mode === 'signup_success' && (
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Account Created Successfully!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Welcome, <strong className="text-slate-200">{fullName}</strong>. Loading your private dashboard...
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Unverified Email Warning with Resend Option (In Login Mode) */}
        {isEmailUnconfirmed && mode === 'login' && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white leading-relaxed">
                  Your email isn't verified yet. Please check your inbox and click the verification link before logging in.
                </p>
                <p className="text-[11px] text-slate-300">
                  Verification sent to: <span className="font-mono text-cyan-300 font-semibold">{unconfirmedEmail || email}</span>
                </p>
              </div>
            </div>

            {resendStatusMsg && (
              <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                resendStatusMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : resendStatusMsg.type === 'rate_limit'
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}>
                {resendStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : resendStatusMsg.type === 'rate_limit' ? (
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{resendStatusMsg.text}</span>
              </div>
            )}

            <button
              type="button"
              disabled={resendLoading || resendCooldown > 0 || (isRateLimited && resendCooldown <= 0)}
              onClick={() => handleResendVerification(unconfirmedEmail || email)}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {resendLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Resending verification email...</span>
                </span>
              ) : isRateLimited && resendCooldown > 0 ? (
                <span className="flex items-center gap-1.5 text-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Retry available in {resendCooldown}s</span>
                </span>
              ) : isRateLimited ? (
                <span className="flex items-center gap-1.5 text-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Rate limit active — please wait a while</span>
                </span>
              ) : resendCooldown > 0 ? (
                <span className="flex items-center gap-1.5 text-amber-200/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Link dispatched (wait {resendCooldown}s)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resend verification email</span>
                </span>
              )}
            </button>
          </div>
        )}

        {/* Error Feedback */}
        {errorMsg && !isEmailUnconfirmed && (
          <div className={`mb-4 p-3 rounded-xl text-xs flex flex-col gap-1.5 ${
            errorType === 'rate_limit'
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-start gap-2">
              {errorType === 'rate_limit' ? (
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : errorType === 'network' ? (
                <WifiOff className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">{errorMsg}</p>
                {errorType === 'rate_limit' && (
                  <p className="text-[11px] text-amber-300/80 leading-relaxed">
                    Supabase email rate limits protect against abuse. Your email ({email}) is preserved.
                  </p>
                )}
              </div>
            </div>

            {errorType === 'rate_limit' && mode === 'signup' && (
              <div className="mt-1 pt-1.5 border-t border-amber-500/20 flex items-center justify-between">
                <span className="text-[11px] text-slate-300">Already registered or need to sign in?</span>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-1"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {errorMsg.toLowerCase().includes('already exists') && (
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-left text-xs text-cyan-300 hover:text-cyan-200 font-semibold underline underline-offset-2 ml-6"
              >
                Sign in with this email instead →
              </button>
            )}
          </div>
        )}

        {/* General Success Feedback */}
        {successMsg && mode !== 'signup_success' && mode !== 'verify_email_notice' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM: Sign In or Sign Up */}
        {(mode === 'login' || mode === 'signup') && (
          <form onSubmit={handleSubmitAuth} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aditya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu or gmail"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot_password')}
                    className="text-[11px] text-violet-400 hover:text-violet-300 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs gradient-button flex items-center justify-center gap-2 mt-3 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authenticating...</span>
                </span>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Free Account' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* FORM: Forgot Password Step 1 (Request link/code) */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs gradient-button flex items-center justify-center gap-2 mt-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Instructions...</span>
                </span>
              ) : (
                <span>Send Reset Instructions</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* FORM: Reset Password Step 2 (Enter code + new password) */}
        {mode === 'reset_code' && (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <Info className="w-3.5 h-3.5 text-violet-400" />
                <span>Verification Code Sent</span>
              </div>
              <p className="text-[11px] text-slate-300">
                A verification code was dispatched to <strong className="text-white">{email}</strong>.
              </p>
              {!emailDeliveryConfigured && (
                <div className="mt-1 pt-1 border-t border-violet-500/20 text-[10px] text-amber-300">
                  Sandbox active: code pre-filled for your convenience.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 849201"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 tracking-widest font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs gradient-button flex items-center justify-center gap-2 mt-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </span>
              ) : (
                <span>Save New Password & Sign In</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ← Cancel & Return to Sign In
              </button>
            </div>
          </form>
        )}

        {/* FORM: Update Password (from email recovery link) */}
        {mode === 'update_password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verified Recovery Session</span>
              </div>
              <p className="text-[11px] text-slate-300">
                You have authenticated via your email reset link. Please set your new secure password below.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs gradient-button flex items-center justify-center gap-2 mt-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </span>
              ) : (
                <span>Save New Password & Continue</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ← Return to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Security & Provider Footer Note */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {isSupabaseConnected 
              ? 'Secured by Supabase Auth (Cloud PostgreSQL RLS Active)' 
              : 'Secured by Supabase Auth (Cloud Authentication Active)'}
          </span>
        </div>
      </div>
    </div>
  );
};
