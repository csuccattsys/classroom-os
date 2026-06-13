import React, { useState } from 'react'
import { 
  Calendar, CheckCircle, ShieldCheck, KeyRound, Mail, 
  AlertCircle, Loader2, Info, LayoutDashboard, Globe,
  Clock, MapPin, Award, ArrowUpRight, Radio, ExternalLink, Activity
} from 'lucide-react'

export default function StudentPortal({
  session,
  email,
  setEmail,
  password,
  setPassword,
  loginError,
  authProcessing,
  handleLoginSubmit
}) {
  // Local state to manage the sub-tab views inside the portal
  const [portalTab, setPortalTab] = useState('activities') // options: 'activities' or 'about'

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. STUDENT WELCOME HERO */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-all duration-500" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
              Student View
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight pt-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Welcome to the Student Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
              Access campus public announcements, verify your event attendance, and participate in active student polling.
            </p>
          </div>
          
          {/* Enhanced Live Status Widget indicator badge inside Hero */}
          <div className="hidden md:flex flex-col items-end text-right bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl min-w-44">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">System Node Status</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
              <Radio className="h-3 w-3 animate-pulse text-emerald-500" /> Public Sync Live
            </span>
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN INTERACTIVE PORTAL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= LEFT / MAIN HUB CONTENT ================= */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* DYNAMIC VIEW SWITCHER CONDITIONALS */}
          {portalTab === 'activities' ? (
            <>
              {/* Attendance Tracker Segment */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-xs hover:border-slate-300/80 transition-all duration-200">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> My Attendance History
                  </div>
                  <span className="text-[10px] bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-sm font-mono font-bold">Term: 2025-2026</span>
                </div>
                
                <p className="text-xs text-slate-500 mb-4">View your officially logged attendance for university events.</p>
                
                {/* Visual upgrade to the empty placeholder card without altering content state */}
                <div className="bg-white p-6 rounded-xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[140px] group transition-all">
                  <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                    <Activity className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    No recent event logs found for this session.
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Attendance data pipelines stream instantly into this hub upon registration desk validation swipe.</p>
                </div>
              </div>

              {/* Campus Calendar Segment */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-xs hover:border-slate-300/80 transition-all duration-200">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <Calendar className="h-4 w-4 text-indigo-600" /> Upcoming Campus Events
                  </div>
                  <button className="text-[10px] text-indigo-600 font-black uppercase tracking-wider hover:underline flex items-center gap-0.5 cursor-pointer">
                    View Full Schedule <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
                
                <p className="text-xs text-slate-500 mb-4">Stay updated with institutional activities organized by the USG.</p>
                
                <div className="space-y-2">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex justify-between items-center hover:shadow-xs transition group">
                    <div className="flex gap-3 items-center">
                      {/* Left Date Ribbon graphic display layer */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 min-w-10 text-center flex flex-col justify-center items-center">
                        <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none">JUN</span>
                        <span className="text-xs font-black text-slate-700 mt-0.5 leading-none">19</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">General Student Assembly</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5 shrink-0" /> Gymnasium</span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5 shrink-0" /> 1:00 PM</span>
                        </div>
                      </div>
                    </div>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 shadow-2xs">Soon</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ABOUT US SUB-PANEL VIEW */
            <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl space-y-4 shadow-xs animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 shadow-2xs">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-emerald-600" /> Caraga State University Cabadbaran Campus
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    The CSUCC University Student Government (USG) serves as the supreme student governing organization within the campus. This portal acts as a central repository layout engineered to maintain administrative data transparency, manage event data synchronization pipelines, and reinforce secure inter-council collaboration.
                  </p>
                </div>
              </div>

              {/* Informative value adds to details panel wrapper */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Institutional Branch</span>
                  <span className="text-xs font-bold text-slate-700 block mt-0.5">Executive Branch Council</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Clearance Standard</span>
                  <span className="text-xs font-bold text-slate-700 block mt-0.5">RBAC Compliant Node</span>
                </div>
              </div>

              <div className="border-t border-slate-200/60 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1"><ExternalLink className="h-3 w-3 text-slate-300" /> USG Portal v1.0.0</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-sm">Secure SSL Link Enabled</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT / CONSOLE CONTROLS SIDEBAR ================= */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* MINI-PORTAL NAVIGATION LINKS */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 grid grid-cols-2 gap-2 shadow-inner">
            <button
              onClick={() => setPortalTab('activities')}
              className={`p-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                portalTab === 'activities' 
                  ? 'bg-white border border-slate-200 text-slate-800 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Activity Hub
            </button>
            <button
              onClick={() => setPortalTab('about')}
              className={`p-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                portalTab === 'about' 
                  ? 'bg-white border border-slate-200 text-slate-800 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
              }`}
            >
              <Info className="h-3.5 w-3.5" /> About Us
            </button>
          </div>

          {/* INTEGRATED ACCESS PRIVILEGES INTERFACE */}
          {!session ? (
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-1 relative z-10">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 shadow-2xs">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Executive Login</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  USG Officers and LSG members can verify administrative clearance here.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3 relative z-10">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">User Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@csucc.edu.ph" 
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-150"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">User Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-150"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl flex items-start gap-2 text-[10px] leading-normal font-medium animate-shake">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={authProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-slate-800 text-slate-900 disabled:text-slate-500 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer mt-2 group"
                >
                  {authProcessing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Validating Secure Node...
                    </>
                  ) : (
                    <>
                      <span>Enter Portal</span>
                      <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 rounded-2xl p-5 text-center text-xs font-bold space-y-2 animate-fade-in shadow-xs">
              <div className="mx-auto h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <p className="uppercase tracking-wide text-[11px]">Clearance Approved</p>
              <p className="text-[10px] text-slate-400 font-normal leading-relaxed">Use the application sidebar panel menu to switch to restricted officer tools.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
