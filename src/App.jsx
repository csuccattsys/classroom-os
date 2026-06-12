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
  Zap, RefreshCw, ShieldAlert
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

  const renderExecutiveDashboard = () => (
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
            {/* REMOVED md:hidden - HAMBURGER MENU BUTTON IS ALWAYS VISIBLE NOW */}
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
