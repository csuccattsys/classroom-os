import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Trash2, Megaphone, Tag, User, Image, Loader2, Sparkles } from 'lucide-react'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('General Advisory')
  const [publisher, setPublisher] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  
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
    const { error } = await supabase.from('announcements').insert([
      { 
        title, 
        content,
        category,
        publisher: publisher.trim() ? publisher : 'University Student Government',
        image_url: imageUrl.trim() ? imageUrl : null
      }
    ])
    setPosting(false)
    
    if (!error) { 
      setTitle('')
      setContent('')
      setCategory('General Advisory')
      setPublisher('')
      setImageUrl('')
      fetchAnnouncements()
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this broadcast? It will instantly disappear from student portals.')) return
    
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchAnnouncements()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Premium Creator Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm h-fit space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Broadcast Terminal</h3>
            <p className="text-xs text-slate-400 mt-0.5">Publish dynamic network bulletins.</p>
          </div>
        </div>
        
        <form onSubmit={handlePost} className="space-y-4">
          {/* Title Headline Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Notice Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Distribution of Student ID Lanyards"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/30 transition"
            />
          </div>

          {/* Category Dropdown Selection */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Category Tag
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/30 transition appearance-none cursor-pointer"
            >
              <option value="General Advisory">General Advisory</option>
              <option value="Academic">Academic</option>
              <option value="Advisory">Advisory</option>
              <option value="Event Clearance">Event Clearance</option>
              <option value="Financial Notice">Financial Notice</option>
            </select>
          </div>

          {/* Publisher Entity Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <User className="h-3 w-3" /> Publishing Office
            </label>
            <input
              type="text"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="e.g., Public Relations Office"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/30 transition"
            />
          </div>

          {/* Attachment Image URL Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Image className="h-3 w-3" /> External Graphic Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/bulletin-banner.png"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/30 transition"
            />
          </div>

          {/* Main Content Body Description Text Area */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Broadcast Parameters Description</label>
            <textarea
              rows="4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter comprehensive announcement content details here..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/30 transition resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={posting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-2.5 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {posting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deploying Layer...
              </>
            ) : 'Deploy Broadcast'}
          </button>
        </form>
      </div>

      {/* Interactive Bulletin Stream */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-emerald-600" /> Active Stream Matrix
        </h3>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <p className="text-xs font-medium">Streaming active ledger matrices...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            📡 Operational terminal empty. Transmit a broadcast command parameters set.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200/80 transition-all duration-300 relative group overflow-hidden">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 min-w-0">
                    <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100/60 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      {item.category || 'General Notice'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base tracking-tight truncate">{item.title}</h4>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {/* Secure Delete Management Command Trigger */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition"
                      title="Terminate Broadcast Notice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 mt-3 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                
                {/* Embedded Attached Graphic Preview Rendering slot */}
                {item.image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 max-h-48 flex items-center justify-center bg-slate-50/50">
                    <img 
                      src={item.image_url} 
                      alt="Attachment Preview" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <User className="h-3 w-3 text-slate-300" /> Issued By: <span className="text-slate-500 font-black">{item.publisher || 'USG Admin System'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
