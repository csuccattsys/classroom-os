import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function AttendanceTracker() {
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({}) 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: studentData } = await supabase
        .from('students')
        .select('id, name, email')
        .order('name', { ascending: true })

      if (!studentData) { setLoading(false); return; }
      setStudents(studentData)

      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('date', date)

      const initialStatus = {}
      studentData.forEach(student => {
        const recorded = attendanceData?.find(r => r.student_id === student.id)
        initialStatus[student.id] = recorded ? recorded.status : 'Present'
      })
      setAttendance(initialStatus)
      setLoading(false)
    }
    loadData()
  }, [date])

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const saveAttendanceLog = async () => {
    setSaving(true)
    const records = students.map(student => ({
      student_id: student.id,
      date: date,
      status: attendance[student.id]
    }))

    const { error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'student_id,date' })

    setSaving(false)
    if (error) alert(`Error: ${error.message}`)
  }

  // Real-time calculated telemetry variables
  const totalStudents = students.length
  const presentCount = Object.values(attendance).filter(s => s === 'Present').length
  const absentCount = Object.values(attendance).filter(s => s === 'Absent').length
  const tardyCount = Object.values(attendance).filter(s => s === 'Tardy').length

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500 animate-pulse">Decrypting database ledger clusters...</p>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upper Metrics Grid Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Enrolled', value: totalStudents, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Present Today', value: presentCount, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
          { label: 'Absent Shift', value: absentCount, color: 'text-rose-600', bg: 'bg-rose-50/60' },
          { label: 'Tardy Late', value: tardyCount, color: 'text-amber-600', bg: 'bg-amber-50/60' },
        ].map((card, idx) => (
          <div key={idx} className={`p-4 rounded-xl border border-slate-100 shadow-sm ${card.bg}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</p>
            <p className={`text-2xl font-black mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Primary Action Terminal Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Roster Tracking Matrix</h2>
            <p className="text-xs text-slate-400 mt-0.5">Toggle student operational states instantly.</p>
          </div>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm bg-slate-50/50 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
          />
        </div>

        <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
          {students.map((student) => (
            <div key={student.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-sm">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{student.name}</h4>
                  <p className="text-xs text-slate-400">{student.email}</p>
                </div>
              </div>

              {/* Advanced Segmented Option Button Grid */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
                {[
                  { id: 'Present', color: 'peer-checked:bg-emerald-500 peer-checked:text-white text-emerald-600 hover:bg-emerald-50' },
                  { id: 'Absent', color: 'peer-checked:bg-rose-500 peer-checked:text-white text-rose-600 hover:bg-rose-50' },
                  { id: 'Tardy', color: 'peer-checked:bg-amber-500 peer-checked:text-white text-amber-600 hover:bg-amber-50' }
                ].map((btn) => (
                  <label key={btn.id} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name={`att-${student.id}`}
                      checked={attendance[student.id] === btn.id}
                      onChange={() => handleStatusChange(student.id, btn.id)}
                      className="sr-only peer"
                    />
                    <div className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${btn.color}`}>
                      {btn.id}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex justify-end">
          <button
            onClick={saveAttendanceLog}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/10 transition disabled:opacity-50"
          >
            {saving ? 'Syncing Base Terminal...' : 'Commit Operational State'}
          </button>
        </div>
      </div>
    </div>
  )
}
