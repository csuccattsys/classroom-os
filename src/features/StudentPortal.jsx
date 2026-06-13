import React, { useState } from 'react'
import { 
  Calendar, CheckCircle, ShieldLock, KeyRound, Mail, 
  AlertCircle, Loader2, Info, LayoutDashboard, Globe
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
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-2xl p-6 text-white border border-slate-800 shadow-lg">
        <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
          Student Body Node
        </span>
        <h2 className="text-xl font-black tracking-tight pt-3">Welcome to the Student Portal</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Access campus public announcements, verify your event attendance ledgers, and participate in active student polling.
        </p>
      </div>

      {/* 2. TWO-COLUMN INTERACTIVE PORTAL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= LEFT / MAIN HUB CONTENT ================= */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* DYNAMIC VIEW SWITCHER CONDITIONALS */}
          {portalTab === 'activities' ? (
            <>
              {/* Attendance Tracker Segment */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" /> My Attendance History
                </div>
                <p className="text-xs text-slate-500 mb-4">View your officially logged attendance points for university events.</p>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center text-xs text-slate-400 font-medium">
                  No recent event logs found for this session.
                </div>
              </div>

              {/* Campus Calendar Segment */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">
                  <Calendar className="h-4 w-4 text-indigo-600" /> Upcoming Campus Events
                </div>
                <p className="text-xs text-slate-500 mb-4">Stay updated with institutional activities organized by the USG.</p>
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800">General Student Assembly</p>
                      <p className="text-[10px] text-slate-400">Gymnasium • 1:00 PM</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-600 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">Soon</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ABOUT US SUB-PANEL VIEW */
            <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl space-y-4 animate-fade-in">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600" /> Caraga State University Cabadbaran Campus
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The CSUCC University Student Government (USG) serves as the supreme student governing organization within the campus. This portal acts as a central repository layout engineered to maintain administrative data transparency, manage event data synchronization pipelines, and reinforce secure inter-council collaboration.
                </p>
              </div>
              <div className="border-t border-slate-200/60 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Governance Engine v2.0.0 (Stable Node)</span>
                <span className="text-emerald-600 font-bold">Secure SSL Link Enabled</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT / CONSOLE CONTROLS SIDEBAR ================= */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* MINI-PORTAL NAVIGATION LINKS */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 grid grid-cols-2 gap-2">
            <button
              onClick={() => setPortalTab('activities')}
              className={`p-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                portalTab === 'activities' 
                  ? 'bg-white border border-slate-200 text-slate-800 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Activity Hub
            </button>
            <button
              onClick={() => setPortalTab('about')}
              className={`p-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                portalTab === 'about' 
                  ? 'bg-white border border-slate-200 text-slate-800 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Info className="h-3.5 w-3.5" /> About Us
            </button>
          </div>

          {/* INTEGRATED ACCESS PRIVILEGES INTERFACE */}
          {!session ? (
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="space-y-1">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <ShieldLock className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Executive Login</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  USG Officers and LSG Council Board members can verify administrative clearance keys here.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Clearance Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@csu.edu.ph" 
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Encryption Access Key</label>
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
                    'Verify Terminal Clearance'
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 rounded-2xl p-5 text-center text-xs font-bold space-y-1 animate-fade-in">
              <p>✓ Secure Administrative Node Engaged</p>
              <p className="text-[10px] text-slate-400 font-normal">Use the application sidebar panel menu to switch to restricted officer tools.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
