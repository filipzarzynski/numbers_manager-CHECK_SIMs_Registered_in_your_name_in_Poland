import React from 'react';
import { ShieldCheck, Database, HardDriveDownload, FileText, Clock, Smartphone, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: 'generator' | 'tracker' | 'inventory' | 'knowledge';
  setActiveTab: (tab: 'generator' | 'tracker' | 'inventory' | 'knowledge') => void;
  onOpenBackup: () => void;
  sentCount: number;
  discoveredCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBackup,
  sentCount,
  discoveredCount
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo i Tytuł */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">TelcoAudit</span>
                <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Pro MVP
                </span>
              </div>
              <p className="text-xs text-slate-400">Audyt Kart SIM & Generator RODO Art. 15</p>
            </div>
          </div>

          {/* Nawigacja */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'generator'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Wnioskomat RODO</span>
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition relative ${
                activeTab === 'tracker'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Monitoring SLA (30 dni)</span>
              {sentCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-xs rounded-full bg-emerald-500 text-slate-950 font-bold">
                  {sentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition relative ${
                activeTab === 'inventory'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Ewidencja Numerów</span>
              {discoveredCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-xs rounded-full bg-teal-500 text-slate-950 font-bold">
                  {discoveredCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'knowledge'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Baza Wiedzy & Odzyskiwanie</span>
            </button>
          </nav>

          {/* Trust Badge & Kopia */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">Zero-Knowledge:</span>
              <span className="text-emerald-400/80">PII offline w Twojej przeglądarce</span>
            </div>

            <button
              onClick={onOpenBackup}
              title="Kopia zapasowa danych JSON"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kopia JSON</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
