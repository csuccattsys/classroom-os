import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { 
  UserCheck, Search, Database, CheckCircle, RefreshCw, 
  PlusCircle, ShieldAlert, Calendar, ArrowLeft, ClipboardList, 
  Download, Edit2, Trash2, Check, X, Users, UserX, UserCheck2, HelpCircle
} from 'lucide-react'

export default function AttendanceTracker({ userRole }) {
  // --- STATE CONTROL ---
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventsList, setEventsList] = useState([])
  const [studentDb, setStudentDb] = useState([])
  const [attendanceLogs, setAttendanceLogs] = useState({}) // Format: { student_id: { log_id, log_time, status } }

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
  const inputRef = useRef(null)

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
    if (!selectedEvent) {
      fetchEvents()
    } else {
      fetchAttendanceSheetData(selectedEvent.id)
      // Keep structural input target focused for seamless external scanning hardware integration
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    setTrackerMessage({ text: '', type: '' })
  }, [selectedEvent, userRole])

  // --- COMPUTE STATISTICS METRICS ---
  const totalRosterCount = studentDb.length
  const presentCount = Object.values(attendanceLogs).filter(l => l.status === 'Present').length
  const excusedCount = Object.values(attendanceLogs).filter(l => l.status === 'Excused').length
  const absentCount = totalRosterCount - presentCount - excusedCount
  const attendanceRate = totalRosterCount > 0 ? Math.round((presentCount / totalRosterCount) * 100) : 0

  // --- EXPORT TO SPREADSHEET ENGINE ---
  const handleExportToCSV = () => {
    if (!selectedEvent || studentDb.length === 0) return

    const headers = ['Student ID', 'Full Legal Name', 'College Cluster', 'Program Specialty', 'Verification Timestamp', 'Attendance Status']
    
    const rows = studentDb.map(student => {
      const logRecord = attendanceLogs[student.id]
      return [
        `"${student.id}"`, 
        `"${student.name}"`,
        `"${student.college ? student.college.split('_')[0].toUpperCase() : '—'}"`,
        `"${student.program}"`,
        `"${logRecord ? logRecord.log_time : '—'}"`,
        `"${logRecord ? logRecord.status : 'Absent'}"`
      ]
    })

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    
    const cleanFileName = `${selectedEvent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attendance_report.csv`
    link.setAttribute("download", cleanFileName)
    document.body.appendChild(link)
    
    link.click()
    document.body.removeChild(link)
  }

  // --- EDIT & OVERRIDE ACTIONS ---
  const handleSaveEditedStatus = async (studentId) => {
    const logRecord = attendanceLogs[studentId]
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    try {
      if (editStatusValue === 'Absent') {
        if (logRecord) {
          const { error } = await supabase.from('attendance_logs').delete().eq('id', logRecord.log_id)
          if (error) throw error
        }
      } else {
        if (logRecord) {
          const { error } = await supabase.from('attendance_logs')
            .update({ status: editStatusValue })
            .eq('id', logRecord.log_id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('attendance_logs')
            .insert([{ event_id: selectedEvent.id, student_id: studentId, status: editStatusValue, log_time: currentTime }])
          if (error) throw error
        }
      }
      setTrackerMessage({ text: 'Validation record overridden successfully.', type: 'success' })
      setEditingStudentId(null)
      fetchAttendanceSheetData(selectedEvent.id)
    } catch (err) {
      setTrackerMessage({ text: 'Failed to modify record overrides on remote ledger.', type: 'error' })
    }
  }

  const handleDeleteEvent = async (eventId, e) => {
    e.stopPropagation()
    if (!window.confirm("Are you entirely sure you want to delete this event activity and all its attached attendance sheets? This action is permanent.")) return

    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) throw error
      setTrackerMessage({ text: 'Activity permanently removed from institutional database.', type: 'success' })
      fetchEvents()
    } catch (err) {
      setTrackerMessage({ text: 'Failed to complete server record drop request.', type: 'error' })
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!newEventTitle.trim()) return
    try {
      const { error } = await supabase.from('events').insert([{ title: newEventTitle.trim(), college: userRole }])
      if (error) throw error
      setNewEventTitle('')
      setTrackerMessage({ text: 'New tracking terminal generated and active.', type: 'success' })
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
      setTrackerMessage({ text: `Student ID [${targetId}] matches no records within registration scope.`, type: 'error' })
      setInputStudentId('')
      inputRef.current?.focus()
      return
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    try {
      const { error } = await supabase
        .from('attendance_logs')
        .insert([{ event_id: selectedEvent.id, student_id: targetId, status: 'Present', log_time: currentTime }])

      if (error) {
        if (error.code === '23505') {
          setTrackerMessage({ text: `Duplicate Blocked: ${student.name} is already checked in.`, type: 'error' })
        } else {
          throw error
        }
        setInputStudentId('')
        inputRef.current?.focus()
        return
      }

      setTrackerMessage({ text: `Verified: ${student.name} logged into event successfully.`, type: 'success' })
      setInputStudentId('')
      fetchAttendanceSheetData(selectedEvent.id)
    } catch (err) {
      setTrackerMessage({ text: 'Failed to append record packet onto cloud logs.', type: 'error' })
    } finally {
      inputRef.current?.focus()
    }
  }

  const filteredStudents = studentDb.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || student.id?.includes(searchTerm)
  )

  // --- SCREEN A: EVENTS DASHBOARD SELECTION INDEX ---
  if (!selectedEvent) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* EVENT DEPLOYMENT FORM */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 mb-3 flex items-center gap-1.5">
            <PlusCircle className="h-4 w-4 text-emerald-600" /> Deploy New Activity
          </h3>
          <form onSubmit={handleCreateEvent} className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <input 
              type="text" 
              placeholder="Enter Session Title (e.g., USG General Assembly 2026)..."
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-semibold text-slate-800 placeholder-slate-400"
            />
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition cursor-pointer active:scale-[0.98]">
              Deploy Track
            </button>
          </form>
          {trackerMessage.type === 'success' && <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> {trackerMessage.text}</p>}
        </div>

        {/* ACTIVE PACKETS INDEX GRID */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" /> Monitored Campus Events
              </h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Select an event below to start taking attendance.</p>
            </div>
            <button onClick={fetchEvents} className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer">
              <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {loading && eventsList.length === 0 ? (
            <div className="py-12 text-center text-[10px] font-mono tracking-widest text-slate-400 uppercase animate-pulse">Fetching system entities...</div>
          ) : eventsList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eventsList.map(event => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="p-4 bg-slate-50 hover:bg-white hover:shadow-md hover:border-slate-300/80 border border-slate-200/60 rounded-xl transition-all duration-200 cursor-pointer group flex items-start justify-between"
                >
                  <div className="space-y-1 pr-4">
                    <p className="text-xs font-black text-slate-900 group-hover:text-emerald-600 transition duration-150">{event.title}</p>
                    <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">System Deployment: {event.created_at ? new Date(event.created_at).toLocaleDateString() : '—'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[8px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                      {event.college ? event.college.split('_')[0] : 'USG'}
                    </span>
                    <button 
                      onClick={(e) => handleDeleteEvent(event.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                      title="Drop Event Ledger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-400 p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">No operational tracking channels found for your organizational entity branch scope.</p>
          )}
        </div>
      </div>
    )
  }

  // --- SCREEN B: DETAILED ATTENDANCE MANAGEMENT SHEET ---
  return (
    <div className="space-y-6 animate-fade-in">
      {/* SHEET HEADER FRAMEWORK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 text-white p-4 rounded-2xl gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/40 font-mono">Attendance Tracker for</span>
            <h2 className="text-sm font-black tracking-tight uppercase mt-0.5">{selectedEvent.title}</h2>
          </div>
        </div>
        
        <button 
          onClick={handleExportToCSV}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer self-start md:self-center"
        >
          <Download className="h-3.5 w-3.5" /> Export Data Sheet (.CSV)
        </button>
      </div>

      {/* RE-ENGINEERED LIVE METRICS COUNTER GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Users className="h-4 w-4" /></div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Students</div>
            <div className="text-sm font-black text-slate-800">{totalRosterCount}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><UserCheck2 className="h-4 w-4" /></div>
          <div>
            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">Present</div>
            <div className="text-sm font-black text-slate-800">{presentCount}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><HelpCircle className="h-4 w-4" /></div>
          <div>
            <div className="text-[9px] font-black text-amber-500 uppercase tracking-wider">Excused</div>
            <div className="text-sm font-black text-slate-800">{excusedCount}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><UserX className="h-4 w-4" /></div>
          <div>
            <div className="text-[9px] font-black text-rose-400 uppercase tracking-wider">Absent</div>
            <div className="text-sm font-black text-slate-800">{absentCount}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl col-span-2 lg:col-span-1 flex items-center gap-3 shadow-xs bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/30 via-white to-white">
          <div className="p-2 bg-emerald-600 rounded-lg text-white font-black text-[10px] font-mono shadow-xs">{attendanceRate}%</div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Turnout Rate</div>
            <div className="text-sm font-black text-slate-800">Attendance</div>
          </div>
        </div>
      </div>

      {/* REALTIME TRANSACTIONS INPUT MODALITY */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-slate-400" /> Peripheral Terminal Scanning Interface
        </h4>
        <form onSubmit={handleManualLog} className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Scan ID Code Bar or Process Reference Key..."
            value={inputStudentId}
            onChange={(e) => setInputStudentId(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-mono font-bold tracking-wide text-slate-800"
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-5 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1">
            Log Attendance
          </button>
        </form>

        {trackerMessage.text && (
          <div className={`mt-3.5 p-3 rounded-xl text-[11px] font-semibold flex items-center gap-2.5 border ${
            trackerMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {trackerMessage.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" /> : <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />}
            <span>{trackerMessage.text}</span>
          </div>
        )}
      </div>

      {/* CORE DATA SHEET DATA TABLE COMPONENT */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-400" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-tight text-slate-900"> List of Attendees</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Live monitoring records from the local department directory context</p>
            </div>
          </div>
          <input 
            type="text" 
            placeholder="Search ID Number here..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden font-medium text-slate-700"
          />
        </div>

        <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-slate-50/20 shadow-inner">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">
                  <th className="p-3.5 pl-4">ID No.</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Course or Program</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-4 text-right">Edit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-[10px] uppercase font-mono tracking-widest text-slate-400 animate-pulse">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-emerald-600" /> Synchronization query in process...
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map(student => {
                    const logRecord = attendanceLogs[student.id]
                    const isEditingThisRow = editingStudentId === student.id

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors duration-100">
                        <td className="p-3.5 pl-4 font-mono text-[10px] font-bold text-slate-400">{student.id}</td>
                        <td className="p-3.5 text-slate-900 font-bold">{student.name}</td>
                        <td className="p-3.5 text-[11px] text-slate-500 font-medium uppercase tracking-tight">{student.program || 'General'}</td>
                        <td className="p-3.5 font-mono text-[10px] text-slate-400">{logRecord ? logRecord.log_time : '—'}</td>
                        
                        <td className="p-3.5">
                          {isEditingThisRow ? (
                            <select 
                              value={editStatusValue} 
                              onChange={(e) => setEditStatusValue(e.target.value)}
                              className="text-xs bg-white border border-slate-300 px-2 py-0.5 rounded-md font-bold text-slate-800 outline-hidden ring-1 ring-slate-200"
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Excused">Excused</option>
                            </select>
                          ) : (
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md font-mono ${
                              logRecord && logRecord.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                              logRecord && logRecord.status === 'Excused' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                              'bg-rose-50 text-rose-700 border border-rose-200/60'
                            }`}>
                              {logRecord ? logRecord.status : 'Absent'}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 pr-4 text-right">
                          {isEditingThisRow ? (
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => handleSaveEditedStatus(student.id)} 
                                className="p-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                title="Commit Adjustments"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => setEditingStudentId(null)} 
                                className="p-1 bg-slate-100 text-slate-500 rounded-md border border-slate-200 hover:bg-slate-200 transition cursor-pointer"
                                title="Discard Adjustments"
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
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition inline-flex items-center gap-1 cursor-pointer font-bold text-[10px] uppercase tracking-wider"
                            >
                              <Edit2 className="h-3 w-3" /> Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 text-xs font-medium">
                      No structural student identity files match the search filter parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
