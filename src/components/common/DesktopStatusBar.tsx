import React, { useState, useEffect } from 'react';
import { NavModule } from './ERPLayout';
import { ShieldCheck, HardDrive, Keyboard, Calendar, User } from 'lucide-react';
import { AuthUser } from '../../services/auth';

interface DesktopStatusBarProps {
  activeModule: NavModule;
  currentUser?: AuthUser | null;
}

export const DesktopStatusBar: React.FC<DesktopStatusBarProps> = ({
  activeModule,
  currentUser
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatModuleName = (mod: NavModule): string => {
    return mod.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-[11px] font-mono border-t border-slate-800 h-7 px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left info */}
      <div className="flex items-center gap-3 overflow-x-auto py-0.5">
        <span className="flex items-center gap-1.5 text-slate-200 font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          MODULE: <span className="text-indigo-400">{formatModuleName(activeModule)}</span>
        </span>
        <span className="text-slate-700">|</span>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('erp-open-shortcut-help'))}
          className="hidden md:flex items-center gap-1 text-slate-300 shrink-0 hover:text-white cursor-pointer transition-colors"
          title="Click or press Ctrl+/ to view all ERP Keyboard Shortcuts"
        >
          <Keyboard className="w-3 h-3 text-amber-400" />
          <span className="text-slate-400">SHORTCUTS:</span> 
          <span className="bg-slate-800 px-1 rounded text-amber-300 font-bold border border-slate-700">F2</span> Find
          <span className="bg-slate-800 px-1 rounded text-amber-300 font-bold border border-slate-700 ml-1">F3</span> New
          <span className="bg-slate-800 px-1 rounded text-amber-300 font-bold border border-slate-700 ml-1">F5</span> Refresh
          <span className="bg-slate-800 px-1 rounded text-amber-300 font-bold border border-slate-700 ml-1">F9</span> Save
          <span className="bg-slate-800 px-1 rounded text-amber-300 font-bold border border-slate-700 ml-1">Ctrl+/</span> Help
        </button>
      </div>

      {/* Right info */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden lg:flex items-center gap-1 text-slate-400">
          <HardDrive className="w-3 h-3 text-emerald-400" />
          Local Storage: <span className="text-emerald-400 font-bold">ACTIVE</span>
        </span>
        <span className="text-slate-800 hidden sm:inline">|</span>
        <span className="flex items-center gap-1 text-slate-300">
          <User className="w-3 h-3 text-indigo-400" />
          {currentUser?.name || 'Administrator'}
        </span>
        <span className="text-slate-800 hidden sm:inline">|</span>
        <span className="text-slate-300 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          {timeStr}
        </span>
      </div>
    </footer>
  );
};
