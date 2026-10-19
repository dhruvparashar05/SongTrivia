import React, { useState } from 'react';
import { Skull, Trophy, Play, BookOpen, ShieldAlert, Menu, X, User, Cloud, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  participant, 
  onOpenRules,
  gameStatus = 'waiting' 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getStatusBadge = () => {
    switch (gameStatus) {
      case 'active':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950 text-red-400 border border-red-700/80 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            LIVE EVENT
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-700/80">
            PAUSED
          </span>
        );
      case 'ended':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-700">
            EVENT ENDED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-800">
            LOBBY OPEN
          </span>
        );
    }
  };

  const navItems = [
    { id: 'landing', label: 'Home', icon: Skull },
    { id: 'game', label: 'Trivia Arena', icon: Play },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'admin', label: 'Organizer Portal', icon: ShieldAlert },
  ];

  const handleNav = (viewId) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080c]/90 border-b border-red-950/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNav('landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-900 to-black border border-red-600/60 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] group-hover:shadow-[0_0_22px_rgba(220,38,38,0.8)] transition-all">
            <span className="text-xl">🩸</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-cinzel font-black tracking-widest text-zinc-100 group-hover:text-red-400 transition-colors">
                HORROR SONG TRIVIA
              </span>
              <span className="hidden sm:inline-block">
                {getStatusBadge()}
              </span>
            </div>
            <p className="text-[10px] tracking-wider font-mono text-red-500/80 hidden sm:block">
              RECOGNIZE THE TUNE. SURVIVE THE NIGHT.
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-950/80 text-red-400 border border-red-800/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-zinc-500" />
            <span>Rules</span>
          </button>
        </nav>

        {/* Right Info: Participant Pill & Mode Indicator */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Storage / Connection Mode Badge */}
          <div 
            title={isSupabaseConfigured ? "Connected to Supabase Cloud Database" : "Using Local In-Browser Horror Engine (No Cloud Configured)"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${
              isSupabaseConfigured 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            {isSupabaseConfigured ? (
              <>
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>Supabase Live</span>
              </>
            ) : (
              <>
                <Database className="w-3 h-3 text-zinc-400" />
                <span>Local Engine</span>
              </>
            )}
          </div>

          {/* Participant status */}
          {participant ? (
            <div 
              onClick={() => handleNav('game')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-red-950 hover:border-red-900 text-xs cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-red-950 text-red-400 flex items-center justify-center font-bold text-[10px]">
                <User className="w-3 h-3" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-zinc-200 max-w-[120px] truncate">{participant.name}</span>
                <span className="text-[10px] text-red-400 font-mono">{participant.total_score || 0} pts</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleNav('game')}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all cursor-pointer"
            >
              REGISTER
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <span className="sm:hidden">
            {getStatusBadge()}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-900 bg-[#0c0c12]/95 backdrop-blur-xl px-4 py-4 space-y-2">
          {participant && (
            <div className="p-3 mb-3 rounded-xl bg-zinc-950 border border-red-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-sm text-zinc-200">{participant.name}</span>
              </div>
              <span className="text-xs font-mono font-bold text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded border border-red-800">
                {participant.total_score || 0} PTS
              </span>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-red-950/90 text-red-400 border border-red-800/80'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }`}
              >
                <Icon className="w-5 h-5 text-red-500" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              onOpenRules();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
          >
            <BookOpen className="w-5 h-5 text-zinc-500" />
            <span>Survival Rules</span>
          </button>
        </div>
      )}
    </header>
  );
}
