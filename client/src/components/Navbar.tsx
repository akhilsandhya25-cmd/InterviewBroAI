import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Video, Menu, X, LogOut, Settings as SettingsIcon, History, UserCheck, ChevronDown } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080B11]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Left: Mobile Navigation Drawer Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-[#9AA4B2] hover:text-[#F5F7FA] rounded-xl hover:bg-white/[0.06] lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5F36B]"
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
            className="hidden md:flex items-center gap-7 text-xs font-medium text-[#9AA4B2]"
            aria-label="Main page navigation"
          >
            <a href="#how-it-works" className="hover:text-[#F5F7FA] transition-colors">How It Works</a>
            <a href="#features" className="hover:text-[#F5F7FA] transition-colors">Features</a>
            <a href="#company-tracks" className="hover:text-[#F5F7FA] transition-colors">Company Tracks</a>
            <a href="#pricing" className="hover:text-[#F5F7FA] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#F5F7FA] transition-colors">FAQ</a>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Primary Action Button */}
              <button
                onClick={() => onNavigate('setup')}
                className="btn-primary text-xs py-2 px-3.5"
              >
                <Video className="w-4 h-4" />
                <span>Start Mock</span>
              </button>

              {/* Authenticated User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/[0.06] text-[#F5F7FA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5F36B]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#121826] border border-white/[0.12] flex items-center justify-center text-xs font-bold text-[#C5F36B]">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <span className="hidden md:block text-xs font-medium text-[#F5F7FA] max-w-[130px] truncate">
                    {user.full_name || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#9AA4B2] transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-56 py-1.5 rounded-2xl bg-[#121826] border border-white/[0.1] shadow-2xl z-50 animate-fade-in"
                  >
                    <div className="px-4 py-3 border-b border-white/[0.08]">
                      <p className="text-xs font-semibold text-[#F5F7FA] truncate">{user.full_name || 'Candidate'}</p>
                      <p className="text-[11px] text-[#9AA4B2] truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-white/[0.04] transition-colors text-left"
                      >
                        <UserCheck className="w-4 h-4 text-[#9AA4B2]" />
                        <span>Candidate Profile</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('history');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-white/[0.04] transition-colors text-left"
                      >
                        <History className="w-4 h-4 text-[#9AA4B2]" />
                        <span>Session History</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-white/[0.04] transition-colors text-left"
                      >
                        <SettingsIcon className="w-4 h-4 text-[#9AA4B2]" />
                        <span>Settings & Privacy</span>
                      </button>
                    </div>

                    <div className="border-t border-white/[0.08] my-1" />

                    <button
                      role="menuitem"
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await logout();
                        onNavigate('landing');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
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
                className="btn-ghost text-xs py-2 px-3.5"
              >
                <span>Sign In</span>
              </button>

              <button
                onClick={() => onOpenAuth ? onOpenAuth('signup') : onNavigate('setup')}
                className="btn-primary text-xs py-2 px-3.5"
              >
                <span>Start Free Interview</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
