import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InterviewProvider, useInterview } from './context/InterviewContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { InterviewSetup } from './pages/InterviewSetup';
import { InterviewRoom } from './pages/InterviewRoom';
import { FeedbackReportView } from './pages/FeedbackReport';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { PricingPage } from './pages/PricingPage';
import { SettingsPage } from './pages/SettingsPage';
import { LegalCenterPage } from './pages/LegalCenterPage';
import { PrivacyCenterPage } from './pages/PrivacyCenterPage';
import { InterviewAcademy } from './pages/InterviewAcademy';
import { IntroSplashAnimation } from './components/IntroSplashAnimation';
import { Shield, Lock, ArrowRight, Sparkles, Loader2, GraduationCap, Info, BookOpen, FileText, Users } from 'lucide-react';
import { checkInterviewEligibility } from './services/interviewEligibility';
import { BrandIcon } from './components/brand/BrandIcon';
import { DevelopmentNoticeBanner } from './components/DevelopmentNoticeBanner';
import { storage } from './services/storage';
import { UserProfile } from './types';


const PROTECTED_ROUTES = new Set([
  'dashboard',
  'setup',
  'interview',
  'reports',
  'resume',
  'history',
  'profile',
  'settings'
]);

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { activeReport } = useInterview();

  // Intro Splash Animation State (only on initial launch)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Navigation route: 'landing' | 'dashboard' | 'setup' | 'interview' | 'reports' | 'resume' | 'history' | 'profile' | 'pricing' | 'settings' | 'legal' | 'privacy-center'
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [activeLegalDoc, setActiveLegalDoc] = useState<string>('terms');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password' | 'update_password'>('login');
  const [authModalError, setAuthModalError] = useState<string | null>(null);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  // Close auth modal immediately once user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) {
      setIsAuthModalOpen(false);
      setAuthModalError(null);
    }
  }, [isAuthenticated, isAuthModalOpen]);

  // Handle URL hash fragments & search parameters (OAuth callbacks, email verification, password recovery, errors)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for password recovery event dispatched by AuthContext onAuthStateChange
    const handlePasswordRecovery = () => {
      setAuthModalMode('update_password');
      setAuthModalError(null);
      setIsAuthModalOpen(true);
    };
    window.addEventListener('interviewbro_password_recovery', handlePasswordRecovery);

    // 1. Check for OAuth errors in URL query or hash parameters
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
    const hashParams = new URLSearchParams(cleanHash);

    const errorDesc = searchParams.get('error_description') 
      || searchParams.get('error') 
      || hashParams.get('error_description') 
      || hashParams.get('error');

    if (errorDesc) {
      // Purge query and hash from browser address bar history
      window.history.replaceState(null, '', window.location.pathname);
      const friendlyError = decodeURIComponent(errorDesc.replace(/\+/g, ' '));
      setAuthModalError(friendlyError);
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    } else if (hash && (hash.includes('access_token=') || hash.includes('type='))) {
      try {
        const type = hashParams.get('type');

        // Allow Supabase SDK a microtick to process the tokens, then purge from address bar
        setTimeout(() => {
          if (window.location.hash.includes('access_token=')) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }, 150);

        if (type === 'recovery') {
          setAuthModalMode('update_password');
          setAuthModalError(null);
          setIsAuthModalOpen(true);
        }
      } catch (e) {
        console.warn('Error processing URL auth hash:', e);
      }
    }

    // Direct public route navigation via URL search param (e.g. ?route=academy)
    const targetRouteParam = searchParams.get('route') || (cleanHash && !cleanHash.includes('=') && !cleanHash.includes('/') ? cleanHash : null);
    if (targetRouteParam && (targetRouteParam === 'academy' || targetRouteParam === 'pricing' || targetRouteParam === 'legal' || targetRouteParam === 'privacy-center')) {
      setCurrentRoute(targetRouteParam);
    }

    return () => {
      window.removeEventListener('interviewbro_password_recovery', handlePasswordRecovery);
    };
  }, []);

  // Determine if candidate has completed their onboarding profile
  const isProfileComplete = (u: UserProfile | null): boolean => {
    if (!u) return false;
    if (u.profile_completed === true) return true;
    if (u.profile_completed === false) return false;
    return Boolean(u.role_target && u.role_target.trim().length > 0 && u.skills && u.skills.length > 0);
  };

  // Once auth is resolved, set initial route
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // If logged in but candidate profile is not complete, direct them to profile setup
        if (!isProfileComplete(user)) {
          if (currentRoute !== 'profile') {
            setCurrentRoute('profile');
          }
        } else if (currentRoute === 'landing') {
          setCurrentRoute('dashboard');
        }
      } else {
        // If logged out and on protected page, move to landing
        if (PROTECTED_ROUTES.has(currentRoute)) {
          setCurrentRoute('landing');
        }
      }
    }
  }, [isAuthenticated, isLoading, user]);

  const navigateTo = (route: string) => {
    // Handle legal center sub-documents (e.g. 'legal:privacy', 'legal:ai-disclaimer')
    if (route.startsWith('legal')) {
      const parts = route.split(':');
      if (parts[1]) {
        setActiveLegalDoc(parts[1]);
      }
      setCurrentRoute('legal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If route is protected and user is not authenticated, open auth modal and preserve intended destination
    if (PROTECTED_ROUTES.has(route) && !isAuthenticated) {
      setPendingRoute(route);
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    // Gate interview practice: candidate must complete profile before starting mock interview practice
    if (isAuthenticated && !isProfileComplete(user) && (route === 'setup' || route === 'interview')) {
      setCurrentRoute('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleStartPreset = (_presetId: string) => {
    if (isAuthenticated && !isProfileComplete(user)) {
      navigateTo('profile');
      return;
    }
    navigateTo('setup');
  };

  const handleStartPracticing = () => {
    if (!isAuthenticated) {
      setPendingRoute('setup');
      setAuthModalMode('signup');
      setIsAuthModalOpen(true);
    } else if (!isProfileComplete(user)) {
      navigateTo('profile');
    } else {
      navigateTo('setup');
    }
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalError(null);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    const currentUser = storage.getUser();
    if (!isProfileComplete(currentUser)) {
      setCurrentRoute('profile');
      setPendingRoute(null);
      return;
    }
    if (pendingRoute) {
      setCurrentRoute(pendingRoute);
      setPendingRoute(null);
    } else {
      setCurrentRoute('dashboard');
    }
  };

  // Render Protected Barrier if unauthenticated user arrives at protected page
  const renderProtectedBarrier = () => {
    const routeTitles: Record<string, string> = {
      dashboard: 'Candidate Dashboard & Analytics',
      academy: 'Interview Academy & Placement Masterclass',
      setup: 'AI Mock Interview Studio',
      interview: 'Live AI Interview Room',
      reports: 'Evaluation & Feedback Reports',
      resume: 'Resume ATS Scanner',
      history: 'Interview Session History',
      profile: 'Personal Candidate Profile',
      settings: 'Security & Preferences'
    };

    const title = routeTitles[currentRoute] || 'Interview Studio';

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-3">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Authenticated Resource</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Sign In Required to Access {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
            Your interview transcripts, resume ATS evaluations, and scores are strictly isolated to your verified account. Sign in or create a free student account to continue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs gradient-button flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
            >
              Create Free Account
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-500">
            <button
              onClick={() => setCurrentRoute('landing')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Return to Landing Page
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Interview Eligibility Barrier for non-degree or unverified users
  const renderInterviewEligibilityBarrier = (eligibility: any) => {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#121826] border border-white/[0.12] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C5F36B]/10 border border-[#C5F36B]/30 flex items-center justify-center text-[#C5F36B]">
            <GraduationCap className="w-8 h-8 text-[#C5F36B]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-[#9AA4B2]">
              <Info className="w-3.5 h-3.5 text-[#C5F36B]" />
              <span>Mock Interview Policy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
              {eligibility.status === 'incomplete' ? 'Candidate Details Verification' : 'AI Mock Interview Access'}
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA4B2] max-w-xl mx-auto leading-relaxed">
              {eligibility.reason}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-2 text-left">
            <button
              type="button"
              onClick={() => navigateTo('academy')}
              className="p-4 rounded-2xl bg-[#0B0F17] border border-white/[0.08] hover:border-[#C5F36B]/40 hover:bg-[#C5F36B]/5 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#C5F36B]/15 text-[#C5F36B] shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#C5F36B]">Interview Academy</div>
                  <div className="text-[10px] text-[#9AA4B2]">Interactive masterclasses & quizzes</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('builder')}
              className="p-4 rounded-2xl bg-[#0B0F17] border border-white/[0.08] hover:border-emerald-400/40 hover:bg-emerald-400/5 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F7FA] group-hover:text-emerald-400">Resume Builder</div>
                  <div className="text-[10px] text-[#9AA4B2]">Stream-tailored resume creator</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('resume')}
              className="p-4 rounded-2xl bg-[#0B0F17] border border-white/[0.08] hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F7FA] group-hover:text-cyan-400">Resume Analyzer</div>
                  <div className="text-[10px] text-[#9AA4B2]">ATS scan & rubric score</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('profile')}
              className="p-4 rounded-2xl bg-[#0B0F17] border border-white/[0.08] hover:border-amber-400/40 hover:bg-amber-400/5 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F7FA] group-hover:text-amber-400">Profile Settings</div>
                  <div className="text-[10px] text-[#9AA4B2]">Update your degree and education</div>
                </div>
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('dashboard')}
              className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA] transition-colors cursor-pointer"
            >
              ← Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render current view
  const renderPage = () => {
    // If route is protected and user is not authenticated, show protected barrier
    if (PROTECTED_ROUTES.has(currentRoute) && !isAuthenticated) {
      return renderProtectedBarrier();
    }

    // If attempting to access mock interview setup or room, verify degree student eligibility
    if ((currentRoute === 'setup' || currentRoute === 'interview') && user) {
      const eligibility = checkInterviewEligibility(user);
      if (!eligibility.isEligible) {
        return renderInterviewEligibilityBarrier(eligibility);
      }
    }

    switch (currentRoute) {
      case 'landing':
        return (
          <LandingPage 
            onStartPracticing={handleStartPracticing} 
            onNavigate={navigateTo} 
          />
        );
      case 'academy':
        return (
          <InterviewAcademy 
            onNavigate={navigateTo} 
            onOpenAuth={handleOpenAuth} 
          />
        );
      case 'setup':
        return (
          <InterviewSetup 
            onStart={() => navigateTo('interview')} 
            onNavigate={navigateTo} 
          />
        );
      case 'interview':
        return (
          <InterviewRoom 
            onComplete={() => navigateTo('reports')} 
            onExit={() => navigateTo('setup')} 
          />
        );
      case 'reports':
        return (
          <FeedbackReportView 
            onStartNew={() => navigateTo('setup')} 
            onNavigate={navigateTo} 
          />
        );
      case 'resume':
        return (
          <ResumeAnalyzer 
            onStartWithResume={() => navigateTo('setup')} 
            onNavigate={navigateTo} 
          />
        );
      case 'history':
        return <HistoryPage onNavigate={navigateTo} />;
      case 'profile':
        return <ProfilePage onNavigate={navigateTo} />;
      case 'pricing':
        return <PricingPage onNavigate={navigateTo} />;
      case 'settings':
        return <SettingsPage onNavigate={navigateTo} />;
      case 'legal':
        return (
          <LegalCenterPage 
            initialDocId={activeLegalDoc} 
            onNavigate={navigateTo} 
          />
        );
      case 'privacy-center':
        return <PrivacyCenterPage onNavigate={navigateTo} />;
      case 'dashboard':
      default:
        return (
          <Dashboard 
            onNavigate={navigateTo} 
            onStartPreset={handleStartPreset} 
          />
        );
    }
  };

  // If in pure landing page mode, full screen interview room mode, or public legal/privacy mode, adjust layout
  const isInterviewRoom = currentRoute === 'interview';
  const isFullWidth = currentRoute === 'landing' || (!isAuthenticated && (currentRoute === 'legal' || currentRoute === 'privacy-center'));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden transition-colors duration-150">
      {/* Active Development Notice Banner */}
      <DevelopmentNoticeBanner onLearnMore={() => navigateTo('legal:terms')} />

      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        onNavigate={navigateTo}
        onOpenAuth={handleOpenAuth}
        currentRoute={currentRoute}
      />

      <div className="flex-1 flex">
        {/* Persistent Desktop & Drawer Mobile Sidebar (Hidden on landing/full-width pages or during live interview room) */}
        {!isFullWidth && !isInterviewRoom && (
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={navigateTo}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main 
          className={`flex-1 transition-all duration-200 ${
            !isFullWidth && !isInterviewRoom ? 'lg:pl-64' : ''
          }`}
        >
          {isLoading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-600 font-medium">Restoring secure session...</p>
            </div>
          ) : (
            renderPage()
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        initialMode={authModalMode}
        initialError={authModalError}
        onNavigate={navigateTo}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthModalError(null);
          setPendingRoute(null);
        }} 
        onSuccess={handleAuthSuccess}
      />


      {/* Intro Animation Before Webapp Starts */}
      {showSplash && (
        <IntroSplashAnimation onComplete={() => setShowSplash(false)} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InterviewProvider>
          <AppContent />
        </InterviewProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
