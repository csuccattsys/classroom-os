import React, { useState, useEffect } from 'react'
import { 
  Calendar, CheckCircle, Info, Globe, Megaphone, Clock, User, 
  HelpCircle, Link, Phone, Mail, ExternalLink, Loader2
} from 'lucide-react'
// Import your pre-configured supabase client instance
import { supabase } from '../supabaseClient' 

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
  // State management for live database streaming
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch real-time records from Supabase on component mount
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false }) // Keep newest items on top

        if (error) throw error

        if (data) {
          setAnnouncements(data)
        }
      } catch (error) {
        console.error('Error streaming announcements ledger:', error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  // Helper function to render clean local relative time strings
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

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
            
            {/* Dynamic Content Loader Conditionals */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 space-y-2">
                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Synchronizing with campus bulletin record tables...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
                <Megaphone className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Announcements Posted</p>
                <p className="text-[11px] text-slate-400 mt-0.5">The university administration dashboard hasn't published recent notices.</p>
              </div>
            ) : (
              /* Map Array Elements directly pulled from Supabase Storage Tables */
              <div className="space-y-3">
                {announcements.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 transition-all hover:border-slate-300">
                    <div className="flex justify-between items-start gap-4">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.category || 'General Advisory'}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <Clock className="h-3 w-3" /> {formatTime(item.created_at)}
                      </div>
                    </div>
                    <h3 className="text-xs font-bold text-slate-800">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                    <div className="pt-1 flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                      <User className="h-3 w-3 text-slate-400" /> {item.publisher || 'University Student Government'}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

        {/* ================= RIGHT / SIDEBAR PUBLIC CHANNELS ================= */}
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
                <span className="font-mono text-[11px]">Office Located at near Swimming Pool alongside with LCO</span>
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
                href="https://beta-myschool.csucc.edu.ph" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition text-xs text-slate-700 font-medium group"
              >
                <span>CSUCC MySchool Website</span>
                <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </a>
              <a 
                href="https://beta.csucc.edu.ph" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition text-xs text-slate-700 font-medium group"
              >
                <span>CSUCC School Website</span>
                <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
