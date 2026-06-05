import React, { useState } from 'react'
import AttendanceTracker from './features/AttendanceTracker'
import Announcements from './features/Announcements'
// Import premium vector nodes from your new package
import { Activity, Radio, FileQuestion, BarChart3, ShieldCheck } from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('attendance')

  const renderContent = () => {
    switch (activeTab) {
      case 'attendance': return <AttendanceTracker />
      case 'announcements': return <Announcements />
      default: return <AttendanceTracker />
    }
  }

  // Swapped text emojis with structural Lucide component references
  const menuItems = [
    { id: 'attendance', label: 'Attendance Tracker', icon: Activity },
    { id: 'announcements', label: 'Broadcast Bulletins', icon: Radio },
    { id: 'quizzes', label: 'Quiz Engine Framework', icon: FileQuestion, locked: true },
    { id: 'records', label: 'Analytics Grade Ledger', icon: BarChart3, locked: true },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Header Panel */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 h-9 w-9 rounded-xl flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20">Ω</div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase text-slate-900">CORE OS</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Classroom Terminal Engine</p>
            </div>
          </div>
          <div className="bg-slate-900 text-white rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-bold border border-slate-800 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Node Secure
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row min-h-0">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full md:w-64 bg-white md:border-r border-b border-slate-100 p-4 md:py-6 space-y-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">System Control Nodes</p>
            <nav className="mt-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {menuItems.map((item) => {
                const IconComponent = item.icon // Dynamically extract the Lucide component
                return (
                  <button
                    key={item.id}
                    disabled={item.locked}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all w-full text-left ${
                      item.locked ? 'opacity-40 cursor-not-allowed' :
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-4 w-4 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                      {item.label}
                    </div>
                    {item.locked && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-black">Hold</span>}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Right Active Workspace Window */}
        <main className="flex-1 p-4 md:p-8 min-w-0 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
