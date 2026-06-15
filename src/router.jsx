import React from 'react'
import StudentPortal from './features/StudentPortal'
import ExecutiveDashboard from './features/ExecutiveDashboard'
import AttendanceTracker from './features/AttendanceTracker'
import Announcements from './features/Announcements'
import StudentLedger from './features/StudentLedger' // Imported the new Ledger Module
import { Lock } from 'lucide-react'

// 1. Centralized Route Registry Configuration
export const routes = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    component: (props) => props.userRole === 'student' 
      ? <StudentPortal {...props} /> 
      : <ExecutiveDashboard {...props} />,
    requiresAuth: false
  },
  {
    id: 'attendance',
    label: 'Activity Attendance',
    component: (props) => <AttendanceTracker userRole={props.userRole} />,
    requiresAuth: true,
    allowedRoles: ['usg', 'cba_lsg', 'ceit_lsg', 'citte_lsg', 'cthm_lsg'],
    deniedMessage: "University Student Government or authorized College LSG Board clearance is required to process college student event logs."
  },
  {
    id: 'announcements',
    label: 'Official Bulletin Board',
    component: (props) => <Announcements userRole={props.userRole} />,
    requiresAuth: false
  },
  {
    id: 'students',
    label: 'College Roster',
    component: (props) => <StudentLedger userRole={props.userRole} />,
    requiresAuth: true,
    allowedRoles: ['usg', 'cba_lsg', 'ceit_lsg', 'citte_lsg', 'cthm_lsg'],
    deniedMessage: "University Student Government or authorized College LSG Board clearance is required to view the institutional student registry ledger."
  }
]

// 2. Fallback Access Denied UI
const AccessDenied = ({ message, onReturn }) => (
  <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center max-w-md mx-auto my-12 shadow-xs animate-fade-in">
    <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
      <Lock className="h-5 w-5" />
    </div>
    <h3 className="text-xs font-black uppercase text-slate-900 tracking-tight">Clearance Check Failed</h3>
    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{message}</p>
    <button 
      onClick={onReturn} 
      className="mt-5 text-xs font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
    >
      Return to Dashboard
    </button>
  </div>
)

// 3. Main Operational Router Engine Component
export function AppRouter({ activeTab, setActiveTab, routeProps }) {
  // Find match in configuration registry
  const currentRoute = routes.find(route => route.id === activeTab)

  // Fallback if route does not exist 
  if (!currentRoute) {
    return <StudentPortal />
  }

  // Handle Role-Based Protection Guard Check
  if (currentRoute.requiresAuth && !currentRoute.allowedRoles.includes(routeProps.userRole)) {
    return (
      <AccessDenied 
        message={currentRoute.deniedMessage} 
        onReturn={() => setActiveTab('dashboard')} 
      />
    )
  }

  // Render valid component if security clearances pass
  return currentRoute.component(routeProps)
}
