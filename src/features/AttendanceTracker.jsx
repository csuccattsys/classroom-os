import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient' // Adjust the import path based on your file structure
import { 
  UserCheck, Search, Database, CheckCircle, 
  RefreshCw, SlidersHorizontal, PlusCircle, ShieldAlert 
} from 'lucide-react'

export default function AttendanceTracker({ userRole }) {
  const [studentDb, setStudentDb] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [inputStudentId, setInputStudentId] = useState('')
  const [loading, setLoading] = useState(true)
  const [trackerMessage, setTrackerMessage] = useState({ text: '', type: '' })

  // Determine RBAC isolation tier
  const isCollegeLSG = ['cba_lsg', 'ceit_lsg', 'citte_lsg', 'cthm_lsg'].includes(userRole)
  const [activeCollegeTab, setActiveCollegeTab] = useState(isCollegeLSG ? userRole : 'all')

  const collegeMetadata = {
    all: { label: 'All Campus Nodes', styles: 'border-slate-200 text-slate-700 bg-slate-100' },
    ceit_lsg: { label: 'CEIT Department', styles: 'border-blue-200 text-blue-700 bg-blue-50/50' },
    cba_lsg: { label: 'CBA Department', styles: 'border-purple-200 text-purple-700 bg-purple-50/50' },
    citte_lsg: { label: 'CITTE Department', styles: 'border-orange-200 text-orange-700 bg-orange-50/50' },
    cthm_lsg: { label: 'CTHM Department', styles: 'border-rose-200 text-rose-700 bg-rose-50/50' },
  }

  // Fetch student roster directly from Supabase
  const fetchStudentDatabase = async () => {
    try {
      setLoading(true)
      let query = supabase.from('students').select('*')

      // Safety Guard: If user is an LSG Officer, force-restrict query to their college only
      if (isCollegeLSG) {
        query = query.eq('college', userRole)
      }

      const { data, error } = await query.order('name', { ascending: true })

      if (error) throw error
      setStudentDb(data || [])
    } catch (err) {
      console.error('Database fetch error:', err.message)
      setTrackerMessage({ text: 'Failed to synchronize with live database.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Sync with data on component mount
  useEffect(() => {
    fetchStudentDatabase()
  }, [userRole])

  // Action Handler: Mutate state & log attendance in Supabase
  const handleManualLog = async (e) => {
    e.preventDefault()
    const targetId = inputStudentId.trim()
    if (!targetId) return

    setTrackerMessage({ text: '', type: '' })

    // Look up local copy to run validation guards before hitting DB
    const student = studentDb.find(s => s.id === targetId)

    if (!student) {
      // Fallback check: It might belong to another college if user is USG
      if (isCollegeLSG) {
        setTrackerMessage({ text: `Student ID ${targetId} not found or outside your department scope.`, type: 'error' })
        return
      }
    }

    // RBAC validation: Cross-department restriction check
    if (isCollegeLSG && student && student.college !== userRole) {
      setTrackerMessage({ text: 'Cross-department breach blocked. You lack clearance.', type: 'error' })
      return
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    try {
      // Update data directly on the Supabase Backend
      const { data, error } = await supabase
        .from('students')
        .update({ status: 'Present', log_time: timestamp })
        .eq('id', targetId)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setTrackerMessage({ text: `Verified and logged present.`, type: 'success' })
        setInputStudentId('')
        // Re-sync local state view with new database updates
        fetchStudentDatabase()
      } else {
        setTrackerMessage({ text: `ID ${targetId} does not exist in central record logs.`, type: 'error' })
      }
    } catch (err) {
      console.error('Supabase write error:', err.message)
      setTrackerMessage({ text: 'Failed to write record transaction to cloud.', type: 'error' })
    }
  }

  // Client-side table search & tab filter rendering pipeline
  const filteredStudents = studentDb.filter(student => {
    const matchesSearch = (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || student.id?.includes(searchTerm))
    const matchesCollege = activeCollegeTab === 'all' ? true : student.college === activeCollegeTab
    return matchesSearch && matchesCollege
  })

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* SECTION 1: LOG CONTROLLER INTERFACE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg"><UserCheck className="h-4 w-4" /></div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-tight text-slate-900">Event Attendance Console</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Live Supabase Input Node</p>
          </div>
        </div>

        <form onSubmit={handleManualLog} className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <input 
            type="text" 
            placeholder="Scan or Type Student ID (e.g., 2024-0001)..."
            value={inputStudentId}
            onChange={(e) => setInputStudentId(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-mono font-bold"
          />
          <button 
            type="submit" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Commit Log Entry
          </button>
        </form>

        {trackerMessage.text && (
          <div className={`mt-3 p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-2 border ${
            trackerMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {trackerMessage.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <ShieldAlert className="h-4 w-4 shrink-0" />}
            <span>{trackerMessage.text}</span>
          </div>
        )}
      </div>

      {/* SECTION 2: INTEGRATED DATABASE SHEET MANAGEMENT */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg"><Database className="h-4 w-4" /></div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-tight text-slate-900">Student Database Records</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                Isolated Segment: {collegeMetadata[activeCollegeTab].label}
              </p>
            </div>
          </div>

          <div className="flex gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter by Student Name/ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-medium"
              />
            </div>
            <button 
              onClick={fetchStudentDatabase} 
              className="p-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 cursor-pointer"
              title="Refresh Data from Supabase"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* REPARTITION PILL TABS */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" /> Database Department Separation
          </p>
          <div className="flex flex-wrap gap-1">
            {userRole === 'usg' || userRole === 'student' ? (
              Object.keys(collegeMetadata).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveCollegeTab(key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    activeCollegeTab === key 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {key === 'all' ? 'All Records' : key.split('_')[0].toUpperCase()}
                </button>
              ))
            ) : (
              <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${collegeMetadata[userRole].styles}`}>
                Locked to {userRole.split('_')[0]} Council Workspace Scope
              </div>
            )}
          </div>
        </div>

        {/* CORE DATATABLE GRID ELEMENT */}
        <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <th className="p-3">ID Reference</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">College Cluster</th>
                  <th className="p-3">Specialization Track</th>
                  <th className="p-3">Time Verified</th>
                  <th className="p-3 text-right">Status State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                      Pulling cloud directory state logs...
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-white transition-colors">
                      <td className="p-3 font-mono text-[10px] text-slate-500 font-bold">{student.id}</td>
                      <td className="p-3 text-slate-900 font-bold">{student.name}</td>
                      <td className="p-3">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider bg-slate-100 border border-slate-200/60 text-slate-600">
                          {student.college ? student.college.split('_')[0] : '—'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">{student.program}</td>
                      <td className="p-3 text-slate-400 font-mono text-[10px]">{student.log_time || '—'}</td>
                      <td className="p-3 text-right">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          student.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          student.status === 'Absent' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {student.status || 'Absent'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 font-medium text-[11px]">
                      No recorded sync items matched this database scope filter.
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
