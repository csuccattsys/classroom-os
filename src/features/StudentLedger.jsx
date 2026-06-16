import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { User, Shield, Search, Loader2, GraduationCap, ChevronLeft, ChevronRight, Edit2, Check, X } from 'lucide-react'

export default function StudentLedger({ userRole }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCollege, setSelectedCollege] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  
  // --- NEW STATES FOR PAGINATION & ROSTER INTERACTION ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [editForm, setEditForm] = useState({ college: '', program: '', name: '' })
  const [updateProcessing, setUpdateProcessing] = useState(false)

  // Map the institutional userRoles to their corresponding database college strings
  const roleToCollegeMap = {
    'cba_lsg': 'CBA',
    'ceit_lsg': 'CEIT',
    'citte_lsg': 'CITTE',
    'cthm_lsg': 'CTHM',
    'dlhs_sgg': 'DLHS' // Matches your exact council configuration name
  }

  // Determine if the current executive logging in has restricted visibility
  const assignedCollege = roleToCollegeMap[userRole]
  const isRestrictedExecutive = !!assignedCollege
  
  // Only allow global USG executives or administrative accounts to mutate roster records
  const canUpdateRecords = userRole === 'usg' || userRole === 'admin'

  // Define the master node list
  const colleges = ['ALL', 'CBA', 'CEIT', 'CITTE', 'CTHM', 'DLHS']

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true)
        let query = supabase
          .from('profiles')
          .select('id, name, email, role, college, program')
          .eq('role', 'student')

        // SECURITY GUARD CRITERIA: Force filter if local council, otherwise follow tab selection
        if (isRestrictedExecutive) {
          query = query.eq('college', assignedCollege)
        } else if (selectedCollege !== 'ALL') {
          query = query.eq('college', selectedCollege)
        }

        const { data, error } = await query.order('name', { ascending: true })
        if (error) throw error
        setStudents(data || [])
        setCurrentPage(1) // Reset view back to initial page when context changes
      } catch (err) {
        console.error('Ledger module scope separation error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [selectedCollege, userRole, isRestrictedExecutive, assignedCollege])

  // --- MUTATION HANDLING INTERFACE NODES ---
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
        .from('profiles')
        .update({ 
          college: editForm.college.toUpperCase(), 
          program: editForm.program,
          name: editForm.name
        })
        .eq('id', studentId)

      if (error) throw error
      
      // Update local state on client framework safely
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...editForm, college: editForm.college.toUpperCase() } : s))
      setEditingStudentId(null)
    } catch (err) {
      console.error('Failed to patch directory row profile data context:', err.message)
    } finally {
      setUpdateProcessing(false)
    }
  }

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.program?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // --- MEMORY-SLICED CLIENT PAGINATION COMPILER ---
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
            {canUpdateRecords && " • Inline Management Feature Active"}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
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

      {/* FILTER BUTTON INTERFACE LAYER */}
      <div className="flex flex-wrap gap-1.5">
        {colleges.map((c) => {
          // If local board executive logged in, disable or hide interaction states for other colleges
          const isDisabled = isRestrictedExecutive && assignedCollege !== c
          if (isRestrictedExecutive && c === 'ALL') return null // Do not show 'All' options to localized nodes
          if (isDisabled) return null // Completely isolates the UI node block to only show their assigned college pill

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
                  <th className="py-3 px-4">Institutional Email</th>
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
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{student.email || 'N/A'}</td>
                      
                      {/* COLLEGE BLOCK COLUMN COMPILER */}
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
                      
                      {/* PROGRAM ROUTING DIRECTORY BLOCK */}
                      <td className="py-3 px-4 text-slate-600 font-semibold">
                        {isRowEditing ? (
                          <input
                            type="text"
                            value={editForm.program}
                            onChange={(e) => setEditForm({ ...editForm, program: e.target.value })}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-emerald-500"
                          />
                        ) : (
                          student.program || 'Not Configured'
                        )}
                      </td>

                      {/* ADMINISTRATIVE INLINE MUTATION CONTAINER TRRIGERS */}
                      {canUpdateRecords && (
                        <td className="py-3 px-4 text-right">
                          {isRowEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                disabled={updateProcessing}
                                onClick={() => handleUpdateSubmit(student.id)}
                                className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 transition-colors cursor-pointer"
                                title="Commit adjustments"
                              >
                                {updateProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1 rounded-md bg-slate-50 hover:bg-rose-500 text-slate-500 hover:text-white border border-slate-200 transition-colors cursor-pointer"
                                title="Abort inline edits"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(student)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-slate-50 hover:bg-slate-900 text-slate-500 hover:text-white border border-slate-200 transition-all cursor-pointer"
                              title="Modify institutional metrics"
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

          {/* PERFORMANCE PAGINATION CONTROL UNIT METRICS LAYOUT */}
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
