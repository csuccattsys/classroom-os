import React from 'react'
import { Lock } from 'lucide-react'

export default function Sidebar({ menuItems, activeTab, setActiveTab, userRole }) {
  return (
    <aside className="w-full md:w-64 bg-white md:border-r border-b border-slate-100 p-4 md:py-6 space-y-6">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">
          System Framework Nodes
        </p>
        <nav className="mt-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const isTabRestricted = (item.id === 'attendance' && (userRole === 'student' || userRole === 'ssg'))
            
            return (
              <button
                key={item.id}
                disabled={item.locked}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all w-full text-left shrink-0 md:shrink-1 ${
                  item.locked ? 'opacity-30 cursor-not-allowed' :
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-emerald-600 to-slate-900 text-white shadow-md' 
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
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                    Hold
                  </span>
                ) : isTabRestricted ? (
                  <Lock className="h-3 w-3 text-rose-500" />
                ) : null}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
