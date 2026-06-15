import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { User, Shield, Search, Loader2, GraduationCap } from 'lucide-react'

export default function StudentLedger() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCollege, setSelectedCollege] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Updated array matching the exact colleges provided
  const colleges = ['ALL', 'CBA', 'CEIT', 'CITTE', 'CTHM', 'DLHS']

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true)
        let query = supabase
          .from('profiles')
          .select('id, name, email, role, college, program')
          .eq('role', 'student')

        if (selectedCollege !== 'ALL') {
          query = query.eq('college', selectedCollege)
        }

        const { data, error } = await query.order('name', { ascending: true })
        if (error) throw error
        setStudents(data || [])
      } catch (err) {
        console.error('Ledger module error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [selectedCollege])

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.program?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
            Student Directory Module
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Role-based institutional roster registry by academic branch.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search roster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {colleges.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCollege(c)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
              selectedCollege === c
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100'
            }`}
          >
            {c === 'ALL' ? '🌐 All Colleges' : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold tracking-widest uppercase gap-2">
          <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
          Querying Core Student Ledger...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-12 text-center text-xs font-medium text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          No records discovered matching criteria under this node.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Institutional Email</th>
                <th className="py-3 px-4">College Node</th>
                <th className="py-3 px-4">Program Pathway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <User className="h-3 w-3" />
                    </div>
                    {student.name || 'Anonymous User'}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{student.email || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-800 text-[9px] font-black tracking-wide px-2 py-0.5 rounded border border-slate-200/40 uppercase">
                      {student.college || 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-semibold">{student.program || 'Not Configured'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
