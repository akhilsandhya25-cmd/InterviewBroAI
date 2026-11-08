import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Video,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Briefcase,
  Award,
  Wrench,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ResumeBuilderData, ResumeType, ResumeTemplateStyle, UserProfile, EducationEntry, ProjectEntry, ExperienceEntry } from '../../types';
import { storage } from '../../services/storage';
import { RESUME_TYPE_CONFIGS, getDefaultResumeDraft, getRecommendedResumeType } from '../../data/resumeBuilderTemplates';

interface ResumeBuilderViewProps {
  user: UserProfile | null;
  onNavigateToSetup: (resumeText: string) => void;
}

export const ResumeBuilderView: React.FC<ResumeBuilderViewProps> = ({ user, onNavigateToSetup }) => {
  // 1. Initialize draft from storage or generate honest stream-aware default
  const [draft, setDraft] = useState<ResumeBuilderData>(() => {
    const saved = storage.getResumeDraft(user?.id);
    if (saved) return saved;
    return getDefaultResumeDraft(user);
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [activeSection, setActiveSection] = useState<string>('contact');
  const [saveStatus, setSaveStatus] = useState<string>('');

  const currentConfig = RESUME_TYPE_CONFIGS[draft.resumeType] || RESUME_TYPE_CONFIGS.undergraduate;

  // Auto-save draft changes to localStorage (user-isolated)
  useEffect(() => {
    storage.saveResumeDraft(draft, user?.id);
    setSaveStatus('Saved locally');
    const timer = setTimeout(() => setSaveStatus(''), 2000);
    return () => clearTimeout(timer);
  }, [draft, user?.id]);

  // Handle switching resume type
  const handleTypeChange = (newType: ResumeType) => {
    const newConfig = RESUME_TYPE_CONFIGS[newType];
    const updated: ResumeBuilderData = {
      ...draft,
      resumeType: newType,
      summaryOrObjective: newConfig.defaultObjective,
      subjects: [...newConfig.suggestedSubjects.slice(0, 5)],
      skills: [...newConfig.suggestedSkills.slice(0, 6)],
      hiddenSections: newConfig.hasWorkExperienceByDefault 
        ? draft.hiddenSections.filter(s => s !== 'experience')
        : Array.from(new Set([...draft.hiddenSections, 'experience']))
    };
    setDraft(updated);
  };

  // Reset to clean default draft
  const handleReset = () => {
    if (window.confirm('Reset this resume draft to stream defaults? Any unsaved edits will be cleared.')) {
      const fresh = getDefaultResumeDraft(user);
      fresh.resumeType = draft.resumeType;
      fresh.templateStyle = draft.templateStyle;
      setDraft(fresh);
      storage.saveResumeDraft(fresh, user?.id);
    }
  };

  // Section visibility toggle
  const toggleSection = (sectionKey: string) => {
    setDraft(prev => {
      const isHidden = prev.hiddenSections.includes(sectionKey);
      return {
        ...prev,
        hiddenSections: isHidden 
          ? prev.hiddenSections.filter(k => k !== sectionKey)
          : [...prev.hiddenSections, sectionKey]
      };
    });
  };

  // Trigger print-to-PDF
  const handlePrint = () => {
    window.print();
  };

  // Download plain text resume
  const handleDownloadText = () => {
    const text = storage.formatResumeForInterview(draft);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.fullName.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Launch mock interview with formatted resume text
  const handlePracticeInterview = () => {
    const text = storage.formatResumeForInterview(draft);
    onNavigateToSetup(text);
  };

  return (
    <div className="space-y-6">
      {/* Print CSS styles to ensure clean A4 export without UI chrome */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume-document, #printable-resume-document * {
            visibility: visible;
          }
          #printable-resume-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20mm;
            background: white !important;
            color: #111827 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Toolbar: Profile-Aware Stream Selector & Actions */}
      <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 no-print shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30">
              Universal Resume Builder
            </span>
            <span className="text-xs font-semibold text-[#F5F7FA]">
              {currentConfig.title}
            </span>
            {saveStatus && (
              <span className="text-[10px] text-emerald-400 font-medium animate-pulse">
                • {saveStatus}
              </span>
            )}
          </div>
          <p className="text-xs text-[#9AA4B2] max-w-xl">
            {currentConfig.description}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] text-[#F5F7FA] border border-white/[0.08] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadText}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] text-[#F5F7FA] border border-white/[0.08] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download Plain Text"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Text</span>
          </button>

          <button
            type="button"
            onClick={handlePracticeInterview}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#b0df57] text-[#080B11] shadow-md shadow-[#C5F36B]/20 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Practice Interview based on this resume"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Practice in Mock Room</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-xs font-bold text-[#9AA4B2] hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.06] transition-colors cursor-pointer"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stream Type Pills Selector */}
      <div className="p-4 rounded-2xl bg-[#0B0F19] border border-white/[0.06] space-y-2 no-print">
        <div className="flex items-center justify-between text-xs text-[#9AA4B2] px-1">
          <span className="font-semibold text-[#F5F7FA]">Select Resume Qualification Profile:</span>
          <span>7 Stream Architectures Available</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {Object.values(RESUME_TYPE_CONFIGS).map(cfg => {
            const isSelected = draft.resumeType === cfg.id;
            return (
              <button
                key={cfg.id}
                type="button"
                onClick={() => handleTypeChange(cfg.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#C5F36B] text-[#080B11] shadow-md shadow-[#C5F36B]/20'
                    : 'bg-[#121826] text-[#9AA4B2] hover:text-[#F5F7FA] border border-white/[0.06]'
                }`}
              >
                <span>{cfg.title}</span>
                <span className={`text-[10px] ${isSelected ? 'text-[#080B11]/70' : 'text-[#9AA4B2]/70'}`}>
                  ({cfg.badge})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ethical Guidance Notice */}
      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5 no-print">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-[#F5F7FA]">Honest Profile Guidance:</div>
          <p className="text-cyan-300/80 leading-relaxed text-[11px]">
            {currentConfig.guidanceTip}
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Editor / Right Live Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: GUIDED SECTION EDITOR */}
        <div className="lg:col-span-6 space-y-4 no-print">
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'contact', label: 'Contact' },
              { id: 'objective', label: 'Objective' },
              { id: 'education', label: 'Education' },
              { id: 'subjects', label: 'Subjects' },
              { id: 'projects', label: 'Projects' },
              { id: 'skills', label: 'Skills' },
              { id: 'experience', label: 'Experience/Training' },
              { id: 'achievements', label: 'Achievements' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  activeSection === tab.id
                    ? 'bg-cyan-500 text-[#080B11] font-bold'
                    : 'bg-[#121826] text-[#9AA4B2] hover:text-[#F5F7FA] border border-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Section 1: Contact Information */}
          {activeSection === 'contact' && (
            <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4 animate-in fade-in duration-150">
              <h3 className="text-sm font-bold text-[#F5F7FA]">Personal & Contact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#9AA4B2] mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={draft.fullName}
                    onChange={e => setDraft({ ...draft, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-white/[0.08] text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
                <div>
                  <label className="block text-[#9AA4B2] mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={e => setDraft({ ...draft, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-white/[0.08] text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
                <div>
                  <label className="block text-[#9AA4B2] mb-1 font-medium">Phone Number</label>
                  <input
                    type="text"
                    value={draft.phone}
                    onChange={e => setDraft({ ...draft, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-white/[0.08] text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
                <div>
                  <label className="block text-[#9AA4B2] mb-1 font-medium">City, State</label>
                  <input
                    type="text"
                    value={draft.location}
                    onChange={e => setDraft({ ...draft, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-white/[0.08] text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
                <div>
                  <label className="block text-[#9AA4B2] mb-1 font-medium">LinkedIn / Portfolio Link (Optional)</label>
                  <input
                    type="text"
                    value={draft.linkedinOrPortfolio || ''}
                    onChange={e => setDraft({ ...draft, linkedinOrPortfolio: e.target.value })}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-white/[0.08] text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
                <div>
                  <label className="block text-[#9AA4B2] mb-1 font-medium">GitHub / Work URL (Optional)</label>
                  <input
                    type="text"
                    value={draft.githubUrl || ''}
                    onChange={e => setDraft({ ...draft, githubUrl: e.target.value })}
                    placeholder="github.com/username"
                    className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-white/[0.08] text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Career / Academic Objective */}
          {activeSection === 'objective' && (
            <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F5F7FA]">
                  {draft.resumeType === 'student_intermediate' ? 'Academic Statement / Objective' : 'Professional Summary / Objective'}
                </h3>
                <button
                  type="button"
                  onClick={() => toggleSection('objective')}
                  className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA] flex items-center gap-1 cursor-pointer"
                >
                  {draft.hiddenSections.includes('objective') ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{draft.hiddenSections.includes('objective') ? 'Section Hidden' : 'Visible'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={draft.summaryOrObjective}
                onChange={e => setDraft({ ...draft, summaryOrObjective: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B] leading-relaxed"
              />
              <button
                type="button"
                onClick={() => setDraft({ ...draft, summaryOrObjective: currentConfig.defaultObjective })}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Reset to Stream Recommendation Template</span>
              </button>
            </div>
          )}

          {/* Section 3: Education */}
          {activeSection === 'education' && (
            <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F5F7FA]">Education & Qualifications</h3>
                <button
                  type="button"
                  onClick={() => {
                    const newEntry: EducationEntry = {
                      id: `edu-${Date.now()}`,
                      institution: '',
                      degreeOrGroup: '',
                      yearOfCompletion: '',
                      scoreOrGrade: ''
                    };
                    setDraft({ ...draft, education: [...draft.education, newEntry] });
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Education</span>
                </button>
              </div>

              <div className="space-y-3">
                {draft.education.map((edu, idx) => (
                  <div key={edu.id} className="p-4 rounded-xl bg-[#080B11] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#9AA4B2]">
                      <span>Entry #{idx + 1}</span>
                      {draft.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setDraft({ ...draft, education: draft.education.filter(e => e.id !== edu.id) })}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-[#9AA4B2] block mb-0.5">Degree / Course / Group</label>
                        <input
                          type="text"
                          value={edu.degreeOrGroup}
                          onChange={e => {
                            const updated = [...draft.education];
                            updated[idx].degreeOrGroup = e.target.value;
                            setDraft({ ...draft, education: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#121826] border border-white/[0.08] text-[#F5F7FA]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#9AA4B2] block mb-0.5">School / College / Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={e => {
                            const updated = [...draft.education];
                            updated[idx].institution = e.target.value;
                            setDraft({ ...draft, education: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#121826] border border-white/[0.08] text-[#F5F7FA]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#9AA4B2] block mb-0.5">Year of Completion</label>
                        <input
                          type="text"
                          value={edu.yearOfCompletion}
                          onChange={e => {
                            const updated = [...draft.education];
                            updated[idx].yearOfCompletion = e.target.value;
                            setDraft({ ...draft, education: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#121826] border border-white/[0.08] text-[#F5F7FA]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#9AA4B2] block mb-0.5">Percentage / CGPA / Grade (Optional)</label>
                        <input
                          type="text"
                          value={edu.scoreOrGrade}
                          onChange={e => {
                            const updated = [...draft.education];
                            updated[idx].scoreOrGrade = e.target.value;
                            setDraft({ ...draft, education: updated });
                          }}
                          placeholder="e.g. 85% or 8.5 CGPA"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#121826] border border-white/[0.08] text-[#F5F7FA] placeholder-[#9AA4B2]/40"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Core Subjects & Coursework */}
          {activeSection === 'subjects' && (
            <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Core Academic Coursework & Subjects</h3>
                  <p className="text-[11px] text-[#9AA4B2]">Highlight key syllabus chapters or specialized coursework</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection('subjects')}
                  className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA] flex items-center gap-1 cursor-pointer"
                >
                  {draft.hiddenSections.includes('subjects') ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{draft.hiddenSections.includes('subjects') ? 'Hidden' : 'Visible'}</span>
                </button>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1.5">
                {draft.subjects.map((sub, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5 font-medium">
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, subjects: draft.subjects.filter((_, i) => i !== idx) })}
                      className="text-cyan-400 hover:text-cyan-100 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Add Suggestions */}
              <div className="pt-2 border-t border-white/[0.04] space-y-1.5">
                <span className="text-[10px] text-[#9AA4B2] font-semibold uppercase tracking-wider">Stream Suggestions (Click to Add):</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentConfig.suggestedSubjects.map((sub, idx) => {
                    const alreadyAdded = draft.subjects.includes(sub);
                    if (alreadyAdded) return null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDraft({ ...draft, subjects: [...draft.subjects, sub] })}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-white/[0.04] hover:bg-white/[0.1] text-[#9AA4B2] hover:text-[#F5F7FA] border border-white/[0.06] cursor-pointer"
                      >
                        + {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Projects & Practical Work */}
          {activeSection === 'projects' && (
            <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F7FA]">
                    {draft.resumeType === 'student_intermediate' ? 'Academic Projects & Exhibition Models' : 'Projects & Capstone Work'}
                  </h3>
                  <p className="text-[11px] text-[#9AA4B2]">Science fair projects, capstone prototypes, or software builds</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newProj: ProjectEntry = {
                      id: `proj-${Date.now()}`,
                      title: '',
                      toolsOrTech: '',
                      description: '',
                      outcomeMetric: ''
                    };
                    setDraft({ ...draft, projects: [...draft.projects, newProj] });
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="space-y-3">
                {draft.projects.map((proj, idx) => (
                  <div key={proj.id} className="p-4 rounded-xl bg-[#080B11] border border-white/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#9AA4B2]">
                      <span>Project #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, projects: draft.projects.filter(p => p.id !== proj.id) })}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] text-[#9AA4B2] block mb-0.5">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={e => {
                            const updated = [...draft.projects];
                            updated[idx].title = e.target.value;
                            setDraft({ ...draft, projects: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#121826] border border-white/[0.08] text-[#F5F7FA]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#9AA4B2] block mb-0.5">Tools, Materials or Tech Stack</label>
                        <input
                          type="text"
                          value={proj.toolsOrTech || ''}
                          onChange={e => {
                            const updated = [...draft.projects];
                            updated[idx].toolsOrTech = e.target.value;
                            setDraft({ ...draft, projects: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#121826] border border-white/[0.08] text-[#F5F7FA]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#9AA4B2] block mb-0.5">Description & Your Contribution</label>
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={e => {
                            const updated = [...draft.projects];
                            updated[idx].description = e.target.value;
                            setDraft({ ...draft, projects: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#121826] border border-white/[0.08] text-[#F5F7FA]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#9AA4B2] block mb-0.5">Quantifiable Outcome / Award (Optional)</label>
                        <input
                          type="text"
                          value={proj.outcomeMetric || ''}
                          onChange={e => {
                            const updated = [...draft.projects];
                            updated[idx].outcomeMetric = e.target.value;
                            setDraft({ ...draft, projects: updated });
                          }}
                          placeholder="e.g. Won 2nd place in Science Fair, Audited 100+ transactions"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#121826] border border-white/[0.08] text-[#F5F7FA]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Skills & Tools */}
          {activeSection === 'skills' && (
            <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Skills, Tools & Competencies</h3>
                  <p className="text-[11px] text-[#9AA4B2]">Technical, laboratory, trade, or communication competencies</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection('skills')}
                  className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA] flex items-center gap-1 cursor-pointer"
                >
                  {draft.hiddenSections.includes('skills') ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{draft.hiddenSections.includes('skills') ? 'Hidden' : 'Visible'}</span>
                </button>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1.5">
                {draft.skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5 font-medium">
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, skills: draft.skills.filter((_, i) => i !== idx) })}
                      className="text-emerald-400 hover:text-emerald-100 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Add Suggestions */}
              <div className="pt-2 border-t border-white/[0.04] space-y-1.5">
                <span className="text-[10px] text-[#9AA4B2] font-semibold uppercase tracking-wider">Recommended Skills for Your Stream:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentConfig.suggestedSkills.map((sk, idx) => {
                    const alreadyAdded = draft.skills.includes(sk);
                    if (alreadyAdded) return null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDraft({ ...draft, skills: [...draft.skills, sk] })}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-white/[0.04] hover:bg-white/[0.1] text-[#9AA4B2] hover:text-[#F5F7FA] border border-white/[0.06] cursor-pointer"
                      >
                        + {sk}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section 7: Experience / Postings / Apprenticeships */}
          {activeSection === 'experience' && (
            <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F7FA]">
                    {draft.resumeType === 'professional' ? 'Clinical Postings / Articleship / Chamber Training' : 'Practical Experience / Apprenticeship'}
                  </h3>
                  <p className="text-[11px] text-[#9AA4B2]">Optional for freshers and student profiles</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection('experience')}
                  className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA] flex items-center gap-1 cursor-pointer"
                >
                  {draft.hiddenSections.includes('experience') ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{draft.hiddenSections.includes('experience') ? 'Section Hidden (Honest for Students)' : 'Visible'}</span>
                </button>
              </div>

              {draft.hiddenSections.includes('experience') ? (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-[#9AA4B2] space-y-1">
                  <div className="font-bold text-cyan-300">Notice for Students & Freshers:</div>
                  <p className="text-[11px]">
                    This section is intentionally hidden for your profile. Academic recruiters do not expect high school or junior college students to have employment history. Toggle visibility above only if you have a genuine internship, apprenticeship, or clinical posting.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newExp: ExperienceEntry = {
                        id: `exp-${Date.now()}`,
                        organization: 'Hospital / Firm / Plant Name',
                        roleTitle: 'Trainee / Apprentice / Intern',
                        startDate: 'Jan 2024',
                        endDate: 'Present',
                        keyResponsibilities: ['Conducted day-to-day operations under senior supervision']
                      };
                      setDraft({ ...draft, experience: [...draft.experience, newExp] });
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Experience / Training Record</span>
                  </button>

                  {draft.experience.map((exp, idx) => (
                    <div key={exp.id} className="p-4 rounded-xl bg-[#080B11] border border-white/[0.06] space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-[#9AA4B2]">
                        <span>Record #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setDraft({ ...draft, experience: draft.experience.filter(e => e.id !== exp.id) })}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[#9AA4B2] block mb-0.5">Role / Position Title</label>
                          <input
                            type="text"
                            value={exp.roleTitle}
                            onChange={e => {
                              const updated = [...draft.experience];
                              updated[idx].roleTitle = e.target.value;
                              setDraft({ ...draft, experience: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#121826] border border-white/[0.08] text-[#F5F7FA]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#9AA4B2] block mb-0.5">Organization / Company</label>
                          <input
                            type="text"
                            value={exp.organization}
                            onChange={e => {
                              const updated = [...draft.experience];
                              updated[idx].organization = e.target.value;
                              setDraft({ ...draft, experience: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#121826] border border-white/[0.08] text-[#F5F7FA]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 8: Achievements & Extracurricular */}
          {activeSection === 'achievements' && (
            <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4 animate-in fade-in duration-150">
              <h3 className="text-sm font-bold text-[#F5F7FA]">Achievements, Honors & Activities</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9AA4B2] mb-1">
                    Academic Achievements & Awards (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.achievements.join('\n')}
                    onChange={e => setDraft({ ...draft, achievements: e.target.value.split('\n').filter(Boolean) })}
                    className="w-full p-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9AA4B2] mb-1">
                    Extracurricular Activities & Leadership (Sports, NCC, NSS, Clubs)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.extracurricular.join('\n')}
                    onChange={e => setDraft({ ...draft, extracurricular: e.target.value.split('\n').filter(Boolean) })}
                    className="w-full p-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE RESUME DOCUMENT PREVIEW */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9AA4B2] px-1 no-print">
            <span className="font-bold text-[#F5F7FA]">Real-Time A4 Document Preview</span>
            <span className="text-[11px] text-cyan-400">Updates instantly as you type</span>
          </div>

          {/* DOCUMENT PAPER CANVAS */}
          <div
            id="printable-resume-document"
            className="p-8 sm:p-10 rounded-2xl bg-white text-gray-900 shadow-2xl space-y-6 font-sans text-xs leading-relaxed max-w-2xl mx-auto"
            style={{ minHeight: '842px' }}
          >
            {/* Header: Full Name & Contact */}
            <div className="border-b-2 border-gray-900 pb-4 space-y-1 text-center">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                {draft.fullName || 'Candidate Name'}
              </h1>
              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-600 flex-wrap">
                {draft.email && <span>{draft.email}</span>}
                {draft.phone && <span>• {draft.phone}</span>}
                {draft.location && <span>• {draft.location}</span>}
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 flex-wrap">
                {draft.linkedinOrPortfolio && <span>{draft.linkedinOrPortfolio}</span>}
                {draft.githubUrl && <span>• {draft.githubUrl}</span>}
              </div>
            </div>

            {/* Objective / Summary */}
            {draft.summaryOrObjective && !draft.hiddenSections.includes('objective') && (
              <div className="space-y-1">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">
                  {draft.resumeType === 'student_intermediate' ? 'Academic Objective' : 'Career Objective / Summary'}
                </h2>
                <p className="text-[11px] text-gray-700 leading-relaxed text-justify">
                  {draft.summaryOrObjective}
                </p>
              </div>
            )}

            {/* Education */}
            {draft.education && draft.education.length > 0 && !draft.hiddenSections.includes('education') && (
              <div className="space-y-2">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">
                  Education & Academic Foundation
                </h2>
                <div className="space-y-2">
                  {draft.education.map(edu => (
                    <div key={edu.id} className="flex justify-between items-start text-[11px]">
                      <div>
                        <div className="font-bold text-gray-900">{edu.degreeOrGroup}</div>
                        <div className="text-gray-600">{edu.institution} {edu.boardOrUniversity ? `• ${edu.boardOrUniversity}` : ''}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-gray-800">{edu.yearOfCompletion}</div>
                        {edu.scoreOrGrade && (
                          <div className="text-gray-600 text-[10px]">Score: {edu.scoreOrGrade}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Core Subjects */}
            {draft.subjects && draft.subjects.length > 0 && !draft.hiddenSections.includes('subjects') && (
              <div className="space-y-1">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">
                  Core Subjects & Coursework
                </h2>
                <p className="text-[11px] text-gray-800">
                  {draft.subjects.join(' • ')}
                </p>
              </div>
            )}

            {/* Projects & Practical Work */}
            {draft.projects && draft.projects.length > 0 && !draft.hiddenSections.includes('projects') && (
              <div className="space-y-2">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">
                  {draft.resumeType === 'student_intermediate' ? 'Academic Projects & Exhibitions' : 'Projects & Practical Implementation'}
                </h2>
                <div className="space-y-2">
                  {draft.projects.map(proj => (
                    <div key={proj.id} className="text-[11px] space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">{proj.title}</span>
                        {proj.toolsOrTech && (
                          <span className="text-[10px] text-gray-600 italic">[{proj.toolsOrTech}]</span>
                        )}
                      </div>
                      <p className="text-gray-700 text-justify">{proj.description}</p>
                      {proj.outcomeMetric && (
                        <p className="text-[10px] text-emerald-800 font-medium">Outcome: {proj.outcomeMetric}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Tools */}
            {draft.skills && draft.skills.length > 0 && !draft.hiddenSections.includes('skills') && (
              <div className="space-y-1">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">
                  Skills & Tools
                </h2>
                <p className="text-[11px] text-gray-800">
                  {draft.skills.join(', ')}
                </p>
              </div>
            )}

            {/* Practical Experience / Postings */}
            {draft.experience && draft.experience.length > 0 && !draft.hiddenSections.includes('experience') && (
              <div className="space-y-2">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">
                  {draft.resumeType === 'professional' ? 'Clinical Postings / Articleship' : 'Experience & Training'}
                </h2>
                <div className="space-y-2">
                  {draft.experience.map(exp => (
                    <div key={exp.id} className="text-[11px] space-y-0.5">
                      <div className="flex justify-between items-center font-bold text-gray-900">
                        <span>{exp.roleTitle} — {exp.organization}</span>
                        <span className="text-[10px] font-medium text-gray-600">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      {exp.keyResponsibilities && exp.keyResponsibilities.length > 0 && (
                        <ul className="list-disc pl-4 text-gray-700 space-y-0.5">
                          {exp.keyResponsibilities.map((resp, i) => (
                            <li key={i}>{resp}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements & Extracurricular */}
            {((draft.achievements && draft.achievements.length > 0) || (draft.extracurricular && draft.extracurricular.length > 0)) && !draft.hiddenSections.includes('achievements') && (
              <div className="space-y-1">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">
                  Achievements & Extracurricular Leadership
                </h2>
                <ul className="list-disc pl-4 text-[11px] text-gray-700 space-y-0.5">
                  {draft.achievements.map((ach, i) => (
                    <li key={`ach-${i}`}>{ach}</li>
                  ))}
                  {draft.extracurricular.map((ext, i) => (
                    <li key={`ext-${i}`}>{ext}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
