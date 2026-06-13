import React from 'react'
import { 
  Calendar, CheckCircle, Info, Globe, Megaphone, Clock, User, 
  HelpCircle, Link, Phone, Mail, ExternalLink 
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
          
          {/* CAMPUS ANNOUNCEMENTS BULLETIN FEED */}
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

          {/* ABOUT US PANEL VIEW */}
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
              <span>Secure SSL Link Enabled</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT / SIDEBAR PUBLIC CHANNELS (REPLACED LOGIN) ================= */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* USG HELPDESK DIRECTORY */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              <HelpCircle className="h-4 w-4 text-emerald-600" /> USG Help Desk
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Have concerns regarding local structural policies, clearance exceptions, or financial audits? Reach out directly:
            </p>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-mono text-[11px]">usg@csucc.edu.ph</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-[11px]">Office Ext. 204</span>
              </div>
            </div>
          </div>

          {/* QUICK LINKS HUB */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              <Link className="h-4 w-4 text-emerald-600" /> Institutional Links
            </div>
            <div className="grid grid-cols-1 gap-2 pt-1">
              <a 
                href="https://csucc.edu.ph" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition text-xs text-slate-700 font-medium group"
              >
                <span>Main Campus Website</span>
                <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </a>
              <a 
                href="#sms" 
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition text-xs text-slate-700 font-medium group"
              >
                <span>Student Management System</span>
                <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
