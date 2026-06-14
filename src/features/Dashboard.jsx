import React from 'react'
import Sidebar from './Sidebar'
import { AppRouter } from '../router'
import { Menu, UserCheck, LogIn, LogOut, Megaphone } from 'lucide-react'

export default function Dashboard({ 
  session, 
  userRole, 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen, 
  usgLogo, 
  getRoleHeaderLabel, 
  setIsLoginModalOpen, 
  handleLogout, 
  menuItems, 
  forwardProps 
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900 selection:bg-emerald-600 selection:text-white relative">
      
      {/* UNIVERSAL CORE APP HEADER CONTAINER */}
      <header className="bg-white border-b border-slate-200/80 px-4 md:px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* LEFT PORTION: BRANDING AND BRAND SYMBOL */}
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

          {/* RIGHT PORTION: INTEGRATED STATUS IDENTITY CONTROL CARD */}
          <div className="flex items-center gap-2 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/60 shadow-inner">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200/40 shadow-xs">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-700 tracking-wider">
                {getRoleHeaderLabel()}
              </span>
            </div>
            
            {/* Dynamic Interactive Action Option depending on validation session */}
            {!session ? (
              <button 
                onClick={() => setIsLoginModalOpen(true)} 
                className="flex items-center gap-1 text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200/80 px-3 py-1.5 rounded-lg transition-all duration-200 text-[9px] md:text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-xs"
              >
                <LogIn className="h-3 w-3" /> 
                <span>Portal Log In</span>
              </button>
            ) : (
              <button 
                onClick={handleLogout} 
                className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="h-3 w-3" /> 
                <span className="hidden xs:inline">Exit</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MARQUEE GLOBAL SYSTEM BULLETIN BANNER */}
      <div className="bg-emerald-900 text-white py-1.5 px-4 overflow-hidden relative border-b border-emerald-950 flex items-center text-[10px] font-semibold tracking-wide">
        <span className="bg-emerald-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mr-3 shadow-xs shrink-0 z-10">BULLETIN</span>
        <div className="animate-marquee whitespace-nowrap loop-scroll flex gap-8">
          <span>Welcome to the CSUCC Governance Portal. Ensure all event access attendance sheets are securely filed under correct RBAC rules.</span>
        </div>
      </div>

      {/* SCREEN PANELS ORIENTATION WRAPPER */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Only display the Sidebar layout element if menu items exist */}
        {menuItems.length > 0 && (
          <Sidebar 
            menuItems={menuItems} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            userRole={userRole} 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        )}
         
        <main className="flex-1 p-4 md:p-8 min-w-0 overflow-y-auto bg-white">
          <div className="max-w-5xl mx-auto">
            {/* CENTRALIZED ROUTER COMPONENT */}
            <AppRouter 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              routeProps={forwardProps}
            />
          </div>
        </main>
      </div>

    </div>
  )
}
