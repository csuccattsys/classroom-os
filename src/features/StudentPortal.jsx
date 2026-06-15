import React, { useState, useEffect } from 'react'
import { 
  Calendar, CheckCircle, Info, Globe, Megaphone, Clock, User, 
  HelpCircle, Link, Phone, Mail, ExternalLink, Loader2, Bell, MapPin,
  Users, Building2, ShieldCheck, Bookmark
} from 'lucide-react'
import { supabase } from '../supabaseClient' 

export default function StudentPortal({ session }) {
  const [announcements, setAnnouncements] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  // Toggle tab state for the structural organizational registry
  const [activeTab, setActiveTab] = useState('executive')

  // Official USG Organizational Registry Data Map
  const structureData = {
    executive: {
      leader: { name: "Kylene L. Beniga", role: "President, CSUCC USG" },
      officers: [
        { name: "Earl Christian D. Villanueva", role: "Board Member, CSU CSGF" },
        { name: "Elimelech A. Mendoza V", role: "Treasurer, CSU CSGF" },
        { name: "Alleiah Mae S. Maravilla", role: "Board Member, CSU CSGF" }
      ]
    },
    lowerhouse: {
      leader: { name: "Speaker of the Council", role: "LSG House Chairperson" },
      officers: [
        { name: "CBA Representative", role: "LSG Representative Node" },
        { name: "CEIT Representative", role: "LSG Representative Node" },
        { name: "CITTE Representative", role: "LSG Representative Node" },
        { name: "CTHM Representative", role: "LSG Representative Node" }
      ]
    }
  }

  const currentGroup = structureData[activeTab]

  useEffect(() => {
    // Request permission for desktop push notifications on system mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }

    // 1. Initial Data Fetch (Announcements & Unread Badge Indicator counts)
    async function fetchPortalData() {
      try {
        setIsLoading(true)
        
        // Fetch announcements
        const { data: announcementData, error: aError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })

        if (aError) throw aError
        if (announcementData) setAnnouncements(announcementData)

        // Fetch unread notification counts for current logged-in user account session
        if (session?.user?.id) {
          const { count, error: cError } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('is_read', false)

          if (!cError) setUnreadCount(count || 0)
        }

      } catch (error) {
        console.error('Error synchronizing portal streams:', error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortalData()

    // 2. Realtime Database Subscription Pipeline (Captures real-time broadcasts)
    const announcementsChannel = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          if (!payload) return;

          if (payload.eventType === 'INSERT') {
            // Update Feed Layer
            setAnnouncements((prev) => [payload.new, ...(prev || [])])
            
            // Increment local unread visual badge count
            setUnreadCount((prev) => prev + 1)

            // Trigger Native Browser Desktop Banner Alert Notification
            if (Notification.permission === 'granted') {
              new Notification(`📢 New USG Broadcast: ${payload.new.title}`, {
                body: payload.new.content.substring(0, 80) + '...',
              });
            } else {
              alert(`📢 NEW ANNOUNCEMENT: "${payload.new.title}" posted by ${payload.new.publisher || 'USG'}`);
            }
          } else if (payload.eventType === 'UPDATE') {
            setAnnouncements((prev) =>
              (prev || []).map((item) => String(item.id) === String(payload.new.id) ? payload.new : item)
            );
          } else if (payload.eventType === 'DELETE') {
            setAnnouncements((prev) =>
              (prev || []).filter((item) => String(item.id) !== String(payload.old.id))
            );
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(announcementsChannel)
    }
  }, [session])

  // Mark all notifications as read when the user checks their alerts
  const handleClearNotifications = async () => {
    if (!session?.user?.id || unreadCount === 0) return
    
    setUnreadCount(0) // Quick visual reset
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6 animate-fade-in relative text-slate-900">
      
      {/* ================= 1. STUDENT WELCOME HERO WITH INTEGRATED DYNAMIC BELL BADGE ================= */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-2xl p-6 text-white border border-slate-800 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
            Student View
          </span>
          <h2 className="text-xl font-black tracking-tight pt-3">Welcome to the Student Portal</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Access campus public announcements, verify your event attendance, and participate in active student polling.
          </p>
        </div>

        {/* Dynamic Notification Center Action Button Wrapper */}
        <button 
          onClick={handleClearNotifications}
          className="relative flex items-center gap-2 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-xl transition text-xs font-semibold shrink-0 group"
        >
          <Bell className={`h-4 w-4 text-slate-300 group-hover:text-emerald-400 transition-colors ${unreadCount > 0 ? 'animate-bounce text-emerald-400' : ''}`} />
          <span>Alerts Center</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-black font-mono text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ================= 2. USG HIERARCHICAL STRUCTURE WORKSPACE (NEW ELEMENT ADDED HERE) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COLUMN: MINI DIRECTORY NAVIGATION COMPONENT */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden lg:col-span-1">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-700" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              CSUCC USG Office
            </span>
          </div>
          <div className="p-2 space-y-1">
            <button className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition flex items-center justify-between group">
              <span>About USG</span>
              <Bookmark className="h-3 w-3 text-slate-300 group-hover:text-emerald-600 transition" />
            </button>
            <button className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition flex items-center justify-between group">
              <span>Vision and Mission Statements</span>
              <ShieldCheck className="h-3 w-3 text-slate-300 group-hover:text-emerald-600 transition" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN INTERACTIVE ROSTER MAP BLOCK */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 lg:col-span-3 min-h-[440px] flex flex-col justify-between">
          
          {/* HEADER ROW & ACTIVE TOGGLES */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                University Student Government
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">CSUCC Student Representation Hierarchy Tree</p>
            </div>
            
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('executive')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  activeTab === 'executive'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                USG Executive Officers
              </button>
              <button
                onClick={() => setActiveTab('lowerhouse')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  activeTab === 'lowerhouse'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                USG Lowerhouse
              </button>
            </div>
          </div>

          {/* TREE CANVAS STRUCTURE */}
          <div className="flex flex-col items-center justify-center py-6 space-y-8 my-auto">
            
            {/* TIER 1: Presiding Leader */}
            <div className="flex flex-col items-center relative">
              <div className="bg-white border border-slate-150 shadow-md rounded-2xl p-4 w-48 text-center space-y-3 transition-all hover:shadow-lg">
                <div className="w-14 h-14 bg-slate-50 rounded-full mx-auto flex items-center justify-center border border-slate-200 text-slate-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 tracking-tight leading-tight">
                    {currentGroup.leader.name}
                  </h4>
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5">
                    {currentGroup.leader.role}
                  </p>
                </div>
              </div>
              
              {/* Branch Node Connector Line */}
              <div className="w-0.5 h-8 bg-slate-200 mt-2"></div>
            </div>

            {/* TIER 2: Secondary Officer Grid Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl justify-items-center">
              {currentGroup.officers.map((officer, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-slate-150 shadow-md rounded-2xl p-4 w-48 text-center space-y-3 relative transition-all hover:shadow-lg"
                >
                  {/* Stem connector point displayed over tablet layouts */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-slate-200 hidden sm:block"></div>
                  
                  <div className="w-12 h-12 bg-slate-50 rounded-full mx-auto flex items-center justify-center border border-slate-200 text-slate-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-slate-800 tracking-tight leading-tight">
                      {officer.name}
                    </h5>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                      {officer.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* LEDGER STATUS VERIFICATION STRIP */}
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[9px] text-slate-400 font-mono tracking-tight">
            <span>Verified System Registry Nodes</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping"></span> Live Sync
            </span>
          </div>

        </div>
      </div>

      {/* ================= 3. TWO-COLUMN INTERACTIVE PORTAL LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= LEFT / MAIN HUB CONTENT ================= */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* CAMPUS ANNOUNCEMENTS BULLETIN FEED */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">
              <Megaphone className="h-4 w-4 text-emerald-600" /> Official Campus Announcements
            </div>
            <p className="text-xs text-slate-500 mb-4">Stay informed with real-time news, advisories, and updates directly from the USG.</p>
            
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
                    
                    <div className="flex justify-between items-start gap-4">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.category || 'General Advisory'}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <Clock className="h-3 w-3" /> {formatTime(item.created_at)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-800">{item.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                    </div>

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

        {/* ================= RIGHT / SIDEBAR PUBLIC CHANNELS ================= */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* HIGH-GRAPHICS USG HELPDESK CARD */}
          <div className="bg-slate-900 text-white border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg relative overflow-hidden group">
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
              <div className="flex items-center gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-colors group/row">
                <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/10">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Official Email</span>
                  <span className="truncate font-mono text-[11px] text-slate-300 group-hover/row:text-emerald-400 transition-colors">usg@csucc.edu.ph</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-colors">
                <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/10 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Physical Office Location</span>
                  <span className="text-[11px] text-slate-300 leading-normal font-medium">Original Office Near Swimming Pool alongside LCO Room</span>
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
              <a 
                href="https://beta-myschool.csucc.edu.ph" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-gradient-to-r from-emerald-50/20 to-slate-50/40 hover:from-emerald-50/50 hover:to-emerald-50/10 hover:border-emerald-200/60 shadow-xs transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">MS</div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-slate-800 font-bold tracking-tight">CSUCC MySchool Portal</span>
                    <span className="text-[10px] text-slate-400 truncate">Grades, profiles & schedules</span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>

              <a 
                href="https://beta.csucc.edu.ph" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-gradient-to-r from-emerald-50/20 to-slate-50/40 hover:from-emerald-50/50 hover:to-emerald-50/10 hover:border-emerald-200/60 shadow-xs transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">WB</div>
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
