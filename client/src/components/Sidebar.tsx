import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Video,
  FileText,
  History,
  UserCheck,
  CreditCard,
  Settings,
  Shield,
  ArrowRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, isOpen, onClose }) => {
  const { quota } = useAuth();

  // Close sidebar on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const studioItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'academy', label: 'Interview Academy', icon: GraduationCap, badge: 'New' },
    { id: 'setup', label: 'Start Mock Interview', icon: Video, badge: 'Live' },
    { id: 'resume', label: 'Resume ATS Analyzer', icon: FileText, badge: 'New' },
    { id: 'history', label: 'Session History', icon: History },
    { id: 'profile', label: 'Candidate Profile', icon: UserCheck },
  ];

  const governanceItems = [
    { id: 'pricing', label: 'Free Tier & Plans', icon: CreditCard },
    { id: 'settings', label: 'Settings & Security', icon: Settings },
    { id: 'privacy-center', label: 'Privacy Center', icon: Shield },
    { id: 'legal', label: 'Legal & Policies', icon: FileText },
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
        aria-label="Sidebar Navigation"
      >
        {/* Navigation Groups */}
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Studio Navigation Group */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400">
              Interview Studio
            </div>

            <nav className="space-y-1" aria-label="Studio Links">
              {studioItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        item.badge === 'Live'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Account & Trust Navigation Group */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400">
              Account & Governance
            </div>

            <nav className="space-y-1" aria-label="Governance Links">
              {governanceItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id || (item.id === 'legal' && currentRoute.startsWith('legal'));
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id === 'legal' ? 'legal:terms' : item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Allowance / Quota Card */}
        <div className="p-4 border-t border-slate-200">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Free Tier Access
              </span>
              <span className="text-xs font-bold text-blue-700">
                {quota.interviewsRemaining} of {quota.freeInterviewsTotal} left
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(10, (quota.interviewsRemaining / quota.freeInterviewsTotal) * 100))}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
              Every student gets 5 free AI evaluation sessions. No credit card required.
            </p>

            <button
              onClick={() => handleNavClick('pricing')}
              className="w-full py-1.5 px-2.5 text-[11px] font-semibold text-slate-700 hover:text-blue-700 bg-white hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1 border border-slate-200 shadow-sm"
            >
              <span>View Usage & Plans</span>
              <ArrowRight className="w-3 h-3 text-blue-600" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
