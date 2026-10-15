import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Video, ShieldCheck, Flame, Menu, X } from 'lucide-react';
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
  const { user, quota, isSupabaseConnected, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080b11]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <BrandLogo 
            onClick={() => onNavigate('dashboard')} 
            size="md"
            showTagline={true}
          />
        </div>

        {/* Center: Quick navigation links for Landing view */}
        {currentRoute === 'landing' && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#company-tracks" className="hover:text-white transition-colors">Company Tracks</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Supabase status badge */}
          <div 
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border ${
              isSupabaseConnected 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
            title={isSupabaseConnected ? 'Connected to Supabase PostgreSQL' : 'Local Offline Mode (Add Supabase URL in .env to sync)'}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isSupabaseConnected ? 'Cloud Synced' : 'Local Mode'}</span>
          </div>

          {/* Quota Indicator */}
          <div 
            onClick={() => onNavigate('pricing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 hover:border-violet-500/50 cursor-pointer transition-colors text-xs font-medium"
            title="Free Tier Allowance"
          >
            <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            <span className="text-slate-300">
              <strong className="text-emerald-400">Unlimited</strong> Access
            </span>
          </div>

          {/* Start Mock Interview CTA */}
          <button
            onClick={() => onNavigate('setup')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold gradient-button"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Start Mock</span>
          </button>

          {/* User Profile / Auth Toggle */}
          {user ? (
            <div className="relative group">
              <button 
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow">
                  {user.full_name ? user.full_name.charAt(0) : 'U'}
                </div>
                <span className="hidden md:block text-xs font-medium text-slate-200 max-w-[120px] truncate">
                  {user.full_name || user.email.split('@')[0]}
                </span>
              </button>

              {/* Dropdown Menu on hover/click */}
              <div className="absolute right-0 top-full mt-1 w-48 py-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 z-50">
                <div className="px-3 py-2 border-b border-slate-800/80">
                  <p className="text-xs font-medium text-white truncate">{user.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => onNavigate('profile')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                >
                  My Profile & Skills
                </button>
                <button
                  onClick={() => onNavigate('history')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                >
                  Interview History
                </button>
                <button
                  onClick={() => onNavigate('settings')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                >
                  Account Settings
                </button>
                <div className="border-t border-slate-800/80 my-1"></div>
                <button
                  onClick={async () => {
                    await logout();
                    onNavigate('landing');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth ? onOpenAuth('login') : onNavigate('landing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
