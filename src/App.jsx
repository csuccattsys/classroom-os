import React, { useState } from 'react'
import AttendanceTracker from './features/AttendanceTracker'
import Announcements from './features/Announcements'

export default function App() {
  const [activeTab, setActiveTab] = useState('attendance')

  // Render view programmatically based on active menu state selection
  const renderContent = () => {
    switch (activeTab) {
      case 'attendance':
        return <AttendanceTracker />
      case 'announcements':
        return <Announcements />
      case 'quizzes':
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            <h3 className="text-lg font-bold mb-2 text-gray-800">Quiz & Assessment Engine</h3>
            <p className="text-sm">This interactive block module placeholder will contain quiz deployment and response evaluation configurations.</p>
          </div>
        )
      case 'records':
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            <h3 className="text-lg font-bold mb-2 text-gray-800">Unified Gradebook Ledger</h3>
            <p className="text-sm">This analytic block engine placeholder will calculate cross-table summaries for grades and participation rates.</p>
          </div>
        )
      default:
        return <AttendanceTracker />
    }
  }

  // Navigation menu item setup configuration
  const menuItems = [
    { id: 'attendance', label: 'Attendance Logs', icon: '📋' },
    { id: 'announcements', label: 'Notice Bulletins', icon: '📣' },
    { id: 'quizzes', label: 'Interactive Quizzes', icon: '📝' },
    { id: 'records', label: 'Record Keeping', icon: '📊' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-gray-900">
      {/* Top Universal Navbar */}
      <header className="bg-slate-900 text-white shadow-md px-6 py-4 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center font-black tracking-tighter text-sm">C</div>
            <h1 className="text-lg font-bold tracking-tight">Classroom OS</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 hidden sm:inline">Live Production Link</span>
          </div>
        </div>
      </header>

      {/* Main Two-Column Structure Canvas Wrapper */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        
        {/* Left Side Menu Sidebar */}
        <aside className="w-full md:w-64 bg-white md:border-r border-b md:border-b-0 border-gray-100 p-4 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3 hidden md:block">Management Modules</p>
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all w-full text-left ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Fluid Content Panel Workspace */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Small Screen Global Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
        &copy; {new Date().getFullYear()} Classroom OS Hub. Connected to live Supabase client framework.
      </footer>
    </div>
  )
}
