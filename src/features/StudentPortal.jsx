import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { 
  Search, Calendar, CheckCircle2, XCircle, AlertCircle, 
  ShieldCheck, Clock, ArrowLeft, RefreshCw, Menu, GraduationCap, User
} from 'lucide-react'

export default function StudentPortal() {
  // --- STATE CONTROL ---
  const [studentId, setStudentId] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [studentProfile, setStudentProfile] = useState(null)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // --- IDENTITY LOOKUP & HISTORY DATA FLOW ---
  const handlePortalLookup = async (e) => {
    if (e) e.preventDefault()
    const targetId = studentId.trim()
    if (!targetId) return

    setLoading(true)
    setErrorMessage('')

    try {
      // 1. Verify student exists in directory
      const { data: student, error: studentErr } = await supabase
        .from('students')
        .select('*')
        .eq('id', targetId)
        .single()

      if (studentErr || !student) {
        setErrorMessage(`Student ID "${targetId}" could not be located in the campus registration index.`)
        setIsVerified(false)
        setStudentProfile(null)
        return
      }

      setStudentProfile(student)
      setIsVerified(true)

      // 2. Fetch logged transactions
      const { data: logs, error: logsErr } = await supabase
        .from('attendance_logs')
        .select(`
          id,
          log_time,
          status,
          event_id,
          events (
            title,
            college,
            created_at
          )
        `)
        .eq('student_id', targetId)

      if (logsErr) throw logsErr

      const formattedHistory = logs?.map(log => ({
        log_id: log.id,
        time_in: log.log_time,
        status: log.status,
        event_title: log.events?.title || 'Unknown Event',
        hosted_by: log.events?.college ? log.events.college.split('_')[0].toUpperCase() : 'CSUCC',
        date: log.events?.created_at ? new Date(log.events.created_at).toLocaleDateString() : '—'
      })) || []

      setAttendanceHistory(formattedHistory)
    } catch (err) {
      console.error(err.message)
      setErrorMessage('A transmission issue occurred while fetching ledger packet records.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshLogs = () => {
    if (studentProfile) handlePortalLookup(null)
  }

  const handleResetPortal = () => {
    setIsVerified(false)
    setStudentProfile(null)
    setAttendanceHistory([])
    setStudentId('')
    setErrorMessage('')
  }

  // --- STATS ENGINE ---
  const totalAttended = attendanceHistory.filter(h => h.status === 'Present').length
  const totalExcused = attendanceHistory.filter(h => h.status === 'Excused').length
  const totalSessions = attendanceHistory.length
  const positiveTurnoutRate = totalSessions > 0 ? Math.round(((totalAttended + totalExcused) / totalSessions) * 100) : 0

  return (
    <div className="min-h-screen bg-[#f8fafd] text-slate-800 font-sans selection:bg-[#004d26] selection:text-white">
      
      {/* --- BRANDING HEADER (Matches image_fc9347.jpg Top Navigation) --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 bg-[#004d26] text-white rounded-md hover:bg-[#003318] transition md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {/* Fallback layout representation of the official logo setup seen in image_fc9347.jpg */}
              <div className="h-10 w-10 rounded-full bg-[#004d26] flex items-center justify-center text-[#fdb813] font-black text-xs shadow-xs border border-amber-400">
                CSU
              </div>
              <div className="leading-tight hidden sm:block">
                <h1 className="text-xs font-black tracking-tight text-[#004d26] uppercase">CARAGA STATE UNIVERSITY</h1>
                <p className="text-[10px] font-bold text-slate-500 tracking-wide">CABADBARAN CAMPUS</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <a href="#myschool" className="flex items-center gap-1 hover:text-[#004d26] transition">
              <GraduationCap className="h-4 w-4 text-slate-400" /> MySchool
            </a>
            <span className="text-slate-300">|</span>
            <a href="#mywork" className="flex items-center gap-1 hover:text-[#004d26] transition">
              <User className="h-4 w-4 text-slate-400" /> MyWork
            </a>
          </div>
        </div>
      </header>

      {/* --- HERO DEAN BANNER DISPLAY FLUID CONTAINER (Matches image_fc9347.jpg Banner) --- */}
      <section className="w-full bg-gradient-to-r from-[#00331a] via-[#004d26] to-[#012211] text-white overflow-hidden relative shadow-sm">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[9px] font-black tracking-widest text-[#fdb813] bg-[#002613] px-2 py-0.5 rounded border border-[#004d26]">
              OFFICIAL STUDENT WEB SERVICES
            </span>
            <h2 className="text-xl md:text-3xl font-black tracking-tight uppercase">
              Roster Attendance Portal
            </h2>
            <div className="h-1 w-20 bg-[#fdb813] mx-auto md:mx-0 rounded"></div>
            <p className="text-xs text-emerald-100/80 font-medium max-w-md pt-1">
              Verify compliance markers, checkout event logs, and review session turnout scores managed by your local campus government councils.
            </p>
          </div>
          {/* Subtle branding graphics container */}
          <div className="hidden lg:flex items-center gap-4 bg-black/10 p-4 border border-white/5 rounded-2xl backdrop-blur-xs">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-[#fdb813]">Quality Management System</p>
              <p className="text-[8px] font-mono opacity-60">ISO 9001:2015 CERTIFIED</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN INTERACTIVE CORE CONTENT BLOCK --- */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* VIEW A: ID VERIFICATION LOOKUP NODE */}
        {!isVerified ? (
          <div className="max-w-md mx-auto my-4 transition-all duration-300">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="text-center space-y-1.5">
                <div className="mx-auto h-11 w-11 bg-emerald-50 text-[#004d26] rounded-xl flex items-center justify-center border border-emerald-100">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black tracking-tight text-slate-900 uppercase">Roster Identity Gateway</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Input your reference key details to pull server data</p>
              </div>

              <form onSubmit={handlePortalLookup} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">CSUCC ID Account Code</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., 2026-12345"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#004d26] focus:outline-hidden font-mono font-bold text-slate-800 uppercase placeholder-slate-400"
                    />
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#004d26] hover:bg-[#003318] text-white text-xs font-black uppercase tracking-wider py-2.5 rounded-xl transition cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 shadow-xs"
                >
                  {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Request Ledger Entry Match'}
                </button>
              </form>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-[11px] font-semibold flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          
          // VIEW B: ACTIVE PROFILE AUDITING SYSTEM DASHBOARD
          <div className="space-y-6 transition-all duration-300">
            
            {/* PORTAL CONTEXT SUBHEAD BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 rounded-xl gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <button onClick={handleResetPortal} className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer text-slate-500">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black tracking-widest text-[#004d26] uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">Verified Account</span>
                    <span className="text-[8px] font-black tracking-widest text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">{studentProfile.id}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase mt-0.5">{studentProfile.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">{studentProfile.program} — {studentProfile.college?.split('_')[0].toUpperCase()} Council Scope</p>
                </div>
              </div>

              <button 
                onClick={handleRefreshLogs}
                disabled={loading}
                className="p-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-slate-600 self-start sm:self-center"
              >
                <RefreshCw className={`h-3 w-3 text-[#004d26] ${loading ? 'animate-spin' : ''}`} /> Sync Logs
              </button>
            </div>

            {/* LIVE METRICS TILES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Monitored Units</div>
                <div className="text-lg font-black text-slate-900 mt-1">{totalSessions}</div>
                <p className="text-[8px] text-slate-400 font-medium mt-0.5">Total sessions tracked</p>
              </div>
              <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs border-l-2 border-l-[#004d26]">
                <div className="text-[8px] font-black text-[#004d26] uppercase tracking-widest">Present Logs</div>
                <div className="text-lg font-black text-slate-900 mt-1">{totalAttended}</div>
                <p className="text-[8px] text-slate-400 font-medium mt-0.5">Confirmed check-ins</p>
              </div>
              <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs border-l-2 border-l-amber-500">
                <div className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Excused Notes</div>
                <div className="text-lg font-black text-slate-900 mt-1">{totalExcused}</div>
                <p className="text-[8px] text-slate-400 font-medium mt-0.5">Authorized clearances</p>
              </div>
              <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs bg-gradient-to-br from-emerald-50/10 to-white">
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Roster Compliance</div>
                <div className="text-lg font-black text-[#004d26] mt-1">{positiveTurnoutRate}%</div>
                <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Overall Rate</p>
              </div>
            </div>

            {/* ATTENDANCE WARNING ACCORDION TRIGGER */}
            {totalSessions > 3 && positiveTurnoutRate < 75 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl flex items-center gap-3">
                <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <p className="text-[11px] font-semibold text-rose-800">
                  <strong className="font-black uppercase tracking-wider block text-[10px]">Compliance Warning Threshold:</strong> 
                  Your current attendance rating falls below institutional retention targets. Please register valid justification documentation with your student dean if any entries require overrides.
                </p>
              </div>
            )}

            {/* SEPARATED SECTION DIVIDER LINE (Matches styles layout from image_fc9347.jpg) */}
            <div className="pt-2">
              <div className="w-full h-[1px] bg-slate-200"></div>
              <div className="w-24 h-[2px] bg-[#fdb813] mt-[-1px]"></div>
            </div>

            {/* CHRONOLOGICAL RUNTIME LEDGER LIST SHEET */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#004d26]" /> Account Activity Footprints
                </h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Official database history for active campus periods</p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">
                        <th className="p-3 pl-4">Time Flag</th>
                        <th className="p-3">Deployment Objective Context</th>
                        <th className="p-3">Host Node</th>
                        <th className="p-3">Session Date</th>
                        <th className="p-3 pr-4 text-right">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600 bg-white">
                      {attendanceHistory.length > 0 ? (
                        attendanceHistory.map(log => (
                          <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 pl-4 font-mono text-[10px] font-bold text-slate-400">{log.time_in || '—'}</td>
                            <td className="p-3 text-slate-900 font-bold">{log.event_title}</td>
                            <td className="p-3 font-mono text-[10px] text-slate-500 uppercase tracking-wider">{log.hosted_by}</td>
                            <td className="p-3 font-mono text-[10px] text-slate-400">{log.date}</td>
                            <td className="p-3 pr-4 text-right">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border font-mono ${
                                log.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                log.status === 'Excused' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-12 text-center text-slate-400">
                            <p className="text-xs font-bold text-slate-500">No Check-in Footprints Found</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Your profile hasn't been added to any event tracking sessions yet.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
