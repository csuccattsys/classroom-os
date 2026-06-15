import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import usgLogo from './FB_IMG_1781228236447.jpg'
import { AppRouter, routes } from './router'
import Sidebar from './features/Sidebar'
import { 
  Layers, Activity, Radio, FileQuestion, BarChart3, Menu, LogOut, 
  UserCheck, Sparkles, LogIn, X, Mail, KeyRound, AlertCircle, Loader2, Megaphone, GraduationCap 
} from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState('student') 
  const [isPublicObserver, setIsPublicObserver] = useState(false) 
  const [appLoading, setAppLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [authProcessing, setAuthProcessing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString())
  const [activeToast, setActiveToast] = useState(null)

  // --- GLOBAL REAL-TIME APPLICATION NOTIFICATION LIFECYCLE ---
  useEffect(() => {
    const globalNotificationsChannel = supabase.channel('global:announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        if (!payload?.new) return
        setActiveToast({ title: payload.new.title, content: payload.new.content, publisher: payload.new.publisher || 'USG Admin' })
        setTimeout(() => setActiveToast(null), 5000)
      }).subscribe()
    return () => { supabase.removeChannel(globalNotificationsChannel) }
  }, [])

  // --- NATIVE URL HASH SYNC ROUTER ENGINE ---
  useEffect(() => {
    const handleUrlRouting = () => {
      const hash = window.location.hash.replace('#', '')
      const validTabs = routes.map(r => r.id).concat(['quizzes', 'records', 'students'])
      validTabs.includes(hash) ? setActiveTab(hash) : window.location.hash = activeTab
    }
    handleUrlRouting()
    window.addEventListener('hashchange', handleUrlRouting)
    return () => window.removeEventListener('hashchange', handleUrlRouting)
  }, [])

  useEffect(() => {
    if (window.location.hash !== `#${activeTab}`) window.location.hash = activeTab
  }, [activeTab])

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  // --- IDENTITY VALIDATION & SUPABASE RBAC SECURE SIGNATURE SYNC ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setSession(session); setIsPublicObserver(false); fetchUserProfile(session.user.id); } 
      else { setAppLoading(false); }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) { setSession(session); setIsPublicObserver(false); setIsLoginModalOpen(false); fetchUserProfile(session.user.id); } 
      else { setSession(null); setUserRole('student'); setAppLoading(false); }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserProfile(userId) {
    try {
      setAppLoading(true)
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single()
      if (data) setUserRole(data.role)
      if (error) console.error("Error pulling RBAC secure signature:", error.message)
    } catch (err) { console.error(err) } 
    finally { setAppLoading(false) }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); setLoginError(''); setAuthProcessing(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() })
    if (error) {
      setLoginError(error.message === 'Invalid login credentials' ? 'Invalid institutional clearance email or access key.' : error.message)
      setAuthProcessing(false)
    } else { setAuthProcessing(false) }
  }

  const handleLogout = async () => {
    setAppLoading(true); setIsPublicObserver(false); setUserRole('student'); setEmail(''); setPassword('');
    setActiveTab('dashboard'); window.location.hash = 'dashboard';
    await supabase.auth.signOut(); setAppLoading(false);
  }

  const triggerCacheFlush = () => {
    setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 900)
  }

  const getRoleHeaderLabel = () => {
    if (userRole === 'student') return 'Student Observer'
    return userRole === 'usg' ? 'USG Executive' : 'Council Board Admin'
  }

  const forwardProps = {
    userRole, session, isPublicObserver, systemTime, setActiveTab, triggerCacheFlush,
    isRefreshing, email, setEmail, password, setPassword, loginError, authProcessing, handleLoginSubmit
  }

  const menuItems = session ? [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'attendance', label: 'Activity Attendance', icon: Activity },
    { id: 'announcements', label: 'Official Bulletin Board', icon: Radio },
    { id: 'students', label: 'College Directory', icon: GraduationCap },
    { id: 'quizzes', label: 'Voter Polling Suite', icon: FileQuestion, locked: true },
    { id: 'records', label: 'Legislative Audit Ledger', icon: BarChart3, locked: true },
  ] : []

  if (appLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400 text-xs font-bold gap-3 tracking-widest uppercase">
        <Sparkles className="h-6 w-6 text-emerald-500 animate-spin" /> Securing Institutional Keychains...
      </div>
    )
  }

  const inputStyles = "w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
  const labelStyles = "text-[9px] font-black uppercase tracking-widest text-slate-400 block"

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900 selection:bg-emerald-600 selection:text-white relative">
      {activeToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] w-11/12 max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white p-4 rounded-2xl shadow-2xl flex gap-3 animate-slide-down transition-all duration-300">
          <div className="h-9 w-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20"><Megaphone className="h-4 w-4" /></div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{activeToast.publisher}</span>
              <span className="text-[9px] text-slate-500 font-medium">Just Now</span>
            </div>
            <h4 className="text-xs font-bold text-slate-100 truncate mt-0.5">{activeToast.title}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-normal">{activeToast.content}</p>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200/80 px-4 md:px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"><Menu className="h-5 w-5" /></button>
            <div className="h-10 w-10 rounded-lg bg-slate-50 p-0.5 border border-slate-100 flex items-center justify-center overflow-hidden shadow-xs">
              <img src={usgLogo} alt="CSUCC USG Seal" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black tracking-tight uppercase text-slate-900 leading-none">CSUCC Student Governance Portal</h1>
              <p className="text-[8px] md:text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1 hidden sm:block">Caraga State University Cabadbaran Campus</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/60 shadow-inner">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200/40 shadow-xs">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-700 tracking-wider">{getRoleHeaderLabel()}</span>
            </div>
            {!session ? (
              <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-1 text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200/80 px-3 py-1.5 rounded-lg transition-all duration-200 text-[9px] md:text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-xs">
                <LogIn className="h-3 w-3" /> <span>Portal Log In</span>
              </button>
            ) : (
              <button onClick={handleLogout} className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1 cursor-pointer">
                <LogOut className="h-3 w-3" /> <span className="hidden xs:inline">Exit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="bg-emerald-900 text-white py-1.5 px-4 overflow-hidden relative border-b border-emerald-950 flex items-center text-[10px] font-semibold tracking-wide">
        <span className="bg-emerald-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mr-3 shadow-xs shrink-0 z-10">BULLETIN</span>
        <div className="animate-marquee whitespace-nowrap loop-scroll flex gap-8">
          <span>Welcome to the CSUCC Governance Portal. Ensure all event access attendance sheets are securely filed under correct RBAC rules.</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 relative">
        {menuItems.length > 0 && (
          <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}
        <main className="flex-1 p-4 md:p-8 min-w-0 overflow-y-auto bg-white">
          <div className="max-w-5xl mx-auto">
            <AppRouter activeTab={activeTab} setActiveTab={setActiveTab} routeProps={forwardProps} />
          </div>
        </main>
      </div>

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4">
            <button onClick={() => { setIsLoginModalOpen(false); setLoginError(''); }} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800"><X className="h-4 w-4" /></button>
            <div className="space-y-1">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2"><Sparkles className="h-4 w-4 animate-pulse" /></div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">Executive Gateway Login</h3>
              <p className="text-xs text-slate-400 leading-relaxed">USG Officers and Local Council board members can sign in below to verify institutional RBAC permissions.</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className={labelStyles}>User Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="username@csucc.edu.ph" className={inputStyles} />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelStyles}>Access Key Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputStyles} />
                </div>
              </div>
              {loginError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl flex items-start gap-2 text-[10px] leading-normal font-medium animate-shake"><AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>{loginError}</span></div>
              )}
              <button type="submit" disabled={authProcessing} className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-slate-800 text-slate-900 disabled:text-slate-500 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer mt-4">
                {authProcessing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Validating Security Node...</> : 'Authorize Terminal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
