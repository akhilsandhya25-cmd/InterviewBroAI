import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Send,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertCircle,
  Inbox,
  User,
  Mail,
  Calendar,
  ExternalLink,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { UserFeedback } from '../types';

const CATEGORIES = [
  'General Thoughts',
  'Mock Interview Quality',
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
  const [activeTab, setActiveTab] = useState<'give' | 'view'>('give');

  // Feedback form state
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('General Thoughts');
  const [message, setMessage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // All Feedback List State (for viewing notes)
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [feedbackFilter, setFeedbackFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteFeedback = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingId(id);
    try {
      await api.deleteFeedback(id);
      setFeedbackList(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.warn('Failed to delete feedback item:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Prefill name and email when user is logged in
  useEffect(() => {
    if (user) {
      if (!name && user.full_name) setName(user.full_name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Load feedback list when switching to 'view' tab or on initial modal open
  const fetchAllFeedback = async () => {
    setIsLoadingList(true);
    try {
      const res = await api.getFeedbackList();
      if (res && Array.isArray(res.data)) {
        setFeedbackList(res.data);
      }
    } catch (e) {
      console.warn('Failed to fetch feedback list:', e);
      setFeedbackList(storage.getUserFeedbackList());
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'view') {
      fetchAllFeedback();
    }
  }, [isOpen, activeTab]);

  // Listen for global custom event to trigger opening from any navbar/sidebar link
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: string; viewOnly?: boolean }>;
      if (customEvent.detail && customEvent.detail.category) {
        setCategory(customEvent.detail.category);
      }
      if (customEvent.detail && customEvent.detail.viewOnly) {
        setActiveTab('view');
      } else {
        setActiveTab('give');
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
        try {
          confetti({
            particleCount: 65,
            spread: 55,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore confetti if unsupported
        }
        // Refresh local view list
        fetchAllFeedback();
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
  };

  const handleClose = () => {
    setIsOpen(false);
    if (submitted) {
      handleResetForm();
    }
  };

  const filteredList = feedbackList.filter(item => {
    if (feedbackFilter === 'all') return true;
    return item.category === feedbackFilter;
  });

  return (
    <>
      {/* Floating Trigger Button - Clean solid brand styling (No purple, no AI gradients) */}
      <button
        onClick={() => {
          setIsOpen(true);
          setSubmitted(false);
        }}
        aria-label="Give Feedback"
        className="fixed bottom-5 right-5 z-40 group flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-blue-500/40"
      >
        <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-105" />
        <span className="tracking-normal">Feedback</span>
      </button>

      {/* Feedback Modal Backdrop and Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-200 max-h-[92vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="feedback-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    Feedback & Suggestions
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    InterviewBro AI tester reviews & suggestions
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close modal"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs: Give Feedback vs View Feedback */}
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('give');
                  setSubmitted(false);
                }}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'give'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('view');
                  fetchAllFeedback();
                }}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'view'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>View All Feedback ({feedbackList.length})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {activeTab === 'view' ? (
                /* Tab 2: View All Received Feedback */
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Received Feedback Notes ({filteredList.length})
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Submitted by friends and candidates testing the platform
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={fetchAllFeedback}
                      disabled={isLoadingList}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
                      title="Refresh feedback from server"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingList ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setFeedbackFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                        feedbackFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      All ({feedbackList.length})
                    </button>
                    {CATEGORIES.map(cat => {
                      const count = feedbackList.filter(f => f.category === cat).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFeedbackFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                            feedbackFilter === cat
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Cards List */}
                  {isLoadingList ? (
                    <div className="py-12 text-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                      <p className="text-xs text-slate-500">Loading feedback notes...</p>
                    </div>
                  ) : filteredList.length === 0 ? (
                    <div className="py-10 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        No feedback notes found yet.
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Share InterviewBro AI with your friends and ask them to tap the "Feedback" button to leave their thoughts!
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('give')}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Submit a test note →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {filteredList.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 space-y-2"
                        >
                          {/* Card Top Row: Category + Rating + Delete Button */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md bg-blue-100/60 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                              {item.category}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                <span>{'★'.repeat(item.rating)}</span>
                                <span className="text-slate-300 dark:text-slate-600 font-normal">
                                  {'★'.repeat(Math.max(0, 5 - item.rating))}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteFeedback(item.id, e)}
                                disabled={deletingId === item.id}
                                aria-label="Delete this review"
                                title="Delete this review"
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              >
                                {deletingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Message Content */}
                          <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-normal">
                            {item.message}
                          </p>

                          {/* Card Footer: Author + Date + Delete text button */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                <User className="w-3 h-3 text-slate-400" />
                                {item.name || 'Anonymous Friend'}
                              </span>
                              {item.email && (
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  {item.email}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteFeedback(item.id, e)}
                                disabled={deletingId === item.id}
                                className="text-[10px] font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:underline flex items-center gap-1 transition-colors"
                                title="Delete this review"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Developer Note */}
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-blue-700 dark:text-blue-400 block">
                      Where is feedback stored?
                    </span>
                    <p className="text-[10px] leading-relaxed">
                      1. In this in-app viewer (refreshes live via <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">/api/feedback</code>).<br />
                      2. In your Supabase database table <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">user_feedback</code>.<br />
                      3. In Vercel serverless function logs in real time.
                    </p>
                  </div>
                </div>
              ) : submitted ? (
                /* Success Screen */
                <div className="py-8 text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Feedback Received!
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto mt-1 leading-relaxed">
                      Thank you! Your feedback has been safely submitted and recorded. It helps directly in polishing InterviewBro AI.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('view')}
                      className="px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-colors border border-blue-200 dark:border-blue-800"
                    >
                      View All Feedback
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Tab 1: Submit Feedback Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Rating Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Overall Experience Rating
                    </label>
                    <div className="flex items-center gap-1.5">
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
                            className="p-1 rounded-lg hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                activeStar
                                  ? 'fill-amber-400 text-amber-400'
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

                  {/* Category Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      What is this regarding?
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
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback Message */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="feedback-message" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Your Feedback or Suggestions <span className="text-red-500">*</span>
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
                      placeholder="What did you try? Did the questions feel realistic? Any features or UI improvements you recommend?"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
                    />
                  </div>

                  {/* Friend Information (Optional) */}
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

                  {/* Form Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('view');
                        fetchAllFeedback();
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>View past notes ({feedbackList.length})</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow transition-all flex items-center justify-center gap-2"
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
