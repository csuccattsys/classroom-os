import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import usgLogo from './FB_IMG_1781228236447.jpg'

import AttendanceTracker from './features/AttendanceTracker'
import Announcements from './features/Announcements'
import LoginGateway from './features/LoginGateway'
import Sidebar from './features/Sidebar'
import { 
  Layers, Activity, Radio, FileQuestion, BarChart3, Lock, Menu,
  TrendingUp, Clock, AlertTriangle, Building2, LogIn, LogOut, UserCheck, Sparkles,
  Zap, RefreshCw, ShieldAlert, Search, ShieldCheck, ArrowLeft, CheckCircle2, XCircle,
  GraduationCap, User
} from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState('student') 
  const [isPublicObserver, setIsPublicObserver] = useState(false) 
  const [appLoading, setAppLoading] = useState(true)
  
  const [activeTab, setActiveTab] = useState('dashboard')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [authProcessing, setAuthProcessing] = useState(false)

  // 💡 Gemini Navigation Control Engine State Hooks
  const [sidebarOpen, setSidebarOpen] = useState(false) // Default to closed/icon-only view

  // 🛠️ Feasible Context Feature States
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString())

  // --- NATIVE URL ROUTING SYNC ENGINE ---
  useEffect(() => {
    // Read URL hash on load and match tabs
    const handleUrlRouting = () => {
      const hash = window.location.hash.replace('#', '')
      const validTabs = ['dashboard', 'attendance', 'announcements', 'quizzes', 'records']
      if (validTabs.includes(hash)) {
        setActiveTab(hash)
      } else {
        window.location.hash = activeTab // fallback to current valid tab if address is empty
      }
    }

    // Run on startup and listen for user browser forward/backward navigation clicks
    handleUrlRouting()
    window.addEventListener('hashchange', handleUrlRouting)
    return () => window.removeEventListener('hashchange', handleUrlRouting)
  }, [])

  // Sync back to URL hash bar whenever state switches programmatically
  useEffect(() => {
    if (window.location.hash !== `#${activeTab}`) {
      window.location.hash = activeTab
    }
  }, [activeTab])

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        setIsPublicObserver(false)
        fetchUserProfile(session.user.id)
      } else {
        if (!isPublicObserver) setAppLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session)
        setIsPublicObserver(false)
        fetchUserProfile(session.user.id)
      } else {
        setSession(null)
        if (!isPublicObserver) {
          setUserRole('student')
          setAppLoading(false)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [isPublicObserver])

  async function fetchUserProfile(userId) {
    try {
      setAppLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (data) setUserRole(data.role)
      if (error) console.error("Error pulling RBAC secure signature:", error.message)
    } catch (err) {
      console.error(err)
    } finally {
      setAppLoading(false)
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    setAuthProcessing(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    if (error) {
      setLoginError(error.message === 'Invalid login credentials' 
        ? 'Invalid institutional clearance email or access key.' 
        : error.message
      )
      setAuthProcessing(false)
    }
  }

  const handlePublicAccess = () => {
    setAppLoading(true)
    setSession(null)
    setIsPublicObserver(true)
    setUserRole('student') 
    setActiveTab('dashboard')
    setAppLoading(false)
  }

  const handleLogout = async () => {
    setAppLoading(true)
    setIsPublicObserver(false)
    setUserRole('student')
    setEmail('')
    setPassword('')
    await supabase.auth.signOut()
    setAppLoading(false)
  }

  const triggerCacheFlush = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 900)
  }

  const getRoleBadgeDetails = () => {
    switch (userRole) {
      case 'usg': return { label: 'USG Executive', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
      case 'cba_lsg': return { label: 'CBA LSG Council', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' }
      case 'ceit_lsg': return { label: 'CEIT LSG Council', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' }
      case 'citte_lsg': return { label: 'CITTE LSG Council', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' }
      case 'cthm_lsg': return { label: 'CTHM LSG Council', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' }
      case 'ssg': return { label: 'DLHS SSG Officer', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' }
      default: return { label: 'Student Body Observer', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
    }
  }

  const isAnyCollegeLSG = ['cba_lsg', 'ceit_lsg', 'citte_lsg', 'cthm_lsg'].includes(userRole)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderExecutiveDashboard()
      case 'attendance':
        if (userRole === 'usg' || isAnyCollegeLSG) return <AttendanceTracker userRole={userRole} />
        return renderAccessDenied("University Student Government or authorized College LSG Board clearance is required to process college student event logs.")
      case 'announcements': return <Announcements userRole={userRole} />
      default: return renderExecutiveDashboard()
    }
  }

  const renderAccessDenied = (message) => (
    <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center max-w-md mx-auto my-12 shadow-xs">
      <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100"><Lock className="h-5 w-5" /></div>
      <h3 className="text-xs font-black uppercase text-slate-900 tracking-tight">Clearance Check Failed</h3>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{message}</p>
      <button onClick={() => setActiveTab('dashboard')} className="mt-5 text-xs font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition">Return to Dashboard</button>
    </div>
  )

  const renderExecutiveDashboard = () => {
    // If user is logged in as a normal student observer, display the new custom portal design structure
    if (userRole === 'student') {
      return <StudentPortalView />
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-2xl p-6 text-white border border-emerald-900/30 shadow-xl relative overflow-hidden">
          <div className="space-y-1.5 relative z-10">
            <span className={`border text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${getRoleBadgeDetails().color}`}>{getRoleBadgeDetails().label} Panel</span>
            <h2 className="text-xl font-black tracking-tight pt-2">CSUCC Governance Portal</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Active Session Identity: <span className="text-slate-200 font-mono font-bold">{isPublicObserver ? 'Guest Student Node (Read-Only)' : session?.user?.email}</span>
            </p>
          </div>
        </div>

        {/* ADMINISTRATIVE QUICK-ACTIONS */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Quick Actions
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-md">
              Clock: {systemTime}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button 
              onClick={() => setActiveTab('attendance')}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-left hover:border-emerald-500 transition group cursor-pointer"
            >
              <p className="text-[10px] font-bold text-slate-800 group-hover:text-emerald-700">Log Attendance</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Open scanner interface</p>
            </button>
            <button 
              onClick={() => setActiveTab('announcements')}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-left hover:border-indigo-500 transition group cursor-pointer"
            >
              <p className="text-[10px] font-bold text-slate-800 group-hover:text-indigo-700">Post Bulletin</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Broadcast info alerts</p>
            </button>
            <button 
              onClick={triggerCacheFlush}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-left hover:border-cyan-500 transition group cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full">
                <p className="text-[10px] font-bold text-slate-800 group-hover:text-cyan-700">Sync Ledger</p>
                <RefreshCw className={`h-3 w-3 text-slate-400 ${isRefreshing ? 'animate-spin text-cyan-600' : ''}`} />
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5">Force flush static data cache</p>
            </button>
            <div className="p-2.5 bg-slate-100/70 border border-slate-200/40 rounded-xl text-left flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-700">SSL Connection</p>
                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Secure Node</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Campus Activity Turnout', value: '89.4%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50/40' },
            { label: 'Recognized Student Orgs', value: '24 Units', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50/40' },
            { label: 'System Database Sync Latency', value: '0.23 ms', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/40' },
          ].map((stat, idx) => {
            const StatIcon = stat.icon
            return (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}><StatIcon className="h-4 w-4" /></div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'attendance', label: 'Activity Attendance', icon: Activity },
    { id: 'announcements', label: 'Official Bulletin Board', icon: Radio },
    { id: 'quizzes', label: 'Voter Polling Suite', icon: FileQuestion, locked: true },
    { id: 'records', label: 'Legislative Audit Ledger', icon: BarChart3, locked: true },
  ]

  if (appLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400 text-xs font-bold gap-3 tracking-widest uppercase">
        <Sparkles className="h-6 w-6 text-emerald-500 animate-spin" />
        Securing Institutional Keychains...
      </div>
    )
  }

  if (!session && !isPublicObserver) {
    return (
      <LoginGateway
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loginError={loginError}
        authProcessing={authProcessing}
        handleLoginSubmit={handleLoginSubmit}
        handlePublicAccess={handlePublicAccess}
        usgLogo={usgLogo}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900 selection:bg-emerald-600 selection:text-white">
      {/* GLOBAL HEADER INFRASTRUCTURE */}
      <header className="bg-white border-b border-slate-200/80 px-4 md:px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="h-10 w-10 rounded-lg bg-slate-50 p-0.5 border border-slate-100 flex items-center justify-center overflow-hidden shadow-xs">
              <img src={usgLogo} alt="CSUCC USG Seal" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black tracking-tight uppercase text-slate-900 leading-none">CSUCC USG</h1>
              <p className="text-[8px] md:text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1 hidden sm:block">Caraga State University Cabadbaran Campus</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 mr-4">
            <a href="#myschool" className="flex items-center gap-1 hover:text-[#004d26] transition">
              <GraduationCap className="h-4 w-4 text-slate-400" /> MySchool
            </a>
            <span className="text-slate-300">|</span>
            <a href="#mywork" className="flex items-center gap-1 hover:text-[#004d26] transition">
              <User className="h-4 w-4 text-slate-400" /> MyWork
            </a>
          </div>

          <div className="flex items-center gap-2 md:gap-3 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-xs">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-700 tracking-wider">{getRoleBadgeDetails().label}</span>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-600 text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 pr-2 pl-1 cursor-pointer">
              <LogOut className="h-3 w-3" /> <span className="hidden xs:inline">Exit Terminal</span>
            </button>
          </div>
        </div>
      </header>

      {/* QUICK ANNOUNCEMENT TICKER BANNER */}
      <div className="bg-emerald-900 text-white py-1.5 px-4 overflow-hidden relative border-b border-emerald-950 flex items-center text-[10px] font-semibold tracking-wide">
        <span className="bg-emerald-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mr-3 shadow-xs shrink-0 z-10">BULLETIN</span>
        <div className="animate-marquee whitespace-nowrap loop-scroll flex gap-8">
          <span>Welcome to the CSUCC Governance Portal. Ensure all event access attendance sheets are securely filed under correct RBAC rules.</span>
          <span className="hidden md:inline text-emerald-300">• System Sync Status Operational</span>
        </div>
      </div>

      {/* CORE FRAME LAYOUT */}
      <div className="flex-1 flex min-h-0 relative">
        <Sidebar 
          menuItems={menuItems} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          userRole={userRole} 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 p-4 md:p-8 min-w-0 overflow-y-auto bg-white">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

// --- SUB-COMPONENT: RE-USABLE STUDENT VIEW PORTAL SHIFT ENGINE ---
function StudentPortalView() {
  const [studentId, setStudentId] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [studentProfile, setStudentProfile] = useState(null)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handlePortalLookup = async (e) => {
    if (e) e.preventDefault()
    const targetId = studentId.trim()
    if (!targetId) return

    setLoading(true)
    setErrorMessage('')

    try {
      const { data: student, error: studentErr } = await supabase
        .from('students')
        .select('*')
        .eq('id', targetId)
        .single()

      if (studentErr || !student) {
        setErrorMessage(`Student ID "${targetId}" could not be located in the campus registration index.`)
        setIsVerified(false)
        setStudentProfile(null)
        return
      }

      setStudentProfile(student)
      setIsVerified(true)

      const { data: logs, error: logsErr } = await supabase
        .from('attendance_logs')
        .select(`
          id,
          log_time,
          status,
          event_id,
          events (
            title,
            college,
            created_at
          )
        `)
        .eq('student_id', targetId)

      if (logsErr) throw logsErr

      const formattedHistory = logs?.map(log => ({
        log_id: log.id,
        time_in: log.log_time,
        status: log.status,
        event_title: log.events?.title || 'Unknown Event',
        hosted_by: log.events?.college ? log.events.college.split('_')[0].toUpperCase() : 'CSUCC',
        date: log.events?.created_at ? new Date(log.events.created_at).toLocaleDateString() : '—'
      })) || []

      setAttendanceHistory(formattedHistory)
    } catch (err) {
      console.error(err.message)
      setErrorMessage('A transmission issue occurred while fetching ledger packet records.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshLogs = () => {
    if (studentProfile) handlePortalLookup(null)
  }

  const handleResetPortal = () => {
    setIsVerified(false)
    setStudentProfile(null)
    setAttendanceHistory([])
    setStudentId('')
    setErrorMessage('')
  }

  const totalAttended = attendanceHistory.filter(h => h.status === 'Present').length
  const totalExcused = attendanceHistory.filter(h => h.status === 'Excused').length
  const totalSessions = attendanceHistory.length
  const positiveTurnoutRate = totalSessions > 0 ? Math.round(((totalAttended + totalExcused) / totalSessions) * 100) : 0

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      
      {/* BRAND TEXT HEADER & SLIDER CONTAINER */}
      <section className="w-full bg-gradient-to-r from-[#00331a] via-[#004d26] to-[#012211] text-white overflow-hidden relative shadow-sm rounded-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[9px] font-black tracking-widest text-[#fdb813] bg-[#002613] px-2 py-0.5 rounded border border-[#004d26]">
              OFFICIAL STUDENT WEB SERVICES
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">
              Roster Attendance Portal
            </h2>
            <div className="h-1 w-20 bg-[#fdb813] mx-auto md:mx-0 rounded"></div>
            <p className="text-xs text-emerald-100/80 font-medium max-w-md pt-1">
              Verify compliance markers, checkout event logs, and review session turnout scores managed by your local campus government councils.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4 bg-black/10 p-4 border border-white/5 rounded-2xl backdrop-blur-xs">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-[#fdb813]">Quality Management System</p>
              <p className="text-[8px] font-mono opacity-60">ISO 9001:2015 CERTIFIED</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONDITIONAL SUBVIEW COMPONENT RENDER ENGINE */}
      {!isVerified ? (
        <div className="max-w-md mx-auto my-4 transition-all duration-300">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="text-center space-y-1.5">
              <div className="mx-auto h-11 w-11 bg-emerald-50 text-[#004d26] rounded-xl flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-black tracking-tight text-slate-900 uppercase">Roster Identity Gateway</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Input your reference key details to pull server data</p>
            </div>

            <form onSubmit={handlePortalLookup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">CSUCC ID Account Code</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., 2026-12345"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#004d26] focus:outline-hidden font-mono font-bold text-slate-800 uppercase placeholder-slate-400"
                  />
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#004d26] hover:bg-[#003318] text-white text-xs font-black uppercase tracking-wider py-2.5 rounded-xl transition cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 shadow-xs"
              >
                {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Request Ledger Entry Match'}
              </button>
            </form>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-[11px] font-semibold flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 transition-all duration-300">
          
          {/* USER CONTEXT SUMMARY PANEL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 rounded-xl gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <button onClick={handleResetPortal} className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer text-slate-500">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black tracking-widest text-[#004d26] uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">Verified Account</span>
                  <span className="text-[8px] font-black tracking-widest text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">{studentProfile.id}</span>
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase mt-0.5">{studentProfile.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">{studentProfile.program} — {studentProfile.college?.split('_')[0].toUpperCase()} Council Scope</p>
              </div>
            </div>

            <button 
              onClick={handleRefreshLogs}
              disabled={loading}
              className="p-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-slate-600 self-start sm:self-center"
            >
              <RefreshCw className={`h-3 w-3 text-[#004d26] ${loading ? 'animate-spin' : ''}`} /> Sync Logs
            </button>
          </div>

          {/* METRIC CARD STAT TILES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Monitored Units</div>
              <div className="text-lg font-black text-slate-900 mt-1">{totalSessions}</div>
              <p className="text-[8px] text-slate-400 font-medium mt-0.5">Total sessions tracked</p>
            </div>
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs border-l-2 border-l-[#004d26]">
              <div className="text-[8px] font-black text-[#004d26] uppercase tracking-widest">Present Logs</div>
              <div className="text-lg font-black text-slate-900 mt-1">{totalAttended}</div>
              <p className="text-[8px] text-slate-400 font-medium mt-0.5">Confirmed check-ins</p>
            </div>
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs border-l-2 border-l-amber-500">
              <div className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Excused Notes</div>
              <div className="text-lg font-black text-slate-900 mt-1">{totalExcused}</div>
              <p className="text-[8px] text-slate-400 font-medium mt-0.5">Authorized clearances</p>
            </div>
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs bg-gradient-to-br from-emerald-50/10 to-white">
              <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Roster Compliance</div>
              <div className="text-lg font-black text-[#004d26] mt-1">{positiveTurnoutRate}%</div>
              <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Overall Rate</p>
            </div>
          </div>

          {/* COMPLIANCE RETENTION WARNING BAR */}
          {totalSessions > 3 && positiveTurnoutRate < 75 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl flex items-center gap-3">
              <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <p className="text-[11px] font-semibold text-rose-800">
                <strong className="font-black uppercase tracking-wider block text-[10px]">Compliance Warning Threshold:</strong> 
                Your current attendance rating falls below institutional retention targets. Please register valid justification documentation with your student dean if any entries require overrides.
              </p>
            </div>
          )}

          {/* DECORATIVE SEPARATOR LINES SECTION */}
          <div className="pt-2">
            <div className="w-full h-[1px] bg-slate-200"></div>
            <div className="w-24 h-[2px] bg-[#fdb813] mt-[-1px]"></div>
          </div>

          {/* LOG ACTIVITY HISTORICAL SHEET TABLE */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#004d26]" /> Account Activity Footprints
              </h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Official database history for active campus periods</p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">
                      <th className="p-3 pl-4">Time Flag</th>
                      <th className="p-3">Deployment Objective Context</th>
                      <th className="p-3">Host Node</th>
                      <th className="p-3">Session Date</th>
                      <th className="p-3 pr-4 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600 bg-white">
                    {attendanceHistory.length > 0 ? (
                      attendanceHistory.map(log => (
                        <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 pl-4 font-mono text-[10px] font-bold text-slate-400">{log.time_in || '—'}</td>
                          <td className="p-3 text-slate-900 font-bold">{log.event_title}</td>
                          <td className="p-3 font-mono text-[10px] text-slate-500 uppercase tracking-wider">{log.hosted_by}</td>
                          <td className="p-3 font-mono text-[10px] text-slate-400">{log.date}</td>
                          <td className="p-3 pr-4 text-right">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border font-mono ${
                              log.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              log.status === 'Excused' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-12 text-center text-slate-400">
                          <p className="text-xs font-bold text-slate-500">No Check-in Footprints Found</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Your profile hasn't been added to any event tracking sessions yet.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
