import React from 'react';
import { FileText } from 'lucide-react';
import landingImg from '../../assets/landingpageimg.png';

const LandingPage = ({ onAuthClick }) => {
  return (
    <div className="min-h-screen bg-black text-white font-inter overflow-hidden selection:bg-primary-cobalt selection:text-white">
      {/* Navigation - Transparent */}
      <nav className="fixed top-0 w-full z-50 px-10 py-10 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-white/40" />
          <span className="text-xl font-bold tracking-tighter uppercase italic font-inter text-white">AskifyPDF</span>
        </div>
        <div className="flex items-center gap-8">
          <button
            onClick={() => onAuthClick('login')}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onAuthClick('signup')}
            className="bg-white text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#f1f1f1] transition-all transform hover:scale-105 active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center px-10 overflow-hidden">
        {/* Abstract Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={landingImg}
            alt="AskifyPDF Backdrop"
            className="w-full h-full object-cover opacity-90 animate-slowZoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black z-10" />
        </div>

        <div className="relative z-20 text-center max-w-4xl">
          <h1 className="text-5xl lg:text-7xl font-black font-inter leading-tight tracking-tighter mb-8 animate-fadeInUp uppercase italic">
            Clarity for your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 border-b-4 border-primary-cobalt">Research</span>
          </h1>

          <p className="text-base lg:text-lg text-white/40 font-light max-w-2xl mx-auto leading-relaxed animate-fadeInUp delay-100 italic">
            A grounded PDF analyzer that answers your questions strictly from the document. Verify evidence with visual highlights and minimize hallucination.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
