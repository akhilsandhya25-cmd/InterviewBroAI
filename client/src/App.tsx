import React, { useState } from 'react';
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

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { activeReport } = useInterview();

  // Navigation route: 'landing' | 'dashboard' | 'setup' | 'interview' | 'reports' | 'resume' | 'history' | 'profile' | 'pricing' | 'settings'
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartPreset = (presetId: string) => {
    navigateTo('setup');
  };

  const handleStartPracticing = () => {
    navigateTo('setup');
  };

  // Render current view
  const renderPage = () => {
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
          {renderPage()}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
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
