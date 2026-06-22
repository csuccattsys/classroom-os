import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { User, Shield, Search, Loader2, GraduationCap, ChevronLeft, ChevronRight, Edit2, Check, X, Upload } from 'lucide-react'

export default function StudentLedger({ userRole }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCollege, setSelectedCollege] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  
  // --- PAGINATION, MUTATION, & BULK UPLOAD STATES ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [editForm, setEditForm] = useState({ college: '', program: '', name: '' })
  const [updateProcessing, setUpdateProcessing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Map institutional userRoles to their corresponding database college strings
  const roleToCollegeMap = {
    'cba_lsg': 'CBA',
    'ceit_lsg': 'CEIT',
    'citte_lsg': 'CITTE',
    'cthm_lsg': 'CTHM',
    'dlhs_sgg': 'DLHS'
  }

  const assignedCollege = roleToCollegeMap[userRole]
  const isRestrictedExecutive = !!assignedCollege
  const canUpdateRecords = userRole === 'usg' || userRole === 'admin'

  const colleges = ['ALL', 'CBA', 'CEIT', 'CITTE', 'CTHM', 'DLHS']

  const fetchStudents = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('students')
        .select('id, id_number, name, role, college, program, year_level')
        .eq('role', 'student')

      if (isRestrictedExecutive) {
        query = query.eq('college', assignedCollege)
      } else if (selectedCollege !== 'ALL') {
        query = query.eq('college', selectedCollege)
      }

      const { data, error } = await query.order('name', { ascending: true })
      if (error) throw error
      setStudents(data || [])
      setCurrentPage(1)
    } catch (err) {
      console.error('Ledger module scope separation error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [selectedCollege, userRole, isRestrictedExecutive, assignedCollege])

  // --- NATIVE ZERO-DEPENDENCY SPREADSHEET PARSER ENGINE (EXCEL & CSV) ---
  const handleSpreadsheetUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Safely check for global XLSX engine loaded via index.html script tag
    const ExcelEngine = window.XLSX
    if (!ExcelEngine) {
      alert("Spreadsheet compilation engine is still warming up. Please try again in a moment.")
      return
    }

    try {
      setUploading(true)
      const reader = new FileReader()

      reader.onload = async (event) => {
        // Read raw file buffer as an unsigned 8-bit integer array to fully support Excel compressed binaries
        const data = new Uint8Array(event.target.result)
        const workbook = ExcelEngine.read(data, { type: 'array' })
        
        // Grab the primary active worksheet tab inside the spreadsheet workbook file
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert sheet grid coordinates directly into standard JSON array row keys
        const rawJsonRows = ExcelEngine.utils.sheet_to_json(worksheet)

        if (rawJsonRows.length === 0) {
          alert("The uploaded matrix file contains zero readable rows.")
          setUploading(false)
          return
        }

        const preparedRecords = rawJsonRows
          .map(row => {
            // Updated mappings to strictly support ID, Name, College, Course/Program, Year Level
            const targetId = row['ID'] || row['id']
            const targetName = row['Name'] || row['name'] || 'Anonymous User'
            const targetCollege = row['College'] || row['college']
            const targetProgram = row['Course/Program'] || row['course/program'] || row['Course'] || row['Program']
            const targetYearLevel = row['Year Level'] || row['year_level'] || row['Year']

            if (!targetId) return null // Ignore profiles or rows lacking the primary ID string

            return {
              id_number: targetId.toString().trim(), 
              name: targetName.toString().trim(),
              role: 'student',
              college: targetCollege?.toString().toUpperCase().trim() || 'UNASSIGNED',
              program: targetProgram?.toString().trim() || 'Not Configured',
              year_level: targetYearLevel?.toString().trim() || 'N/A'
            }
          })
          .filter(Boolean)

        if (preparedRecords.length === 0) {
          alert("No valid rows matched the compilation system parameters. Make sure your headers contain 'ID'.")
          setUploading(false)
          return
        }

        // Upsert directly into the Supabase 'students' matrix table matching unique values
        const { error } = await supabase
          .from('students')
          .upsert(preparedRecords, { onConflict: 'id_number' })

        if (error) throw error

        alert(`Successfully synchronized ${preparedRecords.length} student records into the ledger node!`)
        fetchStudents()
      }

      // Changed from readAsText to readAsArrayBuffer to prevent binary parsing corruption for xlsx/xls
      reader.readAsArrayBuffer(file)
    } catch (err) {
      console.error('Spreadsheet text reader execution fault:', err.message)
      alert(`Parsing fault detected: ${err.message}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // --- INLINE ROW EDIT HANDLING ---
  const startEditing = (student) => {
    if (!canUpdateRecords) return
    setEditingStudentId(student.id)
    setEditForm({ college: student.college || '', program: student.program || '', name: student.name || '' })
  }

  const cancelEditing = () => {
    setEditingStudentId(null)
  }

  const handleUpdateSubmit = async (studentId) => {
    try {
      setUpdateProcessing(true)
      const { error } = await supabase
        .from('students')
        .update({ 
          college: editForm.college.toUpperCase(), 
          program: editForm.program,
          name: editForm.name
        })
        .eq('id', studentId)

      if (error) throw error
      
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...editForm, college: editForm.college.toUpperCase() } : s))
      setEditingStudentId(null)
    } catch (err) {
      console.error('Failed to patch directory data row context:', err.message)
    } finally {
      setUpdateProcessing(false)
    }
  }

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.program?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // --- PAGINATION COMPILER ---
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentPaginatedRows = filteredStudents.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
            Student Directory Module
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isRestrictedExecutive 
              ? `Scoped Departmental Ledger View: Restricted to ${assignedCollege}` 
              : 'Global Institutional Roster Registry (Unrestricted USG Access)'
            }
          </p>
        </div>
        
        {/* ACTION PANEL */}
        <div className="flex flex-col xs:flex-row gap-2 items-stretch xs:items-center w-full sm:w-auto">
          {canUpdateRecords && (
            <div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleSpreadsheetUpload}
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
              />
              <button
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 border border-emerald-200/80 hover:border-emerald-600 text-emerald-700 hover:text-white px-3 py-1.5 rounded-xl transition-all duration-150 text-xs font-bold uppercase tracking-wide cursor-pointer shadow-xs disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                <span>{uploading ? 'Parsing Batch...' : 'Bulk Upload Roster'}</span>
              </button>
            </div>
          )}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search roster..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* FILTER PILLS */}
      <div className="flex flex-wrap gap-1.5">
        {colleges.map((c) => {
          const isDisabled = isRestrictedExecutive && assignedCollege !== c
          if (isRestrictedExecutive && c === 'ALL') return null
          if (isDisabled) return null

          return (
            <button
              key={c}
              onClick={() => setSelectedCollege(c)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                selectedCollege === c || isRestrictedExecutive
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100'
              }`}
            >
              {c === 'ALL' ? '🌐 All Colleges' : `${c} Department`}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold tracking-widest uppercase gap-2">
          <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
          Isolating Secure Scope Ledger Node...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-12 text-center text-xs font-medium text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          No records discovered matching criteria under this node.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200/60">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-[9px] font-black uppercase tracking-widest text-slate-500">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Student ID Number</th>
                  <th className="py-3 px-4">College Node</th>
                  <th className="py-3 px-4">Program Pathway</th>
                  {canUpdateRecords && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {currentPaginatedRows.map((student) => {
                  const isRowEditing = editingStudentId === student.id

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <User className="h-3 w-3" />
                          </div>
                          {isRowEditing ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-800 focus:outline-emerald-500"
                            />
                          ) : (
                            student.name || 'Anonymous User'
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{student.id_number || 'N/A'}</td>
                      
                      <td className="py-3 px-4">
                        {isRowEditing ? (
                          <select
                            value={editForm.college}
                            onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                            className="bg-white border border-slate-300 rounded p-1 text-xs font-semibold uppercase text-slate-800"
                          >
                            {colleges.filter(val => val !== 'ALL').map(node => (
                              <option key={node} value={node}>{node}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="bg-slate-100 text-slate-800 text-[9px] font-black tracking-wide px-2 py-0.5 rounded border border-slate-200/40 uppercase">
                            {student.college || 'Unassigned'}
                          </span>
                        )}
                      </td>
                      
                      <td className="py-3 px-4 text-slate-600 font-semibold">
                        {isRowEditing ? (
                          <input
                            type="text"
                            value={editForm.program}
                            onChange={(e) => setEditForm({ ...editForm, program: e.target.value })}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-emerald-500"
                          />
                        ) : (
                          student.program ? (student.year_level ? `${student.program} - ${student.year_level}` : student.program) : 'Not Configured'
                        )}
                      </td>

                      {canUpdateRecords && (
                        <td className="py-3 px-4 text-right">
                          {isRowEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                disabled={updateProcessing}
                                onClick={() => handleUpdateSubmit(student.id)}
                                className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 transition-colors cursor-pointer"
                              >
                                {updateProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1 rounded-md bg-slate-50 hover:bg-rose-500 text-slate-500 hover:text-white border border-slate-200 transition-colors cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(student)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-slate-50 hover:bg-slate-900 text-slate-500 hover:text-white border border-slate-200 transition-all cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION PANEL CONTROLS */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            <div>
              Showing <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, filteredStudents.length)}</span> of <span className="font-bold text-slate-700">{filteredStudents.length}</span> registry records
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <div className="px-3 py-1 bg-slate-900 text-white font-black text-[10px] tracking-wider rounded-md shadow-xs">
                PAGE {currentPage} / {totalPages}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
