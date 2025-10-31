

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import ServicesPage from './components/ServicesPage';
import ToolkitPage from './components/ToolkitPage';
import AuthModal from './components/AuthModal';
import AudioPlayer from './components/AudioPlayer';
import { MoonIcon, WandSparklesIcon, LogInIcon, LogOutIcon, TwitterIcon, InstagramIcon, TiktokIcon } from './components/Icons';
import type { User } from './types';

type ActiveView = 'services' | 'toolkit';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('services');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const parallaxY = useTransform(scrollYProgress, [0, 0.25, 1], ["0%", "15%", "25%"]);

  useEffect(() => {
    // Check for a logged-in user in session storage
    const loggedInUser = sessionStorage.getItem('enigmaUser');
    if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('enigmaUser');
    // If on toolkit page when logging out, switch back to services
    if (activeView === 'toolkit') {
      setActiveView('services');
    }
  };
  
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('enigmaUser', JSON.stringify(user));
    setShowAuthModal(false);
    // If user is an admin, automatically switch to the toolkit view
    if (user.role === 'admin') {
      setActiveView('toolkit');
    }
  }

  const handleNavigateToToolkit = () => {
    if (currentUser?.role === 'admin') {
      setActiveView('toolkit');
    } else {
      setShowAuthModal(true);
    }
  };

  const NavButton: React.FC<{
    view: ActiveView;
    label: string;
    icon: React.ReactNode;
  }> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`relative flex items-center justify-center w-full md:w-auto px-6 py-3 font-fancy text-lg font-bold rounded-lg transition-colors duration-300
        ${activeView === view
          ? 'text-white'
          : 'text-gray-400 hover:text-white'
        }`}
    >
      <span className="relative z-10 flex items-center">{icon}{label}</span>
      {activeView === view && (
        <motion.div
          layoutId="active-nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
    </button>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-transparent text-gray-200 isolate flex flex-col">
       <motion.div 
         className="fixed inset-0 bg-cover bg-center z-[-1]"
         style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27100%25%27%20height%3D%27100%25%27%3E%3Cfilter%20id%3D%27n%27%20x%3D%270%27%20y%3D%270%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.7%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27/%3E%3C/filter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url%28%23n%29%27%20opacity%3D%270.04%27/%3E%3C/svg%3E")',
           y: parallaxY
         }}
       />
      <div className="container mx-auto p-4 sm:p-6 md:p-8 relative flex-grow">
        <header className="sticky top-4 z-40 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left mb-6 md:mb-8 gap-4 bg-gray-900/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg shadow-black/20">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-fancy">
              The Enigma Channel
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <AudioPlayer />
            {currentUser ? (
              <>
                <span className="text-purple-300 hidden sm:block">Welcome, {currentUser.email.split('@')[0]}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="font-fancy font-bold bg-gray-800/50 text-purple-300 py-2 px-4 rounded-full shadow-lg hover:shadow-purple-500/20 hover:bg-purple-900/50 transition-all duration-300 ease-in-out flex items-center flex-shrink-0 border border-white/10"
                >
                  <LogOutIcon className="w-5 h-5 mr-2" />
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                 <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="font-fancy font-bold bg-gray-800/50 text-purple-300 py-2 px-4 rounded-full shadow-lg hover:shadow-purple-500/20 hover:bg-purple-900/50 transition-all duration-300 ease-in-out flex items-center flex-shrink-0 border border-white/10"
                >
                  <LogInIcon className="w-5 h-5 mr-2" />
                  Login / Sign Up
                </motion.button>
              </>
            )}
          </div>
        </header>

        <nav className="flex flex-col md:flex-row justify-center items-center mb-8 gap-2 md:gap-0">
            <NavButton view="services" label="Services" icon={<MoonIcon className="w-5 h-5 mr-3" />} />
            {currentUser?.role === 'admin' && (
              <NavButton view="toolkit" label="Creator Toolkit" icon={<WandSparklesIcon className="w-5 h-5 mr-3" />} />
            )}
        </nav>

        <main className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeView === 'services' && <ServicesPage key="services" onNavigateToToolkit={handleNavigateToToolkit} />}
            {activeView === 'toolkit' && currentUser?.role === 'admin' && <ToolkitPage key="toolkit" />}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>
      
      <footer className="w-full text-center p-6 mt-auto text-gray-500 text-sm border-t border-purple-500/10">
        <div className="flex justify-center gap-6 mb-4">
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-sky-400 transition-colors">
            <TwitterIcon className="w-6 h-6" />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-pink-400 transition-colors">
            <InstagramIcon className="w-6 h-6" />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-400 hover:text-cyan-300 transition-colors">
            <TiktokIcon className="w-6 h-6" />
          </a>
        </div>
        <p className="max-w-2xl mx-auto mb-2">
          © {new Date().getFullYear()} The Enigma Channel. All rights reserved.
        </p>
        <p className="max-w-2xl mx-auto text-xs text-gray-600">
          Disclaimer: All services, including AI-generated content, are for entertainment purposes only. The Enigma Channel is not responsible for any decisions made based on readings or generated content.
        </p>
      </footer>
    </div>
  );
};

export default App;