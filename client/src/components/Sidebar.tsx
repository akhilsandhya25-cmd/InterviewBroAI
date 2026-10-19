import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  FileText, 
  History, 
  Award, 
  UserCheck, 
  CreditCard, 
  Settings, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, isOpen, onClose }) => {
  const { quota, user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'setup', label: 'Start Mock Interview', icon: Video, badge: 'Live' },
    { id: 'resume', label: 'Resume ATS Analyzer', icon: FileText, badge: 'New' },
    { id: 'history', label: 'Session History', icon: History },
    { id: 'profile', label: 'Candidate Profile', icon: UserCheck },
    { id: 'pricing', label: 'Free Tier & Plans', icon: CreditCard },
    { id: 'settings', label: 'Settings & Security', icon: Settings },
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-[#0a0e17] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        {/* Navigation Links */}
        <div className="p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            Interview Studio
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/10 text-white border border-violet-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                    item.badge === 'New' 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            Trust & Governance
          </div>

          <button
            onClick={() => handleNavClick('privacy-center')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              currentRoute === 'privacy-center'
                ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/10 text-white border border-violet-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Privacy Center</span>
            </div>
          </button>

          <button
            onClick={() => handleNavClick('legal:terms')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              currentRoute === 'legal'
                ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/10 text-white border border-violet-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-violet-400" />
              <span>Legal & Policies</span>
            </div>
          </button>

          <button
            onClick={() => handleNavClick('landing')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              currentRoute === 'landing'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Public Landing Page</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>


        {/* Bottom Quota Box */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-xl group-hover:bg-violet-600/20 transition-all pointer-events-none"></div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Practice Quota
              </span>
              <span className="text-xs font-bold text-emerald-400">
                Unlimited
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2.5">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-violet-500 h-full rounded-full transition-all duration-300 w-full"
              ></div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Designed for college students & freshers. No credit card required.
            </p>

            <button
              onClick={() => handleNavClick('pricing')}
              className="w-full py-1.5 px-2.5 text-[11px] font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <span>Explore Unlimited Plans</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
