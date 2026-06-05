import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function AttendanceTracker() {
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({}) // Stores { student_id: 'Present' | 'Absent' | 'Tardy' }
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch student roster and existing logs for the selected date
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      
      // 1. Fetch all students
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, name, email')
        .order('name', { ascending: true })

      if (studentError) {
        console.error('Error fetching students:', studentError.message)
        setLoading(false)
        return
      }

      setStudents(studentData)

      // 2. Fetch any pre-existing attendance records for this specific date
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('date', date)

      if (attendanceError) {
        console.error('Error fetching logs:', attendanceError.message)
      }

      // 3. Map status to local state; default to 'Present' if no record exists yet
      const initialStatus = {}
      studentData.forEach(student => {
        const recorded = attendanceData?.find(r => r.student_id === student.id)
        initialStatus[student.id] = recorded ? recorded.status : 'Present'
      })

      setAttendance(initialStatus)
      setLoading(false)
    }

    loadData()
  }, [date]) // Re-runs data load whenever the calendar date changes

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const saveAttendanceLog = async () => {
    setSaving(true)
    
    // Format records to match the production table constraints
    const records = students.map(student => ({
      student_id: student.id,
      date: date,
      status: attendance[student.id]
    }))

    // Upsert acts as insert-or-update based on the unique pairing constraint
    const { error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'student_id,date' })

    setSaving(false)

    if (error) {
      alert(`Database save failed: ${error.message}`)
    } else {
      alert(`Attendance for ${date} has been synced securely!`)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Fetching secure records...</div>
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tracker Header Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Daily Attendance</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage live student participation history logs.</p>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Session Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Roster Data Grid Table */}
      {students.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          No students found in your production database. Please add mock student items inside your Supabase dashboard table editor first!
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Roster Profile</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Present</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Absent</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Tardy</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-400">{student.email}</div>
                    </td>
                    
                    {['Present', 'Absent', 'Tardy'].map((status) => (
                      <td key={status} className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="radio"
                          name={`attendance-${student.id}`}
                          value={status}
                          checked={attendance[student.id] === status}
                          onChange={() => handleStatusChange(student.id, status)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500/20 border-gray-300 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sync Trigger Toolbar */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={saveAttendanceLog}
              disabled={saving}
              className={`px-5 py-2 rounded-lg text-white font-semibold text-sm shadow-sm transition-all ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {saving ? 'Syncing to Database...' : 'Save Roster State'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
