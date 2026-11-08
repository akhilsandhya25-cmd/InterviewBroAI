import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Trash2,
  ArrowRight,
  HelpCircle,
  Video,
  PenTool,
  ShieldCheck,
  GraduationCap,
  Layers,
  Award,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { ResumeAnalysis } from '../types';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analytics';
import { ResumeBuilderView } from '../components/resume/ResumeBuilderView';

interface ResumeAnalyzerProps {
  onStartWithResume: (resumeQuestions: string[]) => void;
  onNavigate: (route: string) => void;
}

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ onStartWithResume, onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'analyzer' | 'builder'>('analyzer');
  const [resumes, setResumes] = useState<ResumeAnalysis[]>(() => storage.getResumes(user?.id));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState<string>(() => {
    return user?.role_target || user?.careerInterests?.[0] || 'Full Stack Developer';
  });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeAnalysis, setActiveAnalysis] = useState<ResumeAnalysis | null>(() => storage.getResumes(user?.id)[0] || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const refresh = () => {
      const list = storage.getResumes(user?.id);
      setResumes(list);
      setActiveAnalysis(prev => prev ? (list.find(r => r.id === prev.id) || list[0] || null) : (list[0] || null));
    };
    refresh();
    window.addEventListener('interviewbro_storage_synced', refresh);
    return () => window.removeEventListener('interviewbro_storage_synced', refresh);
  }, [user?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const isExtValid = /\.(pdf|docx|txt)$/i.test(file.name);

      if (!isExtValid && !validTypes.includes(file.type)) {
        setErrorMsg('Please upload a valid PDF, DOCX, or TXT resume file.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size exceeds the 5MB limit.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a resume file first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const analysis = await api.analyzeResume(selectedFile, targetRole, user || undefined);
      storage.saveResume(analysis, user?.id);
      setResumes(storage.getResumes(user?.id));
      setActiveAnalysis(analysis);

      // Track privacy-respecting resume upload (file extension & size only, ZERO file text)
      analyticsService.trackResumeUploaded({
        fileType: selectedFile.name.split('.').pop() || 'unknown',
        sizeKb: selectedFile.size / 1024,
        source: analysis.source || 'ai'
      });

      if (analysis.source === 'fallback') {
        analyticsService.trackFallbackModeShown({ context: 'resume_analyzer' });
      }

      setSelectedFile(null);
    } catch (e: any) {
      if (e.code === 'QUOTA_EXCEEDED' || e.status === 402) {
        analyticsService.trackQuotaHit({ context: 'resume_analyzer' });
        setErrorMsg('Free tier quota reached (5 of 5 sessions completed). Please upgrade your plan to unlock more resume reviews.');
      } else if (e.code === 'RATE_LIMIT_EXCEEDED' || e.status === 429) {
        setErrorMsg(e.message || 'Too many resume parse requests. Please wait a moment before trying again.');
      } else if (e.code === 'UNAUTHORIZED' || e.status === 401) {
        setErrorMsg('Authentication required. Please sign in or create an account to analyze your resume.');
      } else {
        setErrorMsg(e.message || 'Failed to analyze resume. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteResume = (id: string) => {
    if (confirm('Delete this resume analysis record?')) {
      storage.deleteResume(id, user?.id);
      const remaining = storage.getResumes(user?.id);
      setResumes(remaining);
      if (activeAnalysis?.id === id) {
        setActiveAnalysis(remaining[0] || null);
      }
    }
  };

  const handleStartPractice = (questions: string[]) => {
    const contextLines = [
      activeAnalysis?.fileName ? `Resume File: ${activeAnalysis.fileName}` : '',
      `Target Role: ${targetRole}`,
      activeAnalysis?.educationLevel || user?.educationLevel ? `Education Level: ${activeAnalysis?.educationLevel || user?.educationLevel}` : '',
      activeAnalysis?.academicStream || user?.academicStream ? `Stream: ${activeAnalysis?.academicStream || user?.academicStream}` : '',
      activeAnalysis?.intermediateGroup || user?.intermediateGroup ? `Intermediate Group: ${activeAnalysis?.intermediateGroup || user?.intermediateGroup}` : '',
      activeAnalysis?.extractedSkills?.length ? `Extracted Skills: ${activeAnalysis.extractedSkills.join(', ')}` : '',
      'Resume-Tailored Questions:',
      ...questions.map((q, i) => `${i + 1}. ${q}`)
    ].filter(Boolean);

    const contextText = contextLines.join('\n');
    try {
      sessionStorage.setItem('interviewbro_active_resume_text', contextText);
    } catch {
      // sessionStorage unavailable
    }

    onStartWithResume(questions);
    onNavigate('setup');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30">
              Universal Resume Suite
            </span>
            <span className="text-xs text-[#9AA4B2]">Private • Multi-Stream • Honest Evaluation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            {activeTab === 'analyzer' ? 'Resume Analyzer & ATS Audit' : 'Universal Resume Builder'}
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
            {activeTab === 'analyzer'
              ? 'Scan existing resumes with stream-aware evaluation criteria for students and professionals.'
              : 'Build an honest, ATS-friendly resume tailored to your qualification with live A4 preview and PDF export.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#080B11] p-1.5 rounded-xl border border-white/[0.08] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analyzer'
                ? 'bg-[#121826] text-[#C5F36B] shadow-sm border border-white/[0.08]'
                : 'text-[#9AA4B2] hover:text-[#F5F7FA]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Resume Analyzer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'builder'
                ? 'bg-[#121826] text-[#C5F36B] shadow-sm border border-white/[0.08]'
                : 'text-[#9AA4B2] hover:text-[#F5F7FA]'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Resume Builder</span>
          </button>
        </div>
      </div>

      {activeTab === 'builder' ? (
        <ResumeBuilderView
          user={user}
          onNavigateToSetup={(formattedResumeText) => {
            try {
              sessionStorage.setItem('interviewbro_active_resume_text', formattedResumeText);
            } catch {
              // sessionStorage fallback
            }
            onStartWithResume([formattedResumeText]);
            onNavigate('setup');
          }}
        />
      ) : (
        <div className="space-y-8">
          {/* Upload & Configuration Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-2">
                  Select Resume File (PDF, DOCX, or TXT - max 5MB)
                </label>
                <div className="relative border-2 border-dashed border-white/[0.12] hover:border-[#C5F36B] rounded-2xl p-6 text-center transition-colors bg-[#080B11]">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[#9AA4B2] mx-auto mb-2" />
                  {selectedFile ? (
                    <div className="text-xs font-bold text-[#C5F36B]">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#F5F7FA]">
                        Click to browse or drop your resume here
                      </p>
                      <p className="text-[11px] text-[#9AA4B2]">Standard PDF, DOCX or TXT documents</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-2">
                  Target Position / Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. SDE-1, Financial Analyst, Staff Nurse"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B] mb-3"
                />

                {/* Candidate Stream Context Indicator */}
                {user?.educationLevel && (
                  <div className="mb-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-[#9AA4B2] space-y-0.5">
                    <div className="text-[#F5F7FA] font-medium flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{user.educationLevel}</span>
                      {user.intermediateGroup && <span>• {user.intermediateGroup}</span>}
                    </div>
                    {user.academicStream && (
                      <div className="text-[10px] text-[#9AA4B2] truncate">Stream: {user.academicStream}</div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  disabled={isAnalyzing || !selectedFile}
                  onClick={handleAnalyze}
                  className="w-full btn-primary text-xs py-3 shadow-md shadow-[#C5F36B]/15"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#080B11] border-t-transparent rounded-full animate-spin" />
                      <span>Auditing Resume...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Scan Resume with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
                {errorMsg.includes('Free tier quota') || errorMsg.includes('quota') ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('pricing')}
                    className="px-3 py-1 rounded-lg bg-[#C5F36B] text-[#080B11] font-bold text-[11px] shrink-0 hover:bg-[#b2e257] transition-colors"
                  >
                    Upgrade Plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setErrorMsg(null)}
                    className="text-[11px] underline text-rose-400 hover:text-rose-200"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active Resume Report Display */}
          {activeAnalysis ? (
            <div className="space-y-6">
              {/* Fallback Banner */}
              {(activeAnalysis.source === 'fallback' || activeAnalysis.atsScoreEstimate == null) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start sm:items-center gap-3 shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                  <div className="text-xs space-y-0.5">
                    <div className="font-bold text-amber-200 text-sm">
                      Offline Mode: Heuristic Skill & Project Recommendations
                    </div>
                    <p className="text-[11px] text-amber-300/80">
                      Live AI scoring is currently offline. Stream-tailored project interrogation questions and skill recommendations are displayed below, but numeric match scoring is disabled to maintain scoring integrity.
                    </p>
                  </div>
                </div>
              )}

              {/* Honest Scoring & Transparency Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 flex items-start gap-3 shadow-lg">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-cyan-100 text-sm flex items-center gap-2">
                    <span>Score Transparency & Academic Fairness</span>
                    {(activeAnalysis.isStudent || user?.educationLevel) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-semibold uppercase tracking-wider">
                        Student-Fair Standard
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-cyan-200/90 leading-relaxed">
                    <strong>What this score means:</strong> This evaluation measures keyword coverage, clear formatting, and technical or academic depth against your target role. It is an educational preparation benchmark and is <em>never a guarantee of interview shortlisting or hiring</em>.
                  </p>
                  {(activeAnalysis.isStudent || user?.educationLevel) && (
                    <p className="text-[11px] text-cyan-300/90 leading-relaxed font-medium">
                      🎓 <strong>Zero Work Experience Penalty:</strong> As a student candidate, you are evaluated on verified coursework, academic laboratory experiments, and capstone projects. You are never penalized for lacking corporate work history.
                    </p>
                  )}
                </div>
              </div>

              {/* Top Overview Cards */}
              <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#9AA4B2] mb-1">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-[#F5F7FA]">{activeAnalysis.fileName}</span>
                    <span>•</span>
                    <span>Analyzed on {new Date(activeAnalysis.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
                    <span>Resume Audit for {targetRole}</span>
                  </h2>
                  {(activeAnalysis.educationLevel || activeAnalysis.academicStream) && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#9AA4B2]">
                      <span className="text-cyan-400 font-semibold">{activeAnalysis.educationLevel}</span>
                      {activeAnalysis.academicStream && <span>• {activeAnalysis.academicStream}</span>}
                      {activeAnalysis.intermediateGroup && <span>({activeAnalysis.intermediateGroup})</span>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 bg-[#080B11] p-4 rounded-xl border border-white/[0.08]">
                  <div className="w-14 h-14 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex flex-col items-center justify-center text-cyan-300">
                    <span className="text-xl font-black">{activeAnalysis.atsScoreEstimate ?? '--'}%</span>
                    <span className="text-[9px] uppercase font-bold">Match</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F5F7FA]">Relevance & Match Score</div>
                    <div className="text-[11px] text-[#9AA4B2] mt-0.5">Role keyword & domain alignment</div>
                    <div className="text-[10px] text-[#9AA4B2]/70 mt-0.5">Educational rubric benchmark</div>
                  </div>
                </div>
              </div>

              {/* Stream Evaluation Criteria */}
              {activeAnalysis.evaluationCriteria && activeAnalysis.evaluationCriteria.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-3">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Evaluation Dimensions Applied</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeAnalysis.evaluationCriteria.map((crit, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{crit}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detected Skills */}
                <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Detected Relevant Skills ({activeAnalysis.extractedSkills.length})</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeAnalysis.extractedSkills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Recommended Skills */}
                <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Recommended Skills for {targetRole}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeAnalysis.missingSkillsForRole.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Improvements for Resume */}
              <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-3">
                <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C5F36B]" />
                  <span>Recommended Resume Enhancements</span>
                </h3>
                <ul className="space-y-2 text-xs text-[#9AA4B2]">
                  {activeAnalysis.actionableImprovements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#C5F36B] font-bold">•</span>
                      <span className="text-[#F5F7FA]">{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tailored Questions from Candidate's Projects & Coursework */}
              <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>Questions Interviewers Will Ask About Your Resume</span>
                    </h3>
                    <p className="text-xs text-[#9AA4B2] mt-0.5">
                      Extracted directly from your detected projects, coursework, and practical training
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartPractice(activeAnalysis.tailoredInterviewQuestions)}
                    className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shrink-0"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Practice in Mock Room</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activeAnalysis.tailoredInterviewQuestions.map((q, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#080B11] border border-white/[0.06] text-xs text-[#F5F7FA] flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delete Option */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteResume(activeAnalysis.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete this resume scan</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center rounded-2xl bg-[#121826] border border-white/[0.08] space-y-2">
              <FileText className="w-10 h-10 text-[#9AA4B2] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#F5F7FA]">No resume scanned yet</p>
              <p className="text-xs text-[#9AA4B2]">
                Upload your PDF, DOCX, or TXT file above to view your personalized stream audit, or switch to the Resume Builder to craft an ATS-ready document.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
