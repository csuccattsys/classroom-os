import React, { useState, useEffect } from 'react'
import { 
  Calendar, CheckCircle, Info, Globe, Megaphone, Clock, User, 
  HelpCircle, Link, Phone, Mail, ExternalLink, Loader2, MapPin
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

  // Fetch real-time records and subscribe to live changes from Supabase
  useEffect(() => {
    // 1. Initial Data Fetch
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

    // 2. Realtime Database Subscription Pipeline
    const announcementsChannel = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          if (!payload) return;

          if (payload.eventType === 'INSERT') {
            setAnnouncements((prev) => [payload.new, ...(prev || [])])
          } else if (payload.eventType === 'UPDATE') {
            setAnnouncements((prev) =>
              (prev || []).map((item) => 
                String(item.id) === String(payload.new.id) ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAnnouncements((prev) =>
              (prev || []).filter((item) => String(item.id) !== String(payload.old.id))
            );
          }
        }
      )
      .subscribe()

    // Clean up pipeline listener on component unmount
    return () => {
      supabase.removeChannel(announcementsChannel)
    }
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
            ) : !announcements || announcements.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
                <Megaphone className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Announcements Posted</p>
                <p className="text-[11px] text-slate-400 mt-0.5">The university administration dashboard hasn't published recent notices.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 transition-all hover:border-slate-300 overflow-hidden">
                    
                    {/* Top Row: Meta Tags */}
                    <div className="flex justify-between items-start gap-4">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.category || 'General Advisory'}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <Clock className="h-3 w-3" /> {formatTime(item.created_at)}
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-800">{item.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                        {item.content}
                      </p>
                    </div>

                    {/* DYNAMIC ATTACHED IMAGE VIEW */}
                    {item.image_url && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 max-h-72 flex items-center justify-center">
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Footer: Publisher Identity */}
                    <div className="pt-1 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
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

        {/* ================= RIGHT / SIDEBAR ENHANCED PUBLIC CHANNELS ================= */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* HIGH-GRAPHICS USG HELPDESK CARD */}
          <div className="bg-slate-900 text-white border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg relative overflow-hidden group">
            {/* Soft decorative background glow effect */}
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-300 pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <span className="text-slate-100 font-black text-xs uppercase tracking-wider">USG Help Desk</span>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live Support
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Have concerns regarding local structural policies, clearance exceptions, or financial audits? Reach out directly to our help channels:
            </p>
            
            <div className="space-y-2.5 pt-1">
              {/* Email Entry Line */}
              <div className="flex items-center gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-colors group/row">
                <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/10">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Official Email</span>
                  <span className="truncate font-mono text-[11px] text-slate-300 group-hover/row:text-emerald-400 transition-colors">usg@csucc.edu.ph</span>
                </div>
              </div>

              {/* Office Location Entry Line */}
              <div className="flex items-start gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-colors">
                <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/10 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Physical Office Location</span>
                  <span className="text-[11px] text-slate-300 leading-normal font-medium">
                    Near Swimming Pool alongside LCO Room
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* HIGH-GRAPHICS DYNAMIC INSTITUTIONAL LINKS HUB */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2.5">
              <div className="p-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
                <Link className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              Institutional Links Hub
            </div>
            
            <div className="grid grid-cols-1 gap-2.5 pt-0.5">
              {/* Link Tile 1 */}
              <a 
                href="https://beta-myschool.csucc.edu.ph" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-gradient-to-r from-emerald-50/20 to-slate-50/40 hover:from-emerald-50/50 hover:to-emerald-50/10 hover:border-emerald-200/60 shadow-xs transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                    MS
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-slate-800 font-bold tracking-tight">CSUCC MySchool Portal</span>
                    <span className="text-[10px] text-slate-400 truncate">Grades, profiles & schedules</span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>

              {/* Link Tile 2 */}
              <a 
                href="https://beta.csucc.edu.ph" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-gradient-to-r from-emerald-50/20 to-slate-50/40 hover:from-emerald-50/50 hover:to-emerald-50/10 hover:border-emerald-200/60 shadow-xs transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                    WB
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-slate-800 font-bold tracking-tight">CSUCC School Website</span>
                    <span className="text-[10px] text-slate-400 truncate">Official campus main page</span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
