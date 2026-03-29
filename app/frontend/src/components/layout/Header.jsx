import React from 'react';
import { LogOut, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Header = () => {
  return (
    <div className="w-full flex justify-center pt-6 px-10">
      <header className="w-full max-w-[1550px] h-16 bg-surface-container/40 backdrop-blur-3xl border border-white/5 rounded-2xl px-8 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 group cursor-pointer">
            <FileText className="w-5 h-5 text-white/40" />
            <h1 className="text-xl font-black font-inter tracking-tight text-white uppercase italic">
              AskifyPDF<span className="text-white/40 not-italic">.</span>
            </h1>
          </div>

          <nav className="flex items-center gap-6 ml-2">
            <div className="h-3 w-px bg-white/10"></div>
            <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-white underline decoration-white/10 underline-offset-4">Analyzer</span>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => supabase.auth.signOut()}
            className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-white/20 hover:text-white group transition-all"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>
    </div>
  );
};

export default Header;
