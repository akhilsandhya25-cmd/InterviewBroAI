import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  Clock, 
  ArrowLeft, 
  Mail, 
  HelpCircle, 
  Database,
  Eye,
  Camera,
  Mic,
  Loader2,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { PrivacyPreferences } from '../types';

interface PrivacyCenterPageProps {
  onNavigate: (route: string) => void;
}

export const PrivacyCenterPage: React.FC<PrivacyCenterPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();

  // Data counts
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [reportCount, setReportCount] = useState<number>(0);
  const [resumeCount, setResumeCount] = useState<number>(0);

  // User Privacy Preferences
  const [preferences, setPreferences] = useState<PrivacyPreferences>(() => 
    storage.getPrivacyPreferences(user?.id)
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Deletion Modal State
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [confirmInput, setConfirmInput] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  useEffect(() => {
    const uid = user?.id || null;
    const sessions = storage.getSessions(uid);
    const reports = storage.getReports(uid);
    const resumes = storage.getResumes(uid);

    setSessionCount(sessions.length);
    setReportCount(reports.length);
    setResumeCount(resumes.length);
  }, [user]);

  const handleTogglePref = (key: keyof PrivacyPreferences, val: boolean) => {
    const updated = { ...preferences, [key]: val };
    setPreferences(updated);
    storage.savePrivacyPreferences(updated, user?.id);
    setSaveSuccessMsg('Privacy preference updated.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleExportData = () => {
    storage.exportAllUserData(user?.id);
  };

  const handleConfirmDelete = async () => {
    if (confirmInput.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await storage.deleteAccountAndData(user?.id || '');
      if (res.success) {
        setDeleteSuccess(true);
        setTimeout(() => {
          if (logout) logout();
          onNavigate('landing');
        }, 2200);
      } else {
        setDeleteError(res.message || 'Failed to complete account deletion.');
        setIsDeleting(false);
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Error occurred while purging account.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="w-4 h-4 text-violet-400" />
              <span className="font-semibold text-slate-200">Privacy Center & Candidate Controls</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('legal:privacy')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Read Full Privacy Policy</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c1222] via-[#0b101c] to-[#070a12] border border-slate-800 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
              <span>Digital Personal Data Protection Act, 2023 Candidate Portal</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Privacy Center & Data Controls
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              You own your mock interview history and career preparation data. Exercise your statutory rights to access your data in a portable JSON archive, configure purpose-specific processing, or exercise your right to permanent account erasure.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Client-Side Local Video Mirror</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Volatile Resume Memory Processing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Strict Database Row Isolation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Stored on Platform Card */}
        <div className="p-6 rounded-3xl bg-[#0c111c] border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Your Data Breakdown on InterviewBro AI</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Data linked to your authenticated identity (<span className="text-slate-200 font-mono">{user?.email || 'Guest / Local Session'}</span>)
              </p>
            </div>

            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl font-bold text-xs gradient-button flex items-center gap-2 shadow-lg shrink-0 self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full Data Archive (.JSON)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Mock Interview Sessions</span>
              </div>
              <div className="text-2xl font-extrabold text-white">{sessionCount}</div>
              <div className="text-[11px] text-slate-500">Includes interview questions, elapsed time & transcripts</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Evaluation Reports</span>
              </div>
              <div className="text-2xl font-extrabold text-white">{reportCount}</div>
              <div className="text-[11px] text-slate-500">STAR rubric scores, model answers & improvement plans</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Resume ATS Scans</span>
              </div>
              <div className="text-2xl font-extrabold text-white">{resumeCount}</div>
              <div className="text-[11px] text-slate-500">Keyword gap analysis and extracted candidate skills</div>
            </div>
          </div>

          {/* Media Hardware Clarification Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 text-xs space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <Camera className="w-4 h-4 text-violet-400" />
              <span>Media & Biometrics Disclosure:</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              During live mock interviews, camera feed is attached directly to your local HTML5 video element mirror via <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">srcObject</code>. No video frames, video recordings, or facial scans are ever uploaded to our servers or AI providers. We do not perform facial-expression recognition, emotion detection, or biometric profiling.
            </p>
          </div>
        </div>

        {/* Essential Core Service Processing Disclosure */}
        <div className="p-6 rounded-3xl bg-[#0c111c] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-400" />
                <span>Core Service Processing (Essential / Contractual Basis)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                These processing activities are necessary to deliver your AI mock interview practice sessions and evaluate candidate performance.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shrink-0">
              Contractual / Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Answer Evaluation & STAR Rubric Scoring</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Processes your spoken or typed answer to compute accuracy, structure, and communication feedback for each practice question.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Candidate Profile & Role Adaptation</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Calibrates interview difficulty and question selection based on your target role, experience level, and listed skills.
              </p>
            </div>
          </div>
        </div>

        {/* Purpose-Specific Optional Candidate Controls */}
        <div className="p-6 rounded-3xl bg-[#0c111c] border border-slate-800 space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Optional Candidate Privacy Preferences</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure optional choices under Section 6 of the DPDP Act 2023. You can toggle these preferences at any time.
            </p>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            
            {/* Toggle 1: Ephemeral Practice Mode (Zero Transcript Retention) */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Ephemeral Practice Mode (Zero Transcript Retention)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    Opt-In (Unselected by Default)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
                  When enabled, your spoken and typed answer transcripts are automatically scrubbed and omitted before saving to your session history. Your feedback scores are preserved, but transcript text is never retained.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={preferences.ephemeralPracticeMode}
                  onChange={(e) => handleTogglePref('ephemeralPracticeMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {/* Toggle 2: AI Interviewer Voice Synthesis (TTS) */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>AI Interviewer Voice Synthesis (TTS)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    Voice Practice
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
                  Allows the AI interviewer to speak questions aloud using browser speech synthesis or ElevenLabs. When disabled, the AI interviewer is silenced for quiet reading practice.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={preferences.voiceSynthesisEnabled}
                  onChange={(e) => handleTogglePref('voiceSynthesisEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {/* Toggle 3: Anonymous Platform Analytics */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Anonymous Platform Analytics</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    Zero Trackers Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
                  Permits anonymous error logs without identifying account credentials to help improve platform stability. Note: InterviewBro AI uses zero advertising cookies and zero third-party marketing pixels.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={preferences.analyticsOptIn}
                  onChange={(e) => handleTogglePref('analyticsOptIn', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

          </div>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Consent baseline version: <strong className="text-slate-400">{preferences.consentVersion || '1.2 (Oct 19, 2026)'}</strong></span>
          </div>
        </div>

        {/* DPDP Grievance Redressal Card */}
        <div className="p-6 rounded-3xl bg-[#0c111c] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Mail className="w-4 h-4 text-violet-400" />
            <span>DPDP Grievance Redressal & Right to Correction</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            InterviewBro AI is operated by an individual developer as an educational platform. Under the Digital Personal Data Protection Act, 2023, you have the right to grievance redressal, correction, and erasure. All data export and account erasure requests can be completed instantly using the self-service controls above and below.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={() => onNavigate('legal:contact')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Statutory Contact Notice & Operator Details</span>
            </button>
          </div>
        </div>

        {/* Danger Zone: Account Deletion (Right to Erasure) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-rose-400">
            <Trash2 className="w-5 h-5 text-rose-400" />
            <span>Permanent Account & Data Erasure</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Under Section 12 of the DPDP Act 2023, you may request complete erasure of your personal data. Deleting your account permanently wipes your user profile, all mock interview transcripts, feedback reports, and resume analyses from Supabase PostgreSQL and your local browser storage.
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                setConfirmInput('');
                setDeleteError(null);
                setShowDeleteModal(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-2 shadow-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Permanently Delete My Account & All Data</span>
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Account Deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0e1320] border border-rose-500/40 shadow-2xl space-y-5">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Permanently Delete Account?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This action is <strong className="text-rose-400">irreversible</strong>. All your mock interview records, STAR scores, ATS resume analyses, and credentials will be permanently erased.
              </p>
            </div>

            {deleteSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-semibold text-white">Account Successfully Deleted</p>
                <p className="text-[11px] text-slate-400">All data wiped. Redirecting you to the home page...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    To confirm, please type <span className="font-mono text-rose-400 font-bold">DELETE</span> below:
                  </label>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                {deleteError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting || confirmInput.trim().toUpperCase() !== 'DELETE'}
                    onClick={handleConfirmDelete}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Purging Data...</span>
                      </span>
                    ) : (
                      <span>Confirm Deletion</span>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
