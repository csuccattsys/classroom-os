import React from 'react'
import { Zap, RefreshCw, ShieldAlert, TrendingUp, Building2, Clock } from 'lucide-react'

export default function ExecutiveDashboard({ 
  userRole, 
  session, 
  isPublicObserver, 
  systemTime, 
  setActiveTab, 
  triggerCacheFlush, 
  isRefreshing 
}) {

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* GOVERNANCE HERO BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-2xl p-6 text-white border border-emerald-900/30 shadow-xl relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <span className={`border text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${getRoleBadgeDetails().color}`}>
            {getRoleBadgeDetails().label} Panel
          </span>
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

      {/* STATISTICAL ANALYTICS TILES */}
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
