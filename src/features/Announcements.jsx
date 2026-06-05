import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => { fetchAnnouncements() }, [])

  async function fetchAnnouncements() {
    setLoading(true)
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setAnnouncements(data)
    setLoading(false)
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setPosting(true)
    const { error } = await supabase.from('announcements').insert([{ title, content }])
    setPosting(false)
    if (!error) { setTitle(''); setContent(''); fetchAnnouncements(); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Premium Creator Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Broadcast Terminal</h3>
          <p className="text-xs text-slate-400 mt-0.5">Publish dynamic network bulletins.</p>
        </div>
        <form onSubmit={handlePost} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notice Subject Headline"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/30 transition"
          />
          <textarea
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Broadcast brief parameters..."
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/30 transition resize-none"
          ></textarea>
          <button
            type="submit"
            disabled={posting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {posting ? 'Deploying...' : 'Deploy Broadcast'}
          </button>
        </form>
      </div>

      {/* Interactive Bulletin Stream */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Stream Matrix</h3>
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-medium">Streaming active layers...</div>
        ) : announcements.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            📡 Operational terminal empty. Transmit a broadcast command.
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all duration-300">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">General Notice</span>
                  <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed whitespace-pre-wrap">{item.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
