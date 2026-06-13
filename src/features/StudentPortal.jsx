import React, { useState } from 'react'
import { 
  Calendar, CheckCircle, ShieldCheck, KeyRound, Mail, 
  AlertCircle, Loader2, Info, LayoutDashboard, Globe,
  Megaphone, Clock, User
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
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. STUDENT WELCOME HERO */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-2xl p-6 text-white border border-slate-800 shadow-lg">
        <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
          Student View
        </span>
        <h2 className="text-xl font-black tracking-tight pt-3">Welcome to the Student Portal</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Access campus public announcements, verify your event attendance, and participate in active student polling.
        </p>
      </div>

      {/* 2. TWO-COLUMN INTERACTIVE PORTAL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= LEFT / MAIN HUB CONTENT ================= */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* NEW FEATURE: CAMPUS ANNOUNCEMENTS BULLETIN FEED */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">
              <Megaphone className="h-4 w-4 text-emerald-600" /> Official Campus Announcements
            </div>
            <p className="text-xs text-slate-500 mb-4">Stay informed with real-time news, advisories, and updates directly from the USG.</p>
            
            {/* Announcement Feed Stack */}
            <div className="space-y-3">
              {/* Announcement Item 1 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                    General Advisory
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <Clock className="h-3 w-3" /> Just now
                  </div>
                </div>
                <h3 className="text-xs font-bold text-slate-800">Distribution of Student ID Lanyards</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  All undergraduate students can now collect their official university lanyards at the USG Executive Office. Please present your valid digital certificate of registration (COR) upon claiming.
                </p>
                <div className="pt-1 flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                  <User className="h-3 w-3 text-slate-400" /> Public Relations Office
                </div>
              </div>

              {/* Announcement Item 2 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <span className="bg-amber-50 text-amber-600 border border-amber-100 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Academic
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <Clock className="h-3 w-3" /> Yesterday
                  </div>
                </div>
                <h3 className="text-xs font-bold text-slate-800">Midterm Examination Clearance Period</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Make sure to coordinate with your respective Local Student Governments (LSGs) to process municipal fine event clearances ahead of the upcoming examination week.
                </p>
                <div className="pt-1 flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                  <User className="h-3 w-3 text-slate-400" /> Judiciary Branch
                </div>
              </div>
            </div>
          </div>

          {/* ABOUT US PANEL VIEW (Kept from original code background structure) */}
          <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-600" /> Caraga State University Cabadbaran Campus
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The CSUCC University Student Government (USG) serves as the supreme student governing organization within the campus. This portal acts as a central repository layout engineered to maintain administrative data transparency, manage event data synchronization pipelines, and reinforce secure inter-council collaboration.
              </p>
            </div>
            <div className="border-t border-slate-200/60 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>USG Portal v1.0.0</span>
              <span className="text-emerald-600 font-bold">Secure SSL Link Enabled</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT / CONSOLE CONTROLS SIDEBAR ================= */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* INTEGRATED ACCESS PRIVILEGES INTERFACE */}
          {!session ? (
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="space-y-1">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Executive Login</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  USG Officers and LSG members can verify administrative clearance here.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3">
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
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
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
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl flex items-start gap-2 text-[10px] leading-normal font-medium">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={authProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-slate-800 text-slate-900 disabled:text-slate-500 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {authProcessing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Validating Secure Node...
                    </>
                  ) : (
                    'Enter Portal'
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 rounded-2xl p-5 text-center text-xs font-bold space-y-1 animate-fade-in">
              <p></p>
              <p className="text-[10px] text-slate-400 font-normal">Use the application sidebar panel menu to switch to restricted officer tools.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
