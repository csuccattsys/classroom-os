import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { UserCheck, Users, UserX, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AttendanceTracker() {
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({}) 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })

  // Pull down roster and match any existing log signatures for the picked date
  useEffect(() => {
    async function loadAttendanceSystemData() {
      setLoading(true)
      setStatusMessage({ type: '', text: '' })

      // 1. Fetch current student list from production PostgreSQL
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, name, email')
        .order('name', { ascending: true })

      if (studentError) {
        setStatusMessage({ type: 'error', text: `Roster error: ${studentError.message}` })
        setLoading(false)
        return
      }

      setStudents(studentData || [])

      // 2. Fetch existing logs for the selected session date
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('date', date)

      if (attendanceError) {
        console.error('Error matching historical log files:', attendanceError.message)
      }

      // 3. Map statuses to layout state. Default unlogged entities to 'Present'
      const activeStatusMap = {}
      if (studentData) {
        studentData.forEach(student => {
          const matchingRow = attendanceData?.find(record => record.student_id === student.id)
          activeStatusMap[student.id] = matchingRow ? matchingRow.status : 'Present'
        })
      }
      
      setAttendance(activeStatusMap)
      setLoading(false)
    }

    loadAttendanceSystemData()
  }, [date])

  const handleStatusToggle = (studentId, statusValue) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: statusValue
    }))
  }

  const commitAttendanceLogToCloud = async () => {
    setSaving(true)
    setStatusMessage({ type: '', text: '' })

    const batchPayload = students.map(student => ({
      student_id: student.id,
      date: date,
      status: attendance[student.id]
    }))

    // Upsert acts as an elegant double-action router: Updates if matching row exists, inserts if new
    const { error } = await supabase
      .from('attendance')
      .upsert(batchPayload, { onConflict: 'student_id,date' })

    setSaving(false)

    if (error) {
      setStatusMessage({ type: 'error', text: `Sync Interrupted: ${error.message}` })
    } else {
      setStatusMessage({ type: 'success', text: `Session state for ${date} committed cleanly!` })
      // Clear alert after a few seconds
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000)
    }
  }

  // Telemetry Calculations for Data Insights Panel
  const totals = students.length
  const presents = Object.values(attendance).filter(val => val === 'Present').length
  const absents = Object.values(attendance).filter(val => val === 'Absent').length
  const tardies = Object.values(attendance).filter(val => val === 'Tardy').length

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[350px] space-y-4">
      <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Cloud Ledger...</p>
    </div>
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Upper Grid Overview Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Roster Capacity', value: totals, icon: Users, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Present Logged', value: presents, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50/40' },
          { label: 'Absent Shift', value: absents, icon: UserX, color: 'text-rose-600', bg: 'bg-rose-50/40' },
          { label: 'Tardy Metrics', value: tardies, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/40' },
        ].map((card, idx) => {
          const CardIcon = card.icon
          return (
            <div key={idx} className={`p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between ${card.bg}`}>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{card.label}</p>
                <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-slate-100/50 ${card.color}`}>
                <CardIcon className="h-5 w-5" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Primary Configuration Shell Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Dynamic Command Dashboard Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/30">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-900">List of Sections</h2>
            <p className="text-xs text-slate-400">List of Different Sections.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-xl max-w-fit">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Global Action Sync Feedback Banner */}
        {statusMessage.text && (
          <div className={`p-4 mx-6 mt-6 rounded-xl flex items-center gap-3 text-xs font-bold border ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
              : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {statusMessage.text}
          </div>
        )}

        {/* Core Identity Mapping Engine Rows */}
        {students.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <div className="text-2xl">📁</div>
            <h4 className="text-sm font-bold text-slate-700">Database Table Roster Clear</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Your connection is active! To see students, add a few test profiles directly inside your Supabase Student table view.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto px-1">
              {students.map((student) => (
                <div key={student.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition">
                  
                  {/* Student Basic Matrix ID Information */}
                  <div className="flex items-center gap-3.5">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-black text-xs tracking-wider flex items-center justify-center shadow-sm">
                      {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{student.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{student.email}</p>
                    </div>
                  </div>

                  {/* Operational Segment Control Hub */}
                  <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-center border border-slate-200/20">
                    {[
                      { id: 'Present', activeClass: 'peer-checked:bg-emerald-500 peer-checked:text-white text-emerald-600 hover:bg-emerald-50' },
                      { id: 'Absent', activeClass: 'peer-checked:bg-rose-500 peer-checked:text-white text-rose-600 hover:bg-rose-50' },
                      { id: 'Tardy', activeClass: 'peer-checked:bg-amber-500 peer-checked:text-white text-amber-600 hover:bg-amber-50' }
                    ].map((mode) => (
                      <label key={mode.id} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name={`session-attendance-${student.id}`}
                          checked={attendance[student.id] === mode.id}
                          onChange={() => handleStatusToggle(student.id, mode.id)}
                          className="sr-only peer"
                        />
                        <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${mode.activeClass}`}>
                          {mode.id}
                        </div>
                      </label>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {/* Core Commit Navigation Footer Trigger */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button
                onClick={commitAttendanceLogToCloud}
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl shadow-md transition duration-200 disabled:opacity-40"
              >
                {saving ? 'Transmitting Packet...' : 'Save Session State'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
