import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Mic, 
  Trash2, 
  Cookie, 
  CreditCard, 
  Mail, 
  Printer, 
  ExternalLink, 
  ArrowLeft, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { LEGAL_DOCUMENTS, LegalDocument } from '../data/legalDocuments';
import { BrandIcon } from '../components/brand/BrandIcon';

interface LegalCenterPageProps {
  initialDocId?: string;
  onNavigate: (route: string) => void;
}

const DOC_ICONS: Record<string, React.FC<{ className?: string }>> = {
  terms: FileText,
  privacy: Lock,
  'ai-disclaimer': Sparkles,
  'voice-video': Mic,
  retention: Trash2,
  cookies: Cookie,
  pricing: CreditCard,
  contact: Mail,
};

export const LegalCenterPage: React.FC<LegalCenterPageProps> = ({ 
  initialDocId = 'terms', 
  onNavigate 
}) => {
  const [activeDocId, setActiveDocId] = useState<string>(initialDocId);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (initialDocId && LEGAL_DOCUMENTS[initialDocId]) {
      setActiveDocId(initialDocId);
    }
  }, [initialDocId]);

  const activeDoc: LegalDocument = LEGAL_DOCUMENTS[activeDocId] || LEGAL_DOCUMENTS.terms;
  const ActiveIcon = DOC_ICONS[activeDocId] || FileText;

  const docList = Object.values(LEGAL_DOCUMENTS);

  const filteredDocs = docList.filter(doc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.summary.toLowerCase().includes(q) ||
      doc.sections.some(s => s.heading.toLowerCase().includes(q) || s.content.some(c => c.toLowerCase().includes(q)))
    );
  });

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const renderLegalText = (text: string) => {
    if (!text.includes('[OWNER ACTION REQUIRED')) {
      return text;
    }
    const parts = text.split(/(\[OWNER ACTION REQUIRED[^\]]*\])/g);
    return (
      <>
        {parts.map((part, idx) => {
          if (part.startsWith('[OWNER ACTION REQUIRED')) {
            return (
              <span key={idx} className="inline-block px-1.5 py-0.5 my-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium text-[11px]">
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Legal & Trust Center</span>
              <span>/</span>
              <span className="text-violet-300 font-medium">{activeDoc.shortTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('privacy-center')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-violet-400" />
              <span>Open Privacy Center (Export / Delete)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors"
              title="Print current policy"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-[#121826] border border-white/[0.08] shadow-xl overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Digital Personal Data Protection (DPDP) Act 2023 Baseline</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA] tracking-tight">
              InterviewBro AI Trust & Compliance Center
            </h1>

            <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              We believe in radical transparency. Explore our legally drafted policies, verified technical media disclosures, and candidate privacy rights governing mock interviews, voice synthesis, and resume evaluations.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#9AA4B2]">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero webcam recording to server</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>No facial biometric or emotion analysis</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strict row-level database isolation</span>
              </span>
            </div>
          </div>
        </div>

        {/* Notice for App Owner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Notice: Operational Status & Governance Baseline</p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              InterviewBro AI is an educational technology simulation platform operated by an individual developer. It is not currently incorporated as a corporate entity (Private Limited Company, LLP, or partnership). These documents establish our statutory baseline under the Digital Personal Data Protection Act, 2023. Operational items flagged with <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300 font-mono">[OWNER ACTION REQUIRED]</code> designate verified details (such as communication address and monitored email channels) to be finalized before commercial deployment.
            </p>
          </div>
        </div>

        {/* Main Content Area: Sidebar Navigation + Document Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Navigation Sidebar & Search (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search policies, terms, keywords..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-slate-500 focus:outline-none focus:border-[#C5F36B] focus:ring-1 focus:ring-[#C5F36B]"
              />
            </div>

            {/* Document Navigation Buttons */}
            <div className="bg-[#121826] border border-white/[0.08] rounded-2xl p-2 space-y-1">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#9AA4B2]">
                Governance Documents ({docList.length})
              </div>

              {filteredDocs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No policy matches "{searchQuery}"
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const Icon = DOC_ICONS[doc.id] || FileText;
                  const isActive = activeDocId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setActiveDocId(doc.id);
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                      }}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-white/[0.08] text-[#F5F7FA] border border-white/[0.12] shadow-sm'
                          : 'text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isActive ? 'bg-[#C5F36B] text-[#080B11]' : 'bg-white/[0.06] text-slate-400'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{doc.title}</div>
                        <div className="text-[11px] text-[#9AA4B2] line-clamp-1 mt-0.5">{doc.summary}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Data Protection / Redressal Quick Card */}
            <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5F7FA]">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Need Data Assistance?</span>
              </div>
              <p className="text-xs text-[#9AA4B2] leading-relaxed">
                Under the Indian DPDP Act 2023, you have the right to access, rectify, and permanently erase your personal data.
              </p>
              <div className="pt-1 flex flex-col gap-2">
                <button
                  onClick={() => onNavigate('privacy-center')}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] transition-all shadow-md shadow-[#C5F36B]/15 flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Manage My Data / Delete Account</span>
                </button>
                <button
                  onClick={() => {
                    setActiveDocId('contact');
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Grievance Officer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Active Document Viewer (8 cols) */}
          <div className="lg:col-span-8">
            <div className="p-6 sm:p-10 rounded-3xl bg-[#121826] border border-white/[0.08] shadow-xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none">
              
              {/* Document Header */}
              <div className="border-b border-white/[0.08] pb-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[#C5F36B] text-xs font-semibold">
                    <ActiveIcon className="w-3.5 h-3.5 text-[#C5F36B]" />
                    <span>Official Policy Document</span>
                  </div>
                  <div className="text-xs text-[#9AA4B2] flex items-center gap-2">
                    <span>Version <strong className="text-[#F5F7FA]">{activeDoc.version}</strong></span>
                    <span>•</span>
                    <span>Effective: <strong className="text-[#F5F7FA]">{activeDoc.lastUpdated}</strong></span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
                  {activeDoc.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#9AA4B2] italic bg-[#080B11] p-3.5 rounded-xl border border-white/[0.08]">
                  {activeDoc.summary}
                </p>
              </div>

              {/* Document Sections */}
              <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeDoc.sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-3">
                    <h3 className="text-base sm:text-lg font-bold text-[#F5F7FA] flex items-center gap-2">
                      <span className="w-1.5 h-4 rounded-full bg-[#C5F36B] inline-block"></span>
                      <span>{section.heading}</span>
                    </h3>

                    {section.content.map((p, pIdx) => (
                      <p key={pIdx} className="text-slate-300 leading-relaxed">
                        {renderLegalText(p)}
                      </p>
                    ))}

                    {section.subsections && section.subsections.length > 0 && (
                      <div className="space-y-3 pl-3 sm:pl-4 border-l-2 border-white/[0.08] mt-3">
                        {section.subsections.map((sub, subIdx) => (
                          <div key={subIdx} className="space-y-2">
                            <h4 className="text-xs font-bold text-[#C5F36B] uppercase tracking-wide">
                              {sub.title}
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {sub.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#C5F36B] shrink-0 mt-1.5" />
                                  <span>{renderLegalText(bullet)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Document Footer */}
              <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9AA4B2]">
                <div>
                  InterviewBro AI Governance • Updated {activeDoc.lastUpdated}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Document</span>
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => onNavigate('privacy-center')}
                    className="text-[#C5F36B] hover:underline transition-colors flex items-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Privacy Controls</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
