import { useState } from 'react';
import { TrendingUp, UserCheck, MapPin, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type Tab = 'home' | 'finance' | 'interview' | 'tour';

interface HomeHubProps {
  setActiveTab: (t: Tab) => void;
}

const HomeHub = ({ setActiveTab }: HomeHubProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [step, setStep] = useState<'search' | 'ask_name' | 'options'>('search');
  const [userName, setUserName] = useState('');

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) setStep('ask_name');
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) setStep('options');
  };

  const appOptions = [
    { id: 'finance',   icon: TrendingUp, label: 'Finance AI',  color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'interview', icon: UserCheck,  label: 'Proctor AI',  color: 'text-green-400',  bg: 'bg-green-400/10'  },
    { id: 'tour',      icon: MapPin,     label: 'Rwanda Tour', color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8 md:space-y-12 px-4 py-12">
      <header className="w-full max-w-3xl space-y-4 md:space-y-6">
        <AnimatePresence mode="wait">
          {step === 'search' && (
            <motion.div
              key="search-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="overflow-hidden">
                <motion.div
                  initial={{ height: isFocused ? 'auto' : 0, opacity: isFocused ? 1 : 0 }}
                  animate={{ height: isFocused ? 'auto' : 0, opacity: isFocused ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent mb-2 md:mb-4">
                    UBWENGE SEARCH
                  </h1>
                </motion.div>
                {!isFocused && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h1 className="text-4xl md:text-7xl font-black bg-gradient-to-r from-white via-white to-white/20 bg-clip-text text-transparent mb-4 md:mb-6 leading-tight">
                      UBWENGE<br />HUB
                    </h1>
                    <p className="text-base md:text-xl text-white/40">The unified intelligence engine for Rwanda.</p>
                  </motion.div>
                )}
              </div>

              <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto group">
                <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors w-5 h-5 md:w-6 md:h-6" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Search Rwanda..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-4 md:py-6 pl-12 md:pl-16 pr-24 md:pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-base md:text-xl"
                />
                <button type="submit" className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-400 text-white px-4 md:px-8 py-2 md:py-3 rounded-full font-bold transition-all text-sm md:text-base">
                  Search
                </button>
              </form>
            </motion.div>
          )}

          {step === 'ask_name' && (
            <motion.div
              key="name-step"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass p-8 md:p-12 rounded-3xl max-w-md mx-auto space-y-6"
            >
              <h2 className="text-2xl md:text-3xl font-bold">Welcome to Ubwenge!</h2>
              <p className="text-white/60">Before we proceed, what is your name?</p>
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg"
                />
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-xl font-bold transition-all">
                  Continue
                </button>
              </form>
            </motion.div>
          )}

          {step === 'options' && (
            <motion.div
              key="options-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 md:space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">Hello, {userName}!</h2>
                <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
                  UBWENGE HUB is your all-in-one AI platform. Here is what we have for you today:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
                {appOptions.map((opt, idx) => (
                  <motion.button
                    key={opt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setActiveTab(opt.id as Tab)}
                    className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl flex flex-col items-center text-center space-y-4 hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className={cn('p-4 rounded-2xl transition-transform group-hover:scale-110', opt.bg, opt.color)}>
                      <opt.icon className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold">{opt.label}</h3>
                    <p className="text-xs md:text-sm text-white/40">Open the {opt.label} tool</p>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setStep('search')}
                className="text-white/40 hover:text-white transition-colors text-sm underline underline-offset-4"
              >
                Back to Search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
};

export default HomeHub;
