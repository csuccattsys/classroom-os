import React from 'react'
import { Lock, Menu } from 'lucide-react'

export default function Sidebar({ 
  menuItems, 
  activeTab, 
  setActiveTab, 
  userRole, 
  sidebarOpen, 
  setSidebarOpen 
}) {
  return (
    <>
      {/* MOBILE FLOATING BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* GEMINI-INSPIRED COMPONENT TRACK */}
      <aside 
        className={`
          fixed md:sticky top-[77px] left-0 h-[calc(100vh-77px)] z-50 md:z-30
          bg-slate-50 border-r border-slate-200/60 p-3 flex flex-col justify-between
          transition-all duration-300 ease-in-out shrink-0
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-20 translate-x-0'} 
        `}
      >
        <div className="space-y-4 overflow-hidden">
          {/* DESKTOP INTEGRATED EXPAND/COLLAPSE CONTROLLER */}
          <div className="hidden md:flex items-center px-2 h-10">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
              title={sidebarOpen ? "Collapse menu" : "Expand menu"}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* FRAMEWORK NAVIGATION NODE LINKS */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              const isTabRestricted = (item.id === 'attendance' && (userRole === 'student' || userRole === 'ssg'))
              const isSelected = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  disabled={item.locked}
                  onClick={() => {
                    setActiveTab(item.id)
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={`
                    flex items-center rounded-full text-xs font-semibold tracking-wide 
                    transition-all duration-200 w-full text-left p-3 cursor-pointer
                    ${item.locked ? 'opacity-30 cursor-not-allowed' : ''}
                    ${isSelected 
                      ? 'bg-emerald-50 text-emerald-800 font-bold' 
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                    }
                  `}
                  title={item.label}
                >
                  {/* Keep icons perfectly aligned in the 20px rail track when collapsed */}
                  <div className="flex items-center gap-4 w-full">
                    <IconComponent className={`h-5 w-5 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                    
                    {sidebarOpen && (
                      <span className={`
                        transition-all duration-200 whitespace-nowrap truncate
                        ${isTabRestricted ? 'text-slate-400 line-through decoration-rose-500/40' : ''}
                      `}>
                        {item.label}
                      </span>
                    )}
                  </div>

                  {sidebarOpen && (
                    <div className="ml-auto shrink-0">
                      {item.locked ? (
                        <span className="text-[8px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded-sm uppercase font-black tracking-wider">Hold</span>
                      ) : isTabRestricted ? (
                        <Lock className="h-3 w-3 text-rose-500" />
                      ) : null}
                    </div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
