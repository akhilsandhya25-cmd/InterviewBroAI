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
  ExternalLink,
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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-white/[0.08] bg-[#0B0F19] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
        aria-label="Sidebar Navigation"
      >
        {/* Navigation Groups */}
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Studio Navigation Group */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-[#9AA4B2]/70">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white/[0.08] text-[#F5F7FA] font-semibold border-l-2 border-[#C5F36B] shadow-sm'
                        : 'text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-white/[0.04]'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5F36B]`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5F36B]' : 'text-[#9AA4B2]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        item.badge === 'New'
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
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
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-[#9AA4B2]/70">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white/[0.08] text-[#F5F7FA] font-semibold border-l-2 border-[#C5F36B] shadow-sm'
                        : 'text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-white/[0.04]'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5F36B]`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5F36B]' : 'text-[#9AA4B2]'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Allowance / Quota Card */}
        <div className="p-4 border-t border-white/[0.08]">
          <div className="p-3.5 rounded-2xl bg-[#121826] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#F5F7FA] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5F36B]" /> Free Tier Access
              </span>
              <span className="text-xs font-bold text-[#C5F36B]">
                {quota.interviewsRemaining} of {quota.freeInterviewsTotal} left
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#080B11] h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-[#C5F36B] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(10, (quota.interviewsRemaining / quota.freeInterviewsTotal) * 100))}%` }}
              />
            </div>

            <p className="text-[11px] text-[#9AA4B2] leading-relaxed mb-2.5">
              Every student gets 5 free AI evaluation sessions. No credit card required.
            </p>

            <button
              onClick={() => handleNavClick('pricing')}
              className="w-full py-1.5 px-2.5 text-[11px] font-semibold text-[#F5F7FA] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-colors flex items-center justify-center gap-1 border border-white/[0.06]"
            >
              <span>View Usage & Plans</span>
              <ArrowRight className="w-3 h-3 text-[#C5F36B]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
