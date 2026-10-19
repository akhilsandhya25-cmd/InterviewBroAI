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
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c1222] via-[#0b101c] to-[#070a12] border border-slate-800 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Digital Personal Data Protection (DPDP) Act 2023 Baseline</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              InterviewBro AI Trust & Compliance Center
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We believe in radical transparency. Explore our legally drafted policies, verified technical media disclosures, and candidate privacy rights governing mock interviews, voice synthesis, and resume evaluations.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
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
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Notice for Platform Owner & Legal Counsel</p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              These documents are structured in full compliance with the Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025. Placeholders enclosed in brackets (e.g. <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300">[Entity Name]</code>, <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300">[Grievance Officer Name]</code>) should be populated with your registered business information prior to commercial rollout.
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
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Document Navigation Buttons */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2 space-y-1">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                          ? 'bg-violet-600/20 text-white border border-violet-500/40 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isActive ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{doc.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{doc.summary}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Data Protection / Redressal Quick Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0c1220] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Need Data Assistance?</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Under the Indian DPDP Act 2023, you have the right to access, rectify, and permanently erase your personal data.
              </p>
              <div className="pt-1 flex flex-col gap-2">
                <button
                  onClick={() => onNavigate('privacy-center')}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Manage My Data / Delete Account</span>
                </button>
                <button
                  onClick={() => {
                    setActiveDocId('contact');
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Grievance Officer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Active Document Viewer (8 cols) */}
          <div className="lg:col-span-8">
            <div className="p-6 sm:p-10 rounded-3xl bg-[#0c111c] border border-slate-800 shadow-xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none">
              
              {/* Document Header */}
              <div className="border-b border-slate-800/80 pb-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                    <ActiveIcon className="w-3.5 h-3.5 text-violet-400" />
                    <span>Official Policy Document</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Version <strong className="text-slate-200">{activeDoc.version}</strong></span>
                    <span>•</span>
                    <span>Effective: <strong className="text-slate-200">{activeDoc.lastUpdated}</strong></span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activeDoc.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 italic bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                  {activeDoc.summary}
                </p>
              </div>

              {/* Document Sections */}
              <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeDoc.sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-3">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-4 rounded-full bg-violet-500 inline-block"></span>
                      <span>{section.heading}</span>
                    </h3>

                    {section.content.map((p, pIdx) => (
                      <p key={pIdx} className="text-slate-300 leading-relaxed">
                        {p}
                      </p>
                    ))}

                    {section.subsections && section.subsections.length > 0 && (
                      <div className="space-y-3 pl-3 sm:pl-4 border-l-2 border-slate-800 mt-3">
                        {section.subsections.map((sub, subIdx) => (
                          <div key={subIdx} className="space-y-2">
                            <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wide">
                              {sub.title}
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {sub.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-1.5" />
                                  <span>{bullet}</span>
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
              <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
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
                    className="text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
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
