import React, { useState, useEffect } from 'react';
import {
  MessageSquarePlus,
  Star,
  Send,
  X,
  CheckCircle2,
  Sparkles,
  Loader2,
  Heart,
  History,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { UserFeedback } from '../types';

const CATEGORIES = [
  'General Thoughts',
  'Interview AI & Audio',
  'Resume ATS & Builder',
  'Academy & Lessons',
  'Feature Request',
  'Bug Report'
] as const;

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Needs major work 🛠️',
  2: 'Needs polish / Found issues ⚠️',
  3: 'Good base, could be better 👍',
  4: 'Really great experience! 🚀',
  5: 'Mind-blowing & super helpful! 🔥'
};

export const FeedbackWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('General Thoughts');
  const [message, setMessage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [deviceHistory, setDeviceHistory] = useState<UserFeedback[]>([]);

  // Prefill name and email when user is logged in
  useEffect(() => {
    if (user) {
      if (!name && user.full_name) setName(user.full_name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Load device history on mount or modal open
  useEffect(() => {
    if (isOpen) {
      setDeviceHistory(storage.getUserFeedbackList());
    }
  }, [isOpen, submitted]);

  // Listen for global custom event to trigger opening from any navbar/sidebar link
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: string }>;
      if (customEvent.detail && customEvent.detail.category) {
        setCategory(customEvent.detail.category);
      }
      setIsOpen(true);
      setSubmitted(false);
      setErrorMessage(null);
    };

    window.addEventListener('open_feedback_modal', handleOpenEvent);
    return () => window.removeEventListener('open_feedback_modal', handleOpenEvent);
  }, []);

  const handleRatingClick = (val: number) => {
    setRating(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please type a quick note or your feedback message.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await api.submitFeedback({
        rating,
        category,
        message: message.trim(),
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        pageUrl: window.location.pathname
      });

      if (result.success) {
        setSubmitted(true);
        // Fire celebration confetti!
        try {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore confetti if unsupported
        }
        setDeviceHistory(storage.getUserFeedbackList());
      } else {
        setErrorMessage(result.message || 'Could not submit feedback. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setMessage('');
    setRating(5);
    setCategory('General Thoughts');
    setSubmitted(false);
    setErrorMessage(null);
    setShowHistory(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowHistory(false);
    if (submitted) {
      handleResetForm();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setSubmitted(false);
        }}
        aria-label="Give Feedback"
        className="fixed bottom-5 right-5 z-40 group flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <MessageSquarePlus className="w-4 h-4 transition-transform group-hover:scale-110" />
        <span className="font-semibold tracking-wide">Feedback</span>
      </button>

      {/* Feedback Modal Backdrop and Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-200 max-h-[92vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Heart className="w-4 h-4 fill-white/80" />
                </div>
                <div>
                  <h2 id="feedback-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Share Your Feedback
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Help Akhil improve InterviewBro AI for everyone!
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close feedback modal"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {submitted ? (
                /* Success Screen */
                <div className="py-8 text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Feedback Received! 🎉
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto mt-1 leading-relaxed">
                      Thank you so much, bro! Your notes have been safely recorded. Akhil reviews every piece of feedback to polish InterviewBro AI for campus placements and students.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      Send Another Note
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              ) : showHistory ? (
                /* On-device History Screen */
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Feedback Sent From This Device ({deviceHistory.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowHistory(false)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      ← Back to Form
                    </button>
                  </div>
                  {deviceHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">
                      No feedback sent from this browser yet.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {deviceHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/50">
                              {item.category}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                              <span>{'★'.repeat(item.rating)}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {item.message}
                          </p>
                          {item.name && (
                            <p className="text-[10px] text-slate-400 italic">
                              From: {item.name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Feedback Input Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Rating Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      How was your experience?
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const activeStar = hoveredRating !== null ? val <= hoveredRating : val <= rating;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleRatingClick(val)}
                            onMouseEnter={() => setHoveredRating(val)}
                            onMouseLeave={() => setHoveredRating(null)}
                            aria-label={`${val} star rating`}
                            className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                activeStar
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        );
                      })}
                      <span className="ml-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {RATING_DESCRIPTIONS[hoveredRating || rating]}
                      </span>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      What are you sharing feedback on?
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => {
                        const isSelected = category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-slate-900'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="feedback-message" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Your Feedback or Idea <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {message.length}/3000
                      </span>
                    </div>
                    <textarea
                      id="feedback-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 3000))}
                      placeholder="What did you try? Did the mock interview feel realistic? Any questions or UI improvements you recommend?"
                      required
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
                    />
                  </div>

                  {/* Optional Name & Email (Friend contact info) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label htmlFor="feedback-name" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Your Name / Nickname (Optional)
                      </label>
                      <input
                        id="feedback-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value.slice(0, 120))}
                        placeholder="e.g. Rahul, Priya, College friend"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="feedback-email" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Email or Contact (Optional)
                      </label>
                      <input
                        id="feedback-email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.slice(0, 150))}
                        placeholder="In case Akhil wants to reply"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Error banner */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submit and Bottom Row */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {deviceHistory.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowHistory(true)}
                        className="text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>View past feedback on this device ({deviceHistory.length})</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        Direct to developer
                      </span>
                    )}

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Feedback</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
