import { Home, TrendingUp, UserCheck, MapPin, Moon, Sun, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

type Tab = 'home' | 'finance' | 'interview' | 'tour';

interface NavigationRailProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  isFolded: boolean;
  setIsFolded: (f: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (d: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (o: boolean) => void;
}

const NavigationRail = ({
  activeTab, setActiveTab, isFolded, setIsFolded,
  isDarkMode, setIsDarkMode, mobileMenuOpen, setMobileMenuOpen
}: NavigationRailProps) => {
  const items = [
    { id: 'home',      icon: Home,      label: 'Home'      },
    { id: 'finance',   icon: TrendingUp, label: 'Finance'  },
    { id: 'interview', icon: UserCheck,  label: 'Proctor AI'},
    { id: 'tour',      icon: MapPin,     label: 'Tour'     },
  ];

  return (
    <>
      {/* Desktop Sidebar & Mobile Drawer */}
      <div className={cn(
        'fixed left-0 top-0 h-screen glass border-r border-white/10 flex-col py-8 z-50 transition-all duration-300 flex',
        isFolded ? 'w-20' : 'w-64',
        'md:flex',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        !isDarkMode && 'bg-white/80 border-black/10 shadow-xl'
      )}>
        <div className="px-6 mb-12 flex items-center justify-between">
          <button
            onClick={() => setIsFolded(!isFolded)}
            className="flex items-center gap-3 overflow-hidden hover:scale-105 transition-transform"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 text-white">U</div>
            {!isFolded && (
              <span className={cn('font-bold text-xl tracking-tight whitespace-nowrap', !isDarkMode ? 'text-slate-900' : 'text-white')}>
                UBWENGE HUB
              </span>
            )}
          </button>
          <button
            onClick={() => { setIsFolded(!isFolded); if (window.innerWidth < 768) setMobileMenuOpen(false); }}
            className={cn('p-2 hover:bg-white/5 rounded-lg', !isDarkMode ? 'text-slate-400 hover:bg-black/5' : 'text-white/50')}
          >
            {isFolded ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as Tab); if (window.innerWidth < 768) setMobileMenuOpen(false); }}
              title={isFolded ? item.label : ''}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group',
                activeTab === item.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className={cn('w-6 h-6 shrink-0', activeTab === item.id ? 'text-blue-400' : 'group-hover:scale-110 transition-transform')} />
              {!isFolded && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-4 mt-auto">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-white/50 hover:bg-white/5 transition-all"
          >
            {isDarkMode ? <Sun className="w-6 h-6 shrink-0" /> : <Moon className="w-6 h-6 shrink-0" />}
            {!isFolded && <span className="whitespace-nowrap">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/10 z-50 flex items-center justify-around px-4 pb-safe">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={cn('flex flex-col items-center gap-1 p-2 rounded-xl transition-all', activeTab === item.id ? 'text-blue-400' : 'text-white/40')}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default NavigationRail;
