import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { 
  UserCheck, Search, Database, CheckCircle, RefreshCw, 
  PlusCircle, ShieldAlert, Calendar, ArrowLeft, ClipboardList, 
  Download, Edit2, Trash2, Check, X 
} from 'lucide-react'

export default function AttendanceTracker({ userRole }) {
  // --- STATE CONTROL ---
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventsList, setEventsList] = useState([])
  const [studentDb, setStudentDb] = useState([])
  const [attendanceLogs, setAttendanceLogs] = useState({}) // Format: { student_id: { log_id, log_time } }

  // Interactive UI Elements
  const [newEventTitle, setNewEventTitle] = useState('')
  const [inputStudentId, setInputStudentId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [trackerMessage, setTrackerMessage] = useState({ text: '', type: '' })

  // Editing Overrides
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [editStatusValue, setEditStatusValue] = useState('Present')

  const isCollegeLSG = ['cba_lsg', 'ceit_lsg', 'citte_lsg', 'cthm_lsg'].includes(userRole)

  // --- DATABASE DATA-SYNC FLOWS ---
  const fetchEvents = async () => {
    try {
      setLoading(true)
      let query = supabase.from('events').select('*')
      if (isCollegeLSG) query = query.eq('college', userRole)
      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      setEventsList(data || [])
    } catch (err) {
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceSheetData = async (eventId) => {
    try {
      setLoading(true)
      let studentQuery = supabase.from('students').select('*')
      if (isCollegeLSG) studentQuery = studentQuery.eq('college', userRole)
      const { data: students, error: studentErr } = await studentQuery.order('name', { ascending: true })
      if (studentErr) throw studentErr
      setStudentDb(students || [])

      const { data: logs, error: logsErr } = await supabase
        .from('attendance_logs')
        .select('id, student_id, log_time, status')
        .eq('event_id', eventId)
      if (logsErr) throw logsErr

      const logsMap = {}
      logs?.forEach(l => { 
        logsMap[l.student_id] = { log_id: l.id, log_time: l.log_time, status: l.status } 
      })
      setAttendanceLogs(logsMap)
    } catch (err) {
      console.error(err.message)
      setTrackerMessage({ text: 'Error syncing attendance records.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedEvent) fetchEvents()
    else fetchAttendanceSheetData(selectedEvent.id)
    setTrackerMessage({ text: '', type: '' })
  }, [selectedEvent, userRole])

  // --- EXPORT TO SPREADSHEET ENGINE ---
  const handleExportToCSV = () => {
    if (!selectedEvent || studentDb.length === 0) return

    // Define Spreadsheet Columns Headers
    const headers = ['Student ID', 'Full Legal Name', 'College Cluster', 'Program Specialty', 'Verification Timestamp', 'Attendance Status']
    
    // Map Student Roster to matching spreadsheet data arrays
    const rows = studentDb.map(student => {
      const logRecord = attendanceLogs[student.id]
      return [
        `"${student.id}"`, // Quote strings to prevent format breaking in Excel
        `"${student.name}"`,
        `"${student.college ? student.college.split('_')[0].toUpperCase() : '—'}"`,
        `"${student.program}"`,
        `"${logRecord ? logRecord.log_time : '—'}"`,
        `"${logRecord ? logRecord.status : 'Absent'}"`
      ]
    })

    // Construct raw string schema structure
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')

    // Programmatic simulation of clean file download trigger
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    
    // Format File Name cleanly using custom activity details
    const cleanFileName = `${selectedEvent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attendance.csv`
    link.setAttribute("download", cleanFileName)
    document.body.appendChild(link)
    
    link.click() // Dispatch download action trigger
    document.body.removeChild(link)
  }

  // --- EDIT & OVERRIDE ACTIONS ---
  const handleSaveEditedStatus = async (studentId) => {
    const logRecord = attendanceLogs[studentId]
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    try {
      if (editStatusValue === 'Absent') {
        // If switched back to Absent, remove log record completely from attendance logs table
        if (logRecord) {
          await supabase.from('attendance_logs').delete().eq('id', logRecord.log_id)
        }
      } else {
        if (logRecord) {
          // If record exists, update row values
          await supabase.from('attendance_logs')
            .update({ status: editStatusValue })
            .eq('id', logRecord.log_id)
        } else {
          // If overriding an Absent student to Present directly inside table row, create entry row
          await supabase.from('attendance_logs')
            .insert([{ event_id: selectedEvent.id, student_id: studentId, status: editStatusValue, log_time: timestamp }])
        }
      }
      setTrackerMessage({ text: 'Roster status state overrides successfully synchronized.', type: 'success' })
      setEditingStudentId(null)
      fetchAttendanceSheetData(selectedEvent.id)
    } catch (err) {
      setTrackerMessage({ text: 'Failed to synchronize override metadata state changes.', type: 'error' })
    }
  }

  const handleDeleteEvent = async (eventId, e) => {
    e.stopPropagation() // Stop component from selecting the event track
    if (!window.confirm("Are you entirely sure you want to delete this event activity and all its attached attendance sheets? This action is permanent.")) return

    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) throw error
      setTrackerMessage({ text: 'Activity permanently removed from institutional log server.', type: 'success' })
      fetchEvents()
    } catch (err) {
      setTrackerMessage({ text: 'Failed to dispatch removal query against server clusters.', type: 'error' })
    }
  }

  // --- APP LEVEL FORM LOGGERS ---
  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!newEventTitle.trim()) return
    try {
      const { error } = await supabase.from('events').insert([{ title: newEventTitle.trim(), college: userRole }])
      if (error) throw error
      setNewEventTitle('')
      setTrackerMessage({ text: 'Event deployed to core campus framework successfully.', type: 'success' })
      fetchEvents()
    } catch (err) {
      setTrackerMessage({ text: 'Failed to initialize event database entry.', type: 'error' })
    }
  }

  const handleManualLog = async (e) => {
    e.preventDefault()
    const targetId = inputStudentId.trim()
    if (!targetId || !selectedEvent) return

    setTrackerMessage({ text: '', type: '' })
    const student = studentDb.find(s => s.id === targetId)

    if (!student) {
      setTrackerMessage({ text: `Student ID ${targetId} not registered or out of department scope.`, type: 'error' })
      return
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    try {
      const { error } = await supabase
        .from('attendance_logs')
        .insert([{ event_id: selectedEvent.id, student_id: targetId, status: 'Present', log_time: timestamp }])

      if (error) {
        if (error.code === '23505') setTrackerMessage({ text: `${student.name} is already checked into this event.`, type: 'error' })
        else throw error
        return
      }

      setTrackerMessage({ text: `${student.name} checked in successfully.`, type: 'success' })
      setInputStudentId('')
      fetchAttendanceSheetData(selectedEvent.id)
    } catch (err) {
      setTrackerMessage({ text: 'Failed to lock transaction on cloud ledger.', type: 'error' })
    }
  }

  const filteredStudents = studentDb.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || student.id?.includes(searchTerm)
  )

  // --- UI VIEW ROUTERS ---

  // SCREEN A: EVENT MANAGE INDEX VIEW
  if (!selectedEvent) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 mb-3 flex items-center gap-1.5">
            <PlusCircle className="h-4 w-4 text-emerald-600" /> New Activity Track
          </h3>
          <form onSubmit={handleCreateEvent} className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <input 
              type="text" 
              placeholder="Enter Activity Title (e.g., General Assembly 2026)..."
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-semibold"
            />
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer">
              Deploy Event
            </button>
          </form>
          {trackerMessage.type === 'success' && <p className="text-[11px] font-bold text-emerald-600 mt-2">{trackerMessage.text}</p>}
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" /> Active Campus Activity
              </h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Select an activity to proceed to attendance logs</p>
            </div>
            <button onClick={fetchEvents} className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
              <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {eventsList.length > 0 ? (
              eventsList.map(event => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="p-4 bg-slate-50 hover:bg-emerald-50/20 border border-slate-200/60 rounded-xl transition cursor-pointer group flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-900 group-hover:text-emerald-900 transition">{event.title}</p>
                    <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">Deployed: {event.event_date}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      {event.college.split('_')[0]}
                    </span>
                    <button 
                      onClick={(e) => handleDeleteEvent(event.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                      title="Delete Event"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-semibold text-slate-400 p-4 col-span-2 text-center">No active deployed events found for this scope terminal.</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // SCREEN B: SHEET DETAILED SYSTEM SHEET PORTAL
  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER CONTROLLER BRIDGE */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/40">Attendance Tracker</span>
            <h2 className="text-sm font-black tracking-tight uppercase mt-0.5">{selectedEvent.title}</h2>
          </div>
        </div>
        
        {/* EXPORT DATA BUTTON TRIGGER */}
        <button 
          onClick={handleExportToCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" /> Export Spreadsheet (.CSV)
        </button>
      </div>

      {/* INPUT MANUEVER PANEL ENTRY */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <form onSubmit={handleManualLog} className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <input 
            type="text" 
            placeholder="Scan ID or Enter Reference Key..."
            value={inputStudentId}
            onChange={(e) => setInputStudentId(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-mono font-bold"
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-5 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
            Log Attendance
          </button>
        </form>

        {trackerMessage.text && (
          <div className={`mt-3 p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-2 border ${
            trackerMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {trackerMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            <span>{trackerMessage.text}</span>
          </div>
        )}
      </div>

      {/* CORE DATA VERIFICATION VIEW TABLE SHEET */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-400" />
            <h3 className="text-xs font-black uppercase tracking-tight text-slate-900">Student Sheet Logs</h3>
          </div>
          <input 
            type="text" 
            placeholder="Filter database list..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden font-medium"
          />
        </div>

        <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-3">ID Reference</th>
                <th className="p-3">Student Name</th>
                <th className="p-3"Course</th>
                <th className="p-3">Time In</th>
                <th className="p-3">Status State</th>
                <th className="p-3 text-right">Edit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center animate-pulse text-[10px] uppercase font-mono tracking-widest text-slate-400">Querying live arrays...</td></tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const logRecord = attendanceLogs[student.id]
                  const isEditingThisRow = editingStudentId === student.id

                  return (
                    <tr key={student.id} className="hover:bg-white transition-colors">
                      <td className="p-3 font-mono text-[10px] font-bold text-slate-400">{student.id}</td>
                      <td className="p-3 text-slate-900 font-bold">{student.name}</td>
                      <td className="p-3 text-[11px] text-slate-500">{student.program}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">{logRecord ? logRecord.log_time : '—'}</td>
                      
                      <td className="p-3">
                        {isEditingThisRow ? (
                          <select 
                            value={editStatusValue} 
                            onChange={(e) => setEditStatusValue(e.target.value)}
                            className="text-xs bg-white border border-slate-200 p-1 rounded-md font-bold text-slate-800"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Excused">Excused</option>
                          </select>
                        ) : (
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            logRecord && logRecord.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            logRecord && logRecord.status === 'Excused' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {logRecord ? logRecord.status : 'Absent'}
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {isEditingThisRow ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleSaveEditedStatus(student.id)} 
                              className="p-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                              title="Confirm Save"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => setEditingStudentId(null)} 
                              className="p-1 bg-slate-100 text-slate-500 rounded-md border border-slate-200 hover:bg-slate-200 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingStudentId(student.id)
                              setEditStatusValue(logRecord ? logRecord.status : 'Absent')
                            }}
                            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition inline-flex items-center gap-1 cursor-pointer font-bold text-[10px]"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan="6" className="p-6 text-center text-slate-400 text-[11px]">No structural entries matched the filter parameters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
