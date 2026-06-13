import React, { useState } from 'react'
import { 
  Calendar, CheckCircle, ShieldCheck, KeyRound, Mail, 
  AlertCircle, Loader2, Info, LayoutDashboard, Globe,
  Clock, MapPin, Award, ArrowUpRight, Radio, ExternalLink, Activity,
  Fingerprint, Terminal, Building2, ShieldAlert
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
    <div className="space-y-6 animate-fade-in text-slate-900 selection:bg-emerald-600 selection:text-white">
      
      {/* 1. STUDENT WELCOME HERO (REBRANDED: INSTITUTIONAL COMMAND BANNER) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl shadow-slate-950/20 group">
        {/* Architectural Grid & Flare Overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl transition-all duration-700 group-hover:bg-emerald-500/15" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 shadow-xs">
              <span className="h-1 w-1 animate-ping rounded-full bg-emerald-400" />
              Student View
            </div>
            <h2 className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-xl font-black tracking-tight text-transparent md:text-2xl">
              Welcome to the Student Portal
            </h2>
            <p className="max-w-md text-xs leading-relaxed text-slate-400">
              Access campus public announcements, verify your event attendance, and participate in active student polling.
            </p>
          </div>
          
          {/* Institutional Node Badge */}
          <div className="hidden min-w-48 flex-col items-end rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 text-right md:flex">
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Network Terminal</span>
            <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Radio className="h-3 w-3 animate-pulse text-emerald-500" /> CSUCC-PUBLIC-NODE
            </span>
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN INTERACTIVE PORTAL LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* ================= LEFT / MAIN HUB CONTENT ================= */}
        <div className="space-y-4 lg:col-span-2">
          
          {/* DYNAMIC VIEW SWITCHER CONDITIONALS */}
          {portalTab === 'activities' ? (
            <>
              {/* Attendance Tracker Segment (REBRANDED: AUDITED ENROLLMENT LEDGER) */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 shadow-xs transition-all duration-300 hover:border-slate-300 hover:bg-slate-50/80">
                <div className="mb-4 flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> My Attendance History
                  </div>
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[9px] font-black text-slate-500 uppercase tracking-wider shadow-2xs">Verified Stream</span>
                </div>
                
                <p className="mb-4 text-xs text-slate-500">View your officially logged attendance for university events.</p>
                
                {/* Empty State Presentation Layer Upgrade */}
                <div className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center transition-all duration-300 hover:bg-slate-50/50">
                  <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 shadow-2xs">
                    <Fingerprint className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    No recent event logs found for this session.
                  </div>
                  <p className="mt-1 max-w-xs text-[10px] leading-normal text-slate-400">
                    Attendance indexes clear automatically upon verified biometric scanner or administrative ledger sync.
                  </p>
                </div>
              </div>

              {/* Campus Calendar Segment (REBRANDED: DISPATCH BULLETIN LISTING) */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 shadow-xs transition-all duration-300 hover:border-slate-300 hover:bg-slate-50/80">
                <div className="mb-4 flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                    <Calendar className="h-4 w-4 text-emerald-600" /> Upcoming Campus Events
                  </div>
                  <button className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700 transition-colors cursor-pointer hover:text-emerald-600 hover:underline">
                    Registry Schedule <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
                
                <p className="mb-4 text-xs text-slate-500">Stay updated with institutional activities organized by the USG.</p>
                
                <div className="space-y-2">
                  <div className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs transition-all duration-200 hover:border-slate-200 hover:shadow-xs">
                    <div className="flex items-center gap-3.5">
                      {/* Monolithic Date Graphic Badge */}
                      <div className="flex min-w-10 flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-center shadow-xs">
                        <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 leading-none">JUN</span>
                        <span className="mt-0.5 text-xs font-black text-emerald-400 leading-none">19</span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 transition-colors group-hover:text-emerald-700">General Student Assembly</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-medium text-slate-400">
                          <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> Campus Gymnasium</span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> 1:00 PM PST</span>
                        </div>
                      </div>
                    </div>
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 shadow-2xs">Soon</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ABOUT US SUB-PANEL VIEW (REBRANDED: CHARTER TRANSPARENCY MODULE) */
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 shadow-xs animate-fade-in space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-2xs">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                    <Globe className="h-4 w-4 text-emerald-600" /> Caraga State University Cabadbaran Campus
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-500">
                    The CSUCC University Student Government (USG) serves as the supreme student governing organization within the campus. This portal acts as a central repository layout engineered to maintain administrative data transparency, manage event data synchronization pipelines, and reinforce secure inter-council collaboration.
                  </p>
                </div>
              </div>

              {/* Data Specifications Grid Layer */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-2xs">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Governance Tier</span>
                  <span className="mt-0.5 text-xs font-bold text-slate-700 block">Supreme Student Council</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-2xs">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Node Protocols</span>
                  <span className="mt-0.5 text-xs font-bold text-slate-700 block">RBAC Signature Enabled</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 pt-4 font-mono text-[10px] text-slate-400">
                <span className="flex items-center gap-1 font-bold"><ExternalLink className="h-3 w-3 text-slate-300" /> CORE ARCH v1.0.0</span>
                <span className="rounded-sm border border-emerald-100/60 bg-emerald-50/80 px-2 py-0.5 font-bold text-emerald-700">Secure SSL Link Enabled</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT / CONSOLE CONTROLS SIDEBAR ================= */}
        <div className="space-y-4 lg:col-span-1">
          
          {/* MINI-PORTAL NAVIGATION LINKS (REBRANDED: DOCK SWITCHER) */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5 shadow-inner grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setPortalTab('activities')}
              className={`p-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                portalTab === 'activities' 
                  ? 'bg-white border border-slate-200 text-slate-800 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Activity Hub
            </button>
            <button
              onClick={() => setPortalTab('about')}
              className={`p-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                portalTab === 'about' 
                  ? 'bg-white border border-slate-200 text-slate-800 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'
              }`}
            >
              <Info className="h-3.5 w-3.5" /> About Us
            </button>
          </div>

          {/* INTEGRATED ACCESS PRIVILEGES INTERFACE (REBRANDED: SLATE SECURITY DECK) */}
          {!session ? (
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-xl space-y-4">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
              
              <div className="space-y-1 relative z-10">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-2xs">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">Executive Login</h3>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  USG Officers and LSG members can verify administrative clearance here.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3 relative z-10">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400">User Email</label>
                  <div className="relative">
                    <Mail className="absolute top-2.5 left-3 h-3.5 w-3.5 text-slate-500" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@csucc.edu.ph" 
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 pr-4 pl-9 text-xs font-medium text-slate-200 transition-all duration-150 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400">User Password</label>
                  <div className="relative">
                    <KeyRound className="absolute top-2.5 left-3 h-3.5 w-3.5 text-slate-500" />
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 pr-4 pl-9 text-xs font-medium text-slate-200 transition-all duration-150 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-[10px] font-medium leading-normal text-rose-400 animate-shake">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={authProcessing}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md shadow-emerald-950/20 transition-all duration-200 cursor-pointer hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500"
                >
                  {authProcessing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Validating Secure Node...
                    </>
                  ) : (
                    <>
                      <span>Enter Portal</span>
                      <ArrowUpRight className="h-3 w-3 opacity-60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* ENHANCED SECURITY STATE SIGNATURE BADGING LAYER */
            <div className="rounded-2xl border border-emerald-900/20 bg-emerald-950/20 p-5 text-center text-xs font-bold shadow-xs animate-fade-in space-y-2">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <Terminal className="h-4 w-4" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-emerald-400">Clearance Approved</p>
              <p className="text-[10px] font-normal leading-relaxed text-slate-400">Use the application sidebar panel menu to switch to restricted officer tools.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
