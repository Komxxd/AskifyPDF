import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Auth = ({ initialMode = true }) => {
   const [isLogin, setIsLogin] = useState(initialMode);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [fullName, setFullName] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      if (isLogin) {
         const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
         });
         if (error) setError(error.message);
      } else {
         const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
               data: { full_name: fullName }
            }
         });
         if (error) setError(error.message);
         else setSuccess(true);
      }
      setLoading(false);
   };

   if (success && !isLogin) {
      return (
         <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center p-4 lg:p-12 font-inter">
            <div className="bg-surface-container w-full max-w-[1100px] h-auto lg:h-[700px] rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
               {/* Left Section: Video Panel */}
               <div className="w-full lg:w-[48%] relative p-4">
                  <div className="w-full h-[300px] lg:h-full relative rounded-[2rem] overflow-hidden">
                     <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover scale-105">
                        <source src="/signinvid.mp4" type="video/mp4" />
                     </video>
                     <div className="absolute inset-0 bg-gradient-to-tr from-[#000000]/40 via-transparent to-transparent z-10" />
                  </div>
               </div>

               {/* Right Section: Success Message */}
               <div className="w-full lg:w-[52%] flex items-center justify-center p-8 lg:p-4">
                  <div className="max-w-[420px] w-full px-4 text-center">
                     <div className="w-20 h-20 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl">
                        <Mail className="text-white w-8 h-8" />
                     </div>
                     <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Check your email</h1>
                     <p className="text-[#94a3b8] text-base font-light mb-12 leading-relaxed">
                        We've sent a verification link to <span className="text-white font-medium">{email}</span>. Please verify your account to access the analyzer.
                     </p>
                     <button
                        onClick={() => { setSuccess(false); setIsLogin(true); }}
                        className="w-full bg-white text-[#000000] font-bold py-5 rounded-xl shadow-[0_10px_40px_-10px_rgba(255,255,255,0.2)] hover:bg-[#f1f1f1] transition-all"
                     >
                        Back to Sign In
                     </button>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center p-4 lg:p-12 font-inter selection:bg-primary-cobalt selection:text-white">

         {/* Main Container mirroring the image layout */}
         <div className="bg-surface-container w-full max-w-[1100px] h-auto lg:h-[700px] rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">

            {/* Left Section: Video Panel */}
            <div className="w-full lg:w-[48%] relative p-4">
               <div className="w-full h-[300px] lg:h-full relative rounded-[2rem] overflow-hidden">
                  <video
                     autoPlay
                     loop
                     muted
                     playsInline
                     key="auth-video"
                     className="absolute inset-0 w-full h-full object-cover scale-105"
                  >
                     <source src="/signinvid.mp4" type="video/mp4" />
                  </video>

                  {/* Overlay with Satoshi typography - No Stars */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#000000]/60 via-transparent to-transparent z-10 p-10 flex flex-col justify-end">
                     <div className="max-w-sm">
                        <p className="text-white/40 text-xs mb-4 font-inter uppercase tracking-[0.3em]">Institutional Grade</p>
                        <h2 className="text-4xl font-bold font-inter leading-tight text-white mb-6">
                           The future of research starts with AskifyPDF.
                        </h2>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Section: Form area mirroring image but in dark/lightened mode */}
            <div className="w-full lg:w-[52%] flex items-center justify-center p-8 lg:p-4">
               <div className="max-w-[420px] w-full px-4">

                  {/* Image-style Header - No Star or Dot as per request */}
                  <div className="mb-12">
                     {/* Empty space to match spacing */}
                  </div>

                  <h1 className="text-3xl font-bold text-white mb-1.5 tracking-tight">
                     {isLogin ? 'Welcome back' : 'Create an account'}
                  </h1>
                  <p className="text-[#94a3b8] text-sm font-light mb-8 leading-relaxed">
                     Your knowledge base is waiting.
                  </p>

                  {error && (
                     <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-8 text-center animate-shake">
                        {error}
                     </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                     {!isLogin && (
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-semibold text-white/40 ml-1 uppercase tracking-[0.1em]">Full name</label>
                           <div className="relative">
                              <input
                                 type="text"
                                 placeholder="Enter your name"
                                 className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all placeholder:text-[#475569]"
                                 value={fullName}
                                 onChange={(e) => setFullName(e.target.value)}
                                 required
                              />
                           </div>
                        </div>
                     )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-white/40 ml-1 uppercase tracking-[0.1em]">Email address</label>
                        <div className="relative">
                           <input
                              type="email"
                              placeholder="name@example.com"
                              className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all placeholder:text-[#475569]"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                           />
                        </div>
                     </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                           <label className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em]">Password</label>
                           {isLogin && <button type="button" className="text-white text-[10px] hover:underline font-medium">Forgot?</button>}
                        </div>
                        <div className="relative group">
                           <input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all placeholder:text-[#475569]"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                           />
                           <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8] transition-colors"
                           >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                           </button>
                        </div>
                     </div>

                      <button
                         type="submit"
                         disabled={loading}
                         className="w-full bg-white text-[#000000] font-bold py-3.5 rounded-xl shadow-[0_10px_40px_-10px_rgba(255,255,255,0.2)] hover:bg-[#f1f1f1] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-2 text-center items-center justify-center flex space-x-2"
                      >
                         <span className="text-[10px] uppercase tracking-[0.2em] font-black">{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Get Started')}</span>
                         <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                  </form>

                  <div className="mt-10 text-center">
                     <p className="text-[#94a3b8] text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                           onClick={() => setIsLogin(!isLogin)}
                           className="text-white font-bold ml-2 hover:underline"
                        >
                           {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                     </p>
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
};

export default Auth;
