import React, { useState, useEffect } from 'react'
import { 
  Calendar, CheckCircle, Info, Globe, Megaphone, Clock, User, 
  HelpCircle, Link, Phone, Mail, ExternalLink, Loader2, Bell, MapPin,
  Users, Building2, ShieldCheck, Bookmark, Scale, FileText, HeartHandshake, Award,
  ChevronDown, Crown, Star
} from 'lucide-react'
import { supabase } from '../supabaseClient' 

export default function StudentPortal({ session }) {
  const [announcements, setAnnouncements] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  // Tab state for the structural organizational registry tree
  const [activeTab, setActiveTab] = useState('executive')
  
  // Interactive Directory active section state
  const [activeSection, setActiveSection] = useState('about_usg')

  // Official USG Organizational Registry Data Map with current officers
  const structureData = {
    executive: {
      title: "Executive Committee Branch",
      description: "Primary administrative and policy enforcement assembly of the University Student Government.",
      leader: { 
        name: "Davie P. Sialongo", 
        role: "President",
        subRole: "CSUCC USG",
        program: "BTLED - HE"
      },
      officers: [
        { name: "Darius Noel Q. Madiclum", role: "Vice President", subRole: "CSUCC USG", program: "BTLED - IA" },
        { name: "Jowee Allen B. Bajaro", role: "Executive Secretary", subRole: "CSUCC USG", program: "BTLED - HE" },
        { name: "Ai Mae P. Arcenas", role: "Secretary", subRole: "CSUCC USG", program: "BTLED - IA" }
      ]
    },
    lowerhouse: {
      title: "Legislative Council Representative Assembly",
      description: "Departmental representation units operating under autonomous college councils.",
      leader: { 
        name: "Speaker of the Council", 
        role: "House Chairperson", 
        subRole: "LSG Legislature",
        program: "Governance Node" 
      },
      officers: [
        { name: "CBA Representative", role: "Representative Node", subRole: "CBA Council", program: "CBA Council" },
        { name: "CEIT Representative", role: "Representative Node", subRole: "CEIT Council", program: "CEIT Council" },
        { name: "CITTE Representative", role: "Representative Node", subRole: "CITTE Council", program: "CITTE Council" },
        { name: "CTHM Representative", role: "Representative Node", subRole: "CTHM Council", program: "CTHM Council" }
      ]
    }
  }

  const currentGroup = structureData[activeTab]

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }

    async function fetchPortalData() {
      try {
        setIsLoading(true)
        const { data: announcementData, error: aError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })

        if (aError) throw aError
        if (announcementData) setAnnouncements(announcementData)

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

    const announcementsChannel = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          if (!payload) return;
          if (payload.eventType === 'INSERT') {
            setAnnouncements((prev) => [payload.new, ...(prev || [])])
            setUnreadCount((prev) => prev + 1)
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

  const handleClearNotifications = async () => {
    if (!session?.user?.id || unreadCount === 0) return
    setUnreadCount(0)
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
    <div className="space-y-6 relative text-slate-900 transition-all duration-300">
      <style>{`
        @keyframes customFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: customFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* ================= 1. STUDENT WELCOME HERO ================= */}
      <div className="animate-fade-in-up bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl transform group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
        
        <div className="transform transition-all duration-300 hover:translate-x-1">
          <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-block animate-pulse">
            Student View
          </span>
          <h2 className="text-xl font-black tracking-tight pt-3">Welcome to the Student Portal</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
            Access campus public announcements, verify your event attendance, and participate in active student polling.
          </p>
        </div>

        <button 
          onClick={handleClearNotifications}
          className="relative flex items-center gap-2 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 px-4 py-2.5 rounded-xl transition-all duration-300 text-xs font-semibold shrink-0 group active:scale-95 shadow-sm"
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

      {/* ================= 2. INTERACTIVE EXPANDED DIRECTORY (RESTRUCTURED TREE) ================= */}
      <div className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-4 gap-6 items-start" style={{ animationDelay: '100ms' }}>
        
        {/* LEFT COLUMN: THE EXPANDED OFFICE DIRECTORY PANEL */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden lg:col-span-1 transition-all duration-300 hover:shadow-md">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-700" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              CSUCC USG Office
            </span>
          </div>
          
          <div className="p-2 space-y-1">
            <button 
              onClick={() => setActiveSection('about_usg')}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-between group ${activeSection === 'about_usg' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span>About USG</span>
              <Bookmark className={`h-3.5 w-3.5 ${activeSection === 'about_usg' ? 'text-emerald-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
            </button>

            <button 
              onClick={() => setActiveSection('lsg')}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-between group ${activeSection === 'lsg' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span>Local Student Government (LSG)</span>
              <Users className={`h-3.5 w-3.5 ${activeSection === 'lsg' ? 'text-emerald-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
            </button>

            <button 
              onClick={() => setActiveSection('dlhs_ssg')}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-between group ${activeSection === 'dlhs_ssg' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span>DLHS SSG</span>
              <Award className={`h-3.5 w-3.5 ${activeSection === 'dlhs_ssg' ? 'text-emerald-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
            </button>

            <button 
              onClick={() => setActiveSection('comelec')}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-between group ${activeSection === 'comelec' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span>CSUCC USG COMELEC</span>
              <Scale className={`h-3.5 w-3.5 ${activeSection === 'comelec' ? 'text-emerald-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
            </button>

            <button 
              onClick={() => setActiveSection('coa')}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-between group ${activeSection === 'coa' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span>CSUCC USG COA</span>
              <ShieldCheck className={`h-3.5 w-3.5 ${activeSection === 'coa' ? 'text-emerald-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
            </button>

            <button 
              onClick={() => setActiveSection('charter')}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-between group ${activeSection === 'charter' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span>Citizen's Charter</span>
              <FileText className={`h-3.5 w-3.5 ${activeSection === 'charter' ? 'text-emerald-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
            </button>

            <button 
              onClick={() => setActiveSection('services')}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-between group ${activeSection === 'services' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span>Student Services</span>
              <HeartHandshake className={`h-3.5 w-3.5 ${activeSection === 'services' ? 'text-emerald-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: RESTRUCTURED MAIN HIERARCHY BOX */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 lg:col-span-3 min-h-[500px] flex flex-col justify-between transition-all duration-300 hover:shadow-md">
          
          <div className="space-y-4">
            {activeSection === 'about_usg' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider">
                  <Bookmark className="h-4 w-4 text-emerald-600" /> About University Student Government (USG)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The CSUCC University Student Government is the supreme student governing body of the campus. It is established to protect student rights, foster democratic learning environments, and supervise university student organizations while pushing forward transparent representation.
                </p>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block mb-1">Core Mandate</span>
                  <p className="text-[11px] text-slate-500">To interface dynamically with university executives and champion equitable administrative, academic, and student affairs modifications across the institution.</p>
                </div>
              </div>
            )}

            {activeSection === 'lsg' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider">
                  <Users className="h-4 w-4 text-emerald-600" /> Local Student Government (LSG)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The Local Student Governments act as college-centered representation bodies tailored to handle departmental concerns. Each independent student department operates under its distinct Local Student Council flag.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg font-semibold text-slate-700 text-center">CBA LSG</div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg font-semibold text-slate-700 text-center">CEIT LSG</div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg font-semibold text-slate-700 text-center">CITTE LSG</div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg font-semibold text-slate-700 text-center">CTHM LSG</div>
                </div>
              </div>
            )}

            {activeSection === 'dlhs_ssg' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider">
                  <Award className="h-4 w-4 text-emerald-600" /> DLHS Supreme Secondary Student Government (SSG)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The Department of Laboratory High School Supreme Student Government oversees the developmental secondary high school studentrs at CSUCC. They specialize in intermediate leadership modeling, academic meets, and high-school activity.
                </p>
              </div>
            )}

            {activeSection === 'comelec' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider">
                  <Scale className="h-4 w-4 text-emerald-600" /> CSUCC USG COMELEC
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The Commission on Elections (COMELEC) is an independent statutory constitutional commission tasked to oversee institutional voter registries, candidate screenings, student electoral debates, and the processing of secure polling databases during annual leadership renewals.
                </p>
                <div className="border border-amber-200 bg-amber-50/40 text-amber-900 p-2.5 rounded-xl text-[11px] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                  <span>Electoral windows are managed autonomously under commission-defined provisions.</span>
                </div>
              </div>
            )}

            {activeSection === 'coa' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> CSUCC USG COA
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The Commission on Audit (COA) is the supreme internal fiscal watchdog within the USG ecosystem. They verify liquidity allocations, validate treasury receipt columns post campus events, and audit mandatory student group funding sheets to maintain transparency.
                </p>
              </div>
            )}

            {activeSection === 'charter' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider">
                  <FileText className="h-4 w-4 text-emerald-600" /> CSUCC Student Citizen's Charter
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The Citizen's Charter streamlines the turn-around times for campus public transactions. It ensures efficiency in service delivery across student applications, uniform distribution, financial clearings, and permit issuances.
                </p>
                <table className="w-full text-left text-[11px] border border-slate-100 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                      <th className="p-2">Service Type</th>
                      <th className="p-2">Turnaround Time</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-500 divide-y divide-slate-100">
                    <tr>
                      <td className="p-2">Organization Accreditation</td>
                      <td className="p-2">3–5 Working Days</td>
                    </tr>
                    <tr>
                      <td className="p-2">Event Permit Endorsement</td>
                      <td className="p-2">24–48 Hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeSection === 'services' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider">
                  <HeartHandshake className="h-4 w-4 text-emerald-600" /> Student Services Hub
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your entry point into university-funded student initiatives and welfare programs designed to assist your academic journey:
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
                  <li>Locker Rentals & Equipment Borrowing Pipelines</li>
                  <li>Student Grievance & Legal Representation Desk</li>
                  <li>Emergency Student Financial Aid Contingency Coordination</li>
                  <li>Co-Curricular Group Accreditation and Resource Distribution</li>
                </ul>
              </div>
            )}
          </div>

          {/* LOWER TREE VISUAL DISPLAY FRAME */}
          <div className="mt-6 border-t border-slate-100 pt-5 space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800">{currentGroup.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{currentGroup.description}</p>
              </div>
              
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/60 shrink-0">
                <button
                  onClick={() => setActiveTab('executive')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${
                    activeTab === 'executive' 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  Executive Tree
                </button>
                <button
                  onClick={() => setActiveTab('lowerhouse')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${
                    activeTab === 'lowerhouse' 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  Lowerhouse Tree
                </button>
              </div>
            </div>

            {/* PRESENTABLE REGISTRY SYSTEM DEPLOYED TREE VISUAL CANVAS */}
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-6 flex flex-col items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

              {/* LEVEL 1: LEADER COMMAND NODE */}
              <div className="relative z-10 flex flex-col items-center group">
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-white shadow-md rounded-xl p-3.5 w-52 text-center transform transition-transform duration-300 hover:-translate-y-0.5">
                  <div className="mx-auto w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5 shadow-sm">
                    <Crown className="h-3.5 w-3.5 animate-pulse" />
                  </div>
                  <h4 className="text-xs font-black tracking-tight">{currentGroup.leader.name}</h4>
                  <div className="mt-1 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest">{currentGroup.leader.role}</span>
                    <span className="text-[8px] text-slate-500 font-medium font-mono px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded mt-1">{currentGroup.leader.program}</span>
                  </div>
                </div>

                {/* HIERARCHICAL STEM DIRECTION INDICATOR */}
                <div className="w-0.5 h-6 bg-slate-300 relative">
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-slate-300 rounded-full" />
                </div>
              </div>

              {/* LEVEL 2: LOWER HOVER REPRESENTATIVE TIERS */}
              <div className="relative w-full z-10 pt-2">
                {/* Horizontal connection bar spanning the width of secondary units */}
                <div className="absolute top-0 left-12 right-12 h-0.5 bg-slate-300 rounded" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center pt-4">
                  {currentGroup.officers.map((officer, index) => (
                    <div key={index} className="relative bg-white border border-slate-200 hover:border-emerald-500/30 shadow-xs hover:shadow-md rounded-xl p-3 w-44 text-center transition-all duration-300 group flex flex-col justify-between items-center">
                      {/* Vertical line from card up to horizontal axis banner */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-slate-300" />
                      
                      <div className="w-full">
                        <div className="mx-auto w-5 h-5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center mb-1 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-600 transition-colors">
                          <Star className="h-3 w-3" />
                        </div>
                        <h5 className="text-[11px] font-bold text-slate-800 leading-tight tracking-tight group-hover:text-emerald-950 transition-colors">{officer.name}</h5>
                        <p className="text-[9px] text-emerald-700 font-bold tracking-wide mt-0.5">{officer.role}</p>
                        <p className="text-[8px] text-slate-400 font-medium tracking-tight">{officer.subRole}</p>
                      </div>

                      <div className="mt-2 w-full pt-1.5 border-t border-slate-100 text-[8px] font-mono font-bold text-slate-500 bg-slate-50/50 py-0.5 rounded">
                        {officer.program}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ================= 3. TWO-COLUMN PORTAL EVENTS & ANNOUNCEMENTS LAYOUT ================= */}
      <div className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ animationDelay: '200ms' }}>
        
        {/* ================= LEFT / MAIN HUB CONTENT ================= */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* CAMPUS ANNOUNCEMENTS BULLETIN FEED */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 transition-all duration-300 hover:shadow-sm">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">
              <Megaphone className="h-4 w-4 text-emerald-600" /> Official Campus Announcements
            </div>
            <p className="text-xs text-slate-500 mb-4">Stay informed with real-time news, advisories, and updates directly from the USG.</p>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 space-y-2 shadow-inner">
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
                  <div 
                    key={item.id} 
                    className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 transition-all duration-300 hover:border-slate-300 hover:shadow-md overflow-hidden"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.category || 'General Advisory'}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <Clock className="h-3 w-3" /> {formatTime(item.created_at)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-800 tracking-tight">{item.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                    </div>

                    {item.image_url && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 max-h-72 flex items-center justify-center">
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-500 ease-out"
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

          {/* CAMPUS ABOUT US STRIP */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 transition-all duration-300 hover:shadow-sm">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-600" /> Caraga State University Cabadbaran Campus
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This portal serves as an interactive ecosystem deployed for students to interact directly with internal campus commission bodies, review regulatory timelines, and maintain a highly verified line of dialogue with local councils.
              </p>
            </div>
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>USG Portal v1.2.0</span>
              <span>Secure SSL Registry Link</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT / SIDEBAR PUBLIC CHANNELS ================= */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* HIGH-GRAPHICS USG HELPDESK CARD */}
          <div className="bg-slate-900 text-white border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg relative overflow-hidden group">
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <span className="text-slate-100 font-black text-xs uppercase tracking-wider">USG Help Desk</span>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                Live Support
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Have concerns regarding local structural policies, clearance exceptions, or financial audits? Reach out directly to our help channels:
            </p>
            
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 transform hover:translate-x-1">
                <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/10">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Official Email</span>
                  <span className="truncate font-mono text-[11px] text-slate-300">usg@csucc.edu.ph</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 transform hover:translate-x-1">
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
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3.5 shadow-sm transition-all duration-300 hover:shadow-md">
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
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-500/20 text-slate-700 hover:text-emerald-900 transition-all duration-200 group text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors shrink-0" />
                  <span className="truncate">MySchool Student Portal</span>
                </div>
                <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0" />
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
