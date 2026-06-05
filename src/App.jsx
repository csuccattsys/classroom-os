import React from 'react'
import AttendanceTracker from './features/AttendanceTracker'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-gray-900">
      {/* Top Banner Navigation bar */}
      <header className="bg-slate-900 text-white shadow-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center font-black tracking-tighter text-sm">C</div>
            <h1 className="text-lg font-bold tracking-tight">Classroom OS</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Live Supabase Cluster</span>
          </div>
        </div>
      </header>

      {/* Main Feature Layout Canvas Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        <AttendanceTracker />
      </main>
      
      {/* Tiny Operational Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-200 bg-white">
        &copy; {new Date().getFullYear()} Classroom OS Management Portal. Powered by React, Vite & Vercel.
      </footer>
    </div>
  )
}
