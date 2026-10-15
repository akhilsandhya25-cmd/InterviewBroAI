import React, { useState, useEffect } from 'react';
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
import { IntroSplashAnimation } from './components/IntroSplashAnimation';
import { Shield, Lock, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { BrandIcon } from './components/brand/BrandIcon';

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

  // Navigation route: 'landing' | 'dashboard' | 'setup' | 'interview' | 'reports' | 'resume' | 'history' | 'profile' | 'pricing' | 'settings'
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  // Once auth is resolved, set initial route
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // If logged in and on landing page, move to dashboard
        if (currentRoute === 'landing') {
          setCurrentRoute('dashboard');
        }
      } else {
        // If logged out and on protected page, move to landing
        if (PROTECTED_ROUTES.has(currentRoute)) {
          setCurrentRoute('landing');
        }
      }
    }
  }, [isAuthenticated, isLoading]);

  const navigateTo = (route: string) => {
    // If route is protected and user is not authenticated, open auth modal and preserve intended destination
    if (PROTECTED_ROUTES.has(route) && !isAuthenticated) {
      setPendingRoute(route);
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartPreset = (_presetId: string) => {
    navigateTo('setup');
  };

  const handleStartPracticing = () => {
    if (!isAuthenticated) {
      setPendingRoute('setup');
      setAuthModalMode('signup');
      setIsAuthModalOpen(true);
    } else {
      navigateTo('setup');
    }
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
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
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0c111c] border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 text-xs font-semibold mb-3">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Authenticated Resource</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Sign In Required to Access {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
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
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
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

  // Render current view
  const renderPage = () => {
    // If route is protected and user is not authenticated, show protected barrier
    if (PROTECTED_ROUTES.has(currentRoute) && !isAuthenticated) {
      return renderProtectedBarrier();
    }

    switch (currentRoute) {
      case 'landing':
        return (
          <LandingPage 
            onStartPracticing={handleStartPracticing} 
            onNavigate={navigateTo} 
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
        return <ProfilePage />;
      case 'pricing':
        return <PricingPage onNavigate={navigateTo} />;
      case 'settings':
        return <SettingsPage />;
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

  // If in pure landing page mode or full screen interview room mode, adjust layout
  const isInterviewRoom = currentRoute === 'interview';
  const isLanding = currentRoute === 'landing';

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        onNavigate={navigateTo}
        onOpenAuth={handleOpenAuth}
        currentRoute={currentRoute}
      />

      <div className="flex-1 flex">
        {/* Persistent Desktop & Drawer Mobile Sidebar (Hidden on landing page or during live interview room) */}
        {!isLanding && !isInterviewRoom && (
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
            !isLanding && !isInterviewRoom ? 'lg:pl-64' : ''
          }`}
        >
          {isLoading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Restoring secure session...</p>
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
        onClose={() => {
          setIsAuthModalOpen(false);
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
    <AuthProvider>
      <InterviewProvider>
        <AppContent />
      </InterviewProvider>
    </AuthProvider>
  );
};

export default App;
