import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';
import NavigationRail from './components/NavigationRail';
import HomeHub        from './components/HomeHub';
import FinanceAI      from './components/FinanceAI';
import ProctorAI      from './components/ProctorAI';
import RwandaTour     from './components/RwandaTour';

type Tab = 'home' | 'finance' | 'interview' | 'tour';

export default function App() {
  const [activeTab,      setActiveTab]      = useState<Tab>('home');
  const [isFolded,       setIsFolded]       = useState(true);
  const [isDarkMode,     setIsDarkMode]     = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-500 flex flex-col md:flex-row',
      isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'
    )}>
      {/* Mobile Top Header */}
      <div className={cn(
        'md:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-white/10 z-40 flex items-center px-6',
        !isDarkMode && 'bg-white/80 border-black/10'
      )}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg mr-3 hover:scale-110 transition-transform text-white"
        >
          U
        </button>
        <span className={cn('font-bold text-lg tracking-widest uppercase', !isDarkMode ? 'text-slate-900' : 'text-white')}>
          UBWENGE HUB
        </span>
      </div>

      <NavigationRail
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isFolded={isFolded}
        setIsFolded={setIsFolded}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className={cn(
        'flex-1 p-4 md:p-12 overflow-y-auto transition-all duration-300 pb-24 md:pb-12 pt-20 md:pt-12',
        isFolded ? 'md:ml-20' : 'md:ml-64'
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home'      && <HomeHub setActiveTab={setActiveTab} />}
            {activeTab === 'finance'   && <FinanceAI />}
            {activeTab === 'interview' && <ProctorAI />}
            {activeTab === 'tour'      && <RwandaTour />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
