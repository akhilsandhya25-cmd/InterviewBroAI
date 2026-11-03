import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Video, Menu, X, LogOut, Settings as SettingsIcon, History, UserCheck, ChevronDown, GraduationCap } from 'lucide-react';
import { BrandLogo } from './brand/BrandLogo';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onNavigate: (route: string) => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onNavigate,
  onOpenAuth,
  currentRoute
}) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Left: Mobile Navigation Drawer Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-slate-600 hover:text-slate-950 rounded-xl hover:bg-slate-100 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <BrandLogo
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            size="md"
            showTagline={false}
          />
        </div>

        {/* Center: Landing Page In-Page Navigation Links */}
        {currentRoute === 'landing' && (
          <nav
            className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600"
            aria-label="Main page navigation"
          >
            <button
              onClick={() => onNavigate('academy')}
              className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-2.5 py-1 rounded-lg border border-blue-200/60 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Academy</span>
            </button>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#company-tracks" className="hover:text-blue-600 transition-colors">Company Tracks</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Primary Action Button */}
              <button
                onClick={() => onNavigate('setup')}
                className="btn-primary text-xs py-2 px-2.5 sm:px-3.5"
                title="Start Mock Interview"
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Start Mock</span>
              </button>

              {/* Authenticated User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <span className="hidden md:block text-xs font-semibold text-slate-800 max-w-[130px] truncate">
                    {user.full_name || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-56 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 animate-fade-in"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-950 truncate">{user.full_name || 'Candidate'}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors text-left"
                      >
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span>Candidate Profile</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('history');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors text-left"
                      >
                        <History className="w-4 h-4 text-blue-600" />
                        <span>Session History</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors text-left"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-400" />
                        <span>Settings & Privacy</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      role="menuitem"
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await logout();
                        onNavigate('landing');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : onNavigate('landing')}
                className="btn-ghost text-xs py-2 px-2.5 sm:px-3.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50/40"
              >
                <span>Sign In</span>
              </button>

              <button
                onClick={() => onOpenAuth ? onOpenAuth('signup') : onNavigate('setup')}
                className="btn-primary text-xs py-2 px-2.5 sm:px-3.5"
              >
                <span className="hidden sm:inline">Start Free </span><span>Interview</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
