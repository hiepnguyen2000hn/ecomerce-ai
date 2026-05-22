'use client';

import React from 'react';
import { Sparkles, RefreshCw, Settings2, Send } from 'lucide-react';

export function EditorSidebar() {
  return (
    <div className="w-96 bg-white dark:bg-[#0c0c0c] border-l border-gray-100 dark:border-white/5 flex flex-col shrink-0">
      <div className="p-8 space-y-10 overflow-y-auto flex-1 no-scrollbar">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-indigo-600" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">AI Optimizer</h4>
          </div>

          <div className="p-6 bg-indigo-50 dark:bg-indigo-600/5 rounded-[2rem] border border-indigo-100 dark:border-indigo-600/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-600" />
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">CVR Insight</p>
            </div>
            <p className="text-xs font-bold leading-relaxed text-indigo-950 dark:text-indigo-200">
              Dựa trên <span className="text-indigo-600 dark:text-indigo-400 font-black">CVR 4.8%</span>, hãy tập trung vào{' '}
              <span className="underline decoration-indigo-600 text-indigo-600 dark:text-indigo-400 font-black">Tốc độ phục hồi</span>.
            </p>
            <button className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all">
              <RefreshCw size={14} />
              Rewrite with AI
            </button>
          </div>
        </div>

        <div className="space-y-6 pt-10 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <Settings2 size={18} className="text-gray-400" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">AI Editor</h4>
          </div>

          <div className="relative group">
            <textarea
              placeholder="Which content do you want to update?"
              className="w-full h-40 bg-gray-50 dark:bg-white/5 rounded-3xl p-6 text-sm font-bold border border-transparent focus:border-indigo-600 transition-all outline-none resize-none no-scrollbar placeholder:text-gray-300"
            />
            <button className="absolute bottom-4 right-4 w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center opacity-0 group-focus-within:opacity-100 transition-opacity">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-gray-100 dark:border-white/5">
        <button className="w-full py-6 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-black/10">
          <Settings2 size={18} />
          Section Settings
        </button>
      </div>
    </div>
  );
}
