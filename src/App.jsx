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
  AlertTriangle 
} from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  // RBAC Authentication Clearance State
  const [userRole, setUserRole] = useState('administrator') // 'administrator' | 'instructor' | 'student'

  // Dynamic Content Router controlled by RBAC matrix
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderExecutiveDashboard()
      case 'attendance':
        // RBAC Check: Block students from accessing live attendance taking logs
        if (userRole === 'student') {
          return renderAccessDenied("Instructor or Administrator privileges required to write to live attendance nodes.")
        }
        return <AttendanceTracker />
      case 'announcements':
        return <Announcements />
      default:
        return renderExecutiveDashboard()
    }
  }

  // Access Denied Screen Component
  const renderAccessDenied = (message) => (
    <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center max-w-md mx-auto my-12 shadow-sm animate-fade-in">
      <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
        <Lock className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">Security Clearance Blocked</h3>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{message}</p>
      <button 
        onClick={() => setActiveTab('dashboard')}
        className="mt-5 text-xs font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 transition"
      >
        Return to Neutral Terminal
      </button>
    </div>
  )

  // Immersive Executive Analytics Landing Dashboard
  const renderExecutiveDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Visual Identity Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Shield className="h-32 w-32" />
        </div>
        <div className="space-y-1 relative z-10">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
            System Operational Hub
          </span>
          <h2 className="text-xl font-black tracking-tight pt-2">Welcome to EduShield</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Active clearance signature logged as <span className="text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{userRole}</span>. Cross-referencing current cluster matrix.
          </p>
        </div>
      </div>

      {/* Analytics Counter Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Network Attendance Rate', value: '94.2%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50/30' },
          { label: 'Active Roster Quotas', value: '1,420 Enrolled', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50/30' },
          { label: 'System Flag Latency', value: '0.4 ms', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50/30' },
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

      {/* Live System Log Stream & Role Matrix Rules Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">System Performance Feed</h3>
            <h4 className="text-sm font-bold text-slate-800 mt-0.5">Real-Time Core Gateway Actions</h4>
          </div>
          <div className="space-y-3 text-xs">
            {[
              { time: '09:14', msg: 'Database handshake complete via Supabase Client framework.', tag: 'Secure' },
              { time: '08:45', msg: 'Attendance ledger metrics parsed for current active calendar session.', tag: 'Sync' },
              { time: '07:02', msg: 'Global RBAC operational permission criteria refreshed successfully.', tag: 'System' }
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

        {/* RBAC Rules Definition Matrix Panel */}
        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="text-xs font-black uppercase tracking-widest">RBAC Permission Matrix</h3>
          </div>
          <div className="space-y-3 text-[11px] leading-relaxed">
            <p className="text-slate-400 border-b border-slate-800 pb-2">
              Permissions adapt cleanly based on the simulated toggle located in the upper header navigation.
            </p>
            <div className="space-y-2">
              <div>
                <span className="font-bold text-blue-400 block uppercase tracking-wide">Administrator</span>
                <span className="text-slate-400">Unrestricted query and mutation access on all system partitions.</span>
              </div>
              <div>
                <span className="font-bold text-purple-400 block uppercase tracking-wide">Instructor</span>
                <span className="text-slate-400">Allowed full read/write capabilities across student attendance logs.</span>
              </div>
              <div>
                <span className="font-bold text-emerald-400 block uppercase tracking-wide">Student</span>
                <span className="text-slate-400">Read-only permissions for broadcasts. Attendance logs access is strictly restricted.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // System Control Navigation Node Array
  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: Layers },
    { id: 'attendance', label: 'Attendance Tracker', icon: Activity },
    { id: 'announcements', label: 'Broadcast Bulletins', icon: Radio },
    { id: 'quizzes', label: 'Quiz Engine Framework', icon: FileQuestion, locked: true },
    { id: 'records', label: 'Analytics Grade Ledger', icon: BarChart3, locked: true },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-slate-900 selection:bg-blue-500 selection:text-white">
      
      {/* Rebranded Header Structure with Live RBAC Controller Switch */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo Brand Title Group */}
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 h-9 w-9 rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase text-slate-900">EduShield</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Premium Classroom Core</p>
            </div>
          </div>

          {/* Interactive RBAC Live Privilege Controller */}
          <div className="flex items-center gap-2.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center border border-slate-200/30">
            <div className="flex items-center gap-1.5 px-2 text-slate-400">
              <Eye className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider hidden lg:inline">Clearance View:</span>
            </div>
            {[
              { role: 'administrator', style: 'peer-checked:bg-blue-600 peer-checked:text-white text-blue-600' },
              { role: 'instructor', style: 'peer-checked:bg-purple-600 peer-checked:text-white text-purple-600' },
              { role: 'student', style: 'peer-checked:bg-emerald-600 peer-checked:text-white text-emerald-600' }
            ].map((node) => (
              <label key={node.role} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="rbac-role-selector"
                  checked={userRole === node.role}
                  onChange={() => setUserRole(node.role)}
                  className="sr-only peer"
                />
                <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${node.style} hover:bg-white/50`}>
                  {node.role.substring(0, 5)}
                </div>
              </label>
            ))}
          </div>

        </div>
      </header>

      {/* Main Grid Viewport Shell Wrapper Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row min-h-0">
        
        {/* Left Side Navigation Matrix Panel */}
        <aside className="w-full md:w-64 bg-white md:border-r border-b border-slate-100 p-4 md:py-6 space-y-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">System Control Nodes</p>
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
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10'
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

        {/* Right Fluid Primary Workspace Action Frame */}
        <main className="flex-1 p-4 md:p-8 min-w-0 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

    </div>
  )
}
