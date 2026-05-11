'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Globe, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import { useLogin } from '@/lib/hooks/use-auth';

interface LoginViewProps {
  onLogin: (user: any) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast.error('Login Failed', 'Please provide valid credentials.');
      return;
    }
    login.mutate({ email, password }, {
      onSuccess: () => onLogin({}),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#000] overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Video Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-60"
        >
          <source src="/login_bg.mp4" type="video/mp4" />
          {/* Fallback to simulated shapes if video fails */}
        </video>
        {/* Overlay to ensure readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Dynamic 3D Background Atmosphere (Simulated Fallback/Layer) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        {/* Deep Space Base */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0a0b1e_0%,#000000_100%)]" />
        
        {/* Animated Network Grid */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }} 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-100" />

        {/* Floating Glass Geometry (Inspired by Video) */}
        <div className="absolute inset-0">
          {/* Icosahedron-like shape */}
          <GlassShape 
            className="top-[15%] left-[10%] w-56 h-56"
            animate={{ 
              y: [0, -40, 0],
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            duration={25}
            type="icosa"
          />
          
          {/* Sphere */}
          <GlassShape 
            className="top-[5%] right-[15%] w-72 h-72"
            animate={{ 
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1]
            }}
            duration={30}
            type="sphere"
          />

          {/* Prism / Rectangle */}
          <GlassShape 
            className="bottom-[10%] left-[15%] w-40 h-80"
            animate={{ 
              rotate: [-15, 15, -15],
              y: [0, 60, 0]
            }}
            duration={22}
            type="prism"
          />

          {/* Pyramid / Triangle (New) */}
          <GlassShape 
            className="bottom-[20%] right-[15%] w-60 h-60"
            animate={{ 
              rotate: [360, 0],
              x: [0, -30, 0],
              y: [0, -20, 0]
            }}
            duration={35}
            type="pyramid"
          />

          {/* Extra Background Atmosphere */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

          {/* Small Bubbles / Bokeh */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                x: [0, (i % 2 === 0 ? 30 : -30), 0],
                y: [0, (i % 3 === 0 ? 20 : -40), 0],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ 
                duration: 10 + i * 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className={cn(
                "absolute rounded-full bg-blue-500/10 blur-3xl",
                i === 0 && "top-[40%] right-[30%] w-32 h-32",
                i === 1 && "bottom-[30%] left-[40%] w-48 h-48",
                i === 2 && "top-[15%] left-[50%] w-24 h-24",
                i === 3 && "bottom-[10%] right-[10%] w-64 h-64",
                i === 4 && "top-1/2 left-1/4 w-40 h-40",
                i === 5 && "bottom-1/4 right-1/3 w-36 h-36"
              )}
            />
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[900px] px-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-16 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-white flex items-center justify-center text-black font-display font-black text-3xl tracking-tighter shadow-[0_0_40px_rgba(255,255,255,0.3)] rounded-none">
              L
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-display font-black text-white tracking-[0.15em] uppercase leading-none">LEVELUP</h1>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] mt-1.5">ECOMMERCE OS</p>
            </div>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-medium text-white tracking-tight"
          >
            Direct Login
          </motion.h2>
        </div>

        {/* Cinematic Form Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] bg-white/[0.02] backdrop-blur-[80px] border border-white/[0.08] rounded-[3.5rem] overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.8)]"
        >
          {/* Left Column: Form */}
          <div className="p-16 border-b md:border-b-0 md:border-r border-white/5">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-8">
                {/* Email Field */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Business Identity</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-500 transition-all duration-500">
                      <Mail size={18} strokeWidth={1.5} />
                    </div>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@hiepnguyen.io"
                      className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-2xl pl-16 pr-6 text-sm font-bold text-white outline-none focus:bg-white/[0.06] focus:border-white/20 transition-all placeholder:text-white/5 tracking-tight"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <div className="flex justify-between ml-1">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Secret Key</label>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-500 transition-all duration-500">
                      <Lock size={18} strokeWidth={1.5} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-2xl pl-16 pr-16 text-sm font-bold text-white outline-none focus:bg-white/[0.06] focus:border-white/20 transition-all placeholder:text-white/5 tracking-tight"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-all p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={login.isPending}
                  className="w-full h-16 bg-white text-black text-[12px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-2xl relative overflow-hidden group transition-all active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-blue-600 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 rounded-none" />
                  <div className="relative flex items-center justify-center h-full group-hover:text-white transition-colors duration-500">
                    {login.isPending ? (
                      <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                          <motion.div 
                            key={i} 
                            animate={{ opacity: [0.3, 1, 0.3] }} 
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-2 h-2 rounded-full bg-current" 
                          />
                        ))}
                      </div>
                    ) : "Establish Access"}
                  </div>
                </button>
                <div className="mt-8 flex items-center justify-center gap-2 group cursor-pointer">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                   <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] group-hover:text-white/50 transition-colors">
                     Trouble logging in? <span className="underline decoration-white/10">Contact Support</span>
                   </p>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Identity Nodes */}
          <div className="bg-white/[0.01] p-12 flex flex-col justify-between space-y-12">
            <div className="space-y-8">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Access Nodes</label>
              
              <div className="space-y-4">
                {[
                  { name: 'Google Workspace', icon: 'https://www.google.com/favicon.ico' },
                  { name: 'Github Enterprise', icon: 'https://github.com/favicon.ico' },
                  { name: 'Microsoft One', icon: 'https://www.microsoft.com/favicon.ico' }
                ].map((social) => (
                  <button 
                    key={social.name}
                    type="button"
                    className="w-full h-16 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/10 rounded-2xl flex items-center px-6 gap-5 transition-all group shadow-sm"
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0 relative">
                      <Image 
                        src={social.icon} 
                        alt={social.name} 
                        fill
                        className="opacity-30 group-hover:opacity-100 transition-all grayscale group-hover:grayscale-0 scale-90 group-hover:scale-100 object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-white/30 group-hover:text-white transition-colors tracking-tight">Login with {social.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/20 group-hover:text-blue-500 transition-all">
                  <Sparkles size={18} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Master Key</span>
                  <span className="text-[11px] font-bold text-white/20 group-hover:text-white transition-colors mt-0.5">Initialize Biometrics</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/20 group-hover:text-blue-500 transition-all">
                  <Globe size={18} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Status</span>
                  <span className="text-[11px] font-bold text-white/20 group-hover:text-white transition-colors mt-0.5">Nodes Connected: 124</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer System Meta */}
      <div className="fixed bottom-12 left-12 right-12 flex justify-between pointer-events-none opacity-[0.15]">
        <div className="text-[10px] font-black text-white uppercase tracking-[0.5em] space-y-2">
          <p>STATION_ID: HF-345-21</p>
          <p className="max-w-[200px] leading-relaxed">QUANTUM_SECURE_ACCESS_POINT_CONNECTED</p>
        </div>
        <div className="text-[10px] font-black text-white uppercase tracking-[0.5em] text-right space-y-2">
          <p>TIMESTAMP: {new Date().getFullYear()}.05.08</p>
          <p className="max-w-[200px] leading-relaxed">SYSTEM_VERSION: OS_v2.41_LEVELUP</p>
        </div>
      </div>
    </div>
  );
}

function GlassShape({ className, animate, duration, type }: { className?: string, animate: any, duration: number, type: 'icosa' | 'sphere' | 'prism' | 'pyramid' }) {
  return (
    <motion.div
      animate={animate}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      className={cn("absolute", className)}
    >
      <div className="relative w-full h-full">
        {/* Main Glass Body */}
        <div className={cn(
          "absolute inset-0 backdrop-blur-3xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
          type === 'sphere' ? "rounded-full" : "rounded-[2rem]",
          type === 'prism' ? "skew-x-2" : "",
          type === 'pyramid' ? "clip-path-pyramid" : ""
        )} 
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
          clipPath: type === 'pyramid' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined
        }}
        />
        
        {/* Dynamic Inner Glow */}
        <div className={cn(
          "absolute inset-[5%] bg-gradient-to-br from-blue-500/10 to-transparent opacity-40",
          type === 'sphere' ? "rounded-full" : "rounded-[1.5rem]",
          type === 'pyramid' ? "clip-path-pyramid" : ""
        )} 
        style={{
          clipPath: type === 'pyramid' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined
        }}
        />
        
        {/* Highlights */}
        <div className="absolute top-2 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-4 left-2 top-2 w-px bg-gradient-to-b from-white/10 to-transparent" />
        
        {/* Extra geometry for Icosahedron feel */}
        {type === 'icosa' && (
          <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
            <div className="absolute inset-0 bg-[linear-gradient(30deg,rgba(255,255,255,0.03)_50%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(255,255,255,0.03)_50%,transparent_50%)]" />
            <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: 'radial-gradient(circle at 50% 50%, #fff 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
