import React, { useState } from 'react'
import AttendanceTracker from './features/AttendanceTracker'
import Announcements from './features/Announcements'
import { 
  Shield, 
  Layers, 
  Activity, 
  Radio, 
  FileQuestion, 
  BarChart3, 
  Lock, 
  Eye, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Building2
} from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  // Dynamic University RBAC System State
  const [userRole, setUserRole] = useState('executive') // 'executive' | 'legislative' | 'student'

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderExecutiveDashboard()
      case 'attendance':
        // RBAC Security Gate: Block regular students from accessing event attendance rosters
        if (userRole === 'student') {
          return renderAccessDenied("Executive Council or Legislative Board credentials are required to modify official student activity logs.")
        }
        return <AttendanceTracker />
      case 'announcements':
        return <Announcements />
      default:
        return renderExecutiveDashboard()
    }
  }

  // Institutional Security Gate Intercept UI
  const renderAccessDenied = (message) => (
    <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center max-w-md mx-auto my-12 shadow-sm animate-fade-in">
      <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
        <Lock className="h-5 w-5" />
      </div>
      <h3 className="text-xs font-black uppercase text-slate-900 tracking-tight">Clearance Check Failed</h3>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{message}</p>
      <button 
        onClick={() => setActiveTab('dashboard')}
        className="mt-5 text-xs font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition"
      >
        Return to Core Terminal
      </button>
    </div>
  )

  // Institutional Executive Dashboard Layout
  const renderExecutiveDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Premium Institutional Banner Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-2xl p-6 text-white border border-emerald-900/30 shadow-xl relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
            Executive Command Hub
          </span>
          <h2 className="text-xl font-black tracking-tight pt-2">CSUCC USG Management System</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Welcome back. Active session authorized under clear signature: <span className="text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{userRole} council</span>.
          </p>
        </div>
      </div>

      {/* University Metric Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Campus Activity Turnout', value: '89.4%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50/40' },
          { label: 'Recognized Student Orgs', value: '24 Units', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50/40' },
          { label: 'System Database Sync Latency', value: '0.23 ms', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/40' },
        ].map((stat, idx) => {
          const StatIcon = stat.icon
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <StatIcon className="h-4 w-4" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Governance Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Feed</h3>
            <h4 className="text-sm font-bold text-slate-800 mt-0.5">Real-time Campus Logs</h4>
          </div>
          <div className="space-y-3 text-xs">
            {[
              { time: '14:32', msg: 'Student organization budget proposal summaries routed to audit ledger cluster.', tag: 'Fiscal' },
              { time: '11:15', msg: 'Campus-wide seminar event attendance logging profile instantiated cleanly.', tag: 'Roster' },
              { time: '08:00', msg: 'Secure connection established with Supabase Cloud Postgres cluster instances.', tag: 'Network' }
            ].map((feed, i) => (
              <div key={i} className="flex items-start gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                <span className="font-mono text-slate-400 pt-0.5">{feed.time}</span>
                <p className="text-slate-600 flex-1">{feed.msg}</p>
                <span className="bg-slate-100 text-slate-500 font-mono font-black text-[9px] uppercase px-1.5 py-0.5 rounded">
                  {feed.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Campus RBAC Rules Explanation Card */}
        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="text-xs font-black uppercase tracking-widest">USG Clearance Matrix</h3>
          </div>
          <div className="space-y-3 text-[11px] leading-relaxed">
            <p className="text-slate-400 border-b border-slate-800 pb-2">
              Privileges update fluidly based on the live simulator toggle situated inside the global header.
            </p>
            <div className="space-y-2.5">
              <div>
                <span className="font-bold text-emerald-400 block uppercase tracking-wide">Executive Council</span>
                <span className="text-slate-400">Full administrative data access to manage operations, announcements, and configurations.</span>
              </div>
              <div>
                <span className="font-bold text-indigo-400 block uppercase tracking-wide">Legislative Board</span>
                <span className="text-slate-400">Authorized capability to query registries and log student attendance records.</span>
              </div>
              <div>
                <span className="font-bold text-amber-400 block uppercase tracking-wide">Student Body</span>
                <span className="text-slate-400">Read-only view for bulletins. Prohibited from editing or manipulating data sets.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Unified System Roster Nodes
  const menuItems = [
    { id: 'dashboard', label: 'USG Operations Dashboard', icon: Layers },
    { id: 'attendance', label: 'Activity Attendance Log', icon: Activity },
    { id: 'announcements', label: 'University Bulletins', icon: Radio },
    { id: 'quizzes', label: 'Voter Polling Framework', icon: FileQuestion, locked: true },
    { id: 'records', label: 'Legislative Audit Ledger', icon: BarChart3, locked: true },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-slate-900 selection:bg-emerald-600 selection:text-white">
      
      {/* Rebranded Official Header featuring Logo from FB_IMG_1781228236447.jpg */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Official Branding Logo Integration */}
          <div className="flex items-center gap-3">
            {/* Fallback container targeting the local/uploaded asset image matching FB_IMG_1781228236447.jpg */}
            <div className="h-11 w-11 rounded-lg bg-slate-50 p-0.5 border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
              <img 
                src="/FB_IMG_1781228236447.jpg" 
                alt="CSUCC USG Seal Logo" 
                className="h-full w-full object-contain"
                onError={(e) => {
                  // Fallback design icon if path is unaligned during first build step
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '🛡️';
                }}
              />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase text-slate-900 leading-none">CSUCC USG</h1>
              <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1">Caraga State University Cabadbaran Campus</p>
            </div>
          </div>

          {/* Interactive Live Student Government RBAC Switchboard Controller */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-center border border-slate-200/30">
            <div className="flex items-center gap-1.5 px-2 text-slate-400">
              <Eye className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider hidden lg:inline">Clearance:</span>
            </div>
            {[
              { role: 'executive', label: 'Exec', style: 'peer-checked:bg-emerald-600 peer-checked:text-white text-emerald-600' },
              { role: 'legislative', label: 'Legis', style: 'peer-checked:bg-indigo-600 peer-checked:text-white text-indigo-600' },
              { role: 'student', label: 'Student', style: 'peer-checked:bg-amber-600 peer-checked:text-white text-amber-600' }
            ].map((node) => (
              <label key={node.role} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="usg-rbac-selector"
                  checked={userRole === node.role}
                  onChange={() => setUserRole(node.role)}
                  className="sr-only peer"
                />
                <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${node.style} hover:bg-white/50`}>
                  {node.label}
                </div>
              </label>
            ))}
          </div>

        </div>
      </header>

      {/* Framework Main Canvas Element Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row min-h-0">
        
        {/* Navigation Sidebar Panel */}
        <aside className="w-full md:w-64 bg-white md:border-r border-b border-slate-100 p-4 md:py-6 space-y-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">System Framework Nodes</p>
            <nav className="mt-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {menuItems.map((item) => {
                const IconComponent = item.icon
                const isTabRestricted = item.id === 'attendance' && userRole === 'student'
                
                return (
                  <button
                    key={item.id}
                    disabled={item.locked}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all w-full text-left ${
                      item.locked ? 'opacity-30 cursor-not-allowed' :
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-emerald-600 to-slate-900 text-white shadow-md shadow-emerald-500/10'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-4 w-4 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                      <span className={isTabRestricted ? 'text-slate-400 line-through decoration-rose-500/50' : ''}>
                        {item.label}
                      </span>
                    </div>
                    
                    {item.locked ? (
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Hold</span>
                    ) : isTabRestricted ? (
                      <Lock className="h-3 w-3 text-rose-500" />
                    ) : null}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Primary View Action Main Panel Window Frame */}
        <main className="flex-1 p-4 md:p-8 min-w-0 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

    </div>
  )
}
