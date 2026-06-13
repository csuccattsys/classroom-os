import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Trash2, Megaphone, Tag, User, Image, Loader2, Sparkles, Upload } from 'lucide-react'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('General Advisory')
  const [publisher, setPublisher] = useState('')
  
  // Image states shifted to look for file binaries
  const [imageFile, setImageFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  
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
    let uploadedUrl = null

    // 1. Process local image file uploads to storage bucket if assigned
    if (imageFile) {
      try {
        setUploadingImage(true)
        // Generate a clean completely unique randomized path filename structure
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `bulletins/${fileName}`

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('announcements')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        // Get public download url from CDN storage container bucket safely
        const { data: urlData } = supabase.storage
          .from('announcements')
          .getPublicUrl(filePath)

        uploadedUrl = urlData.publicUrl
      } catch (error) {
        console.error('File Asset Streaming Exception:', error.message)
        alert('Image asset routing breakdown: ' + error.message)
        setPosting(false)
        setUploadingImage(false)
        return
      }
    }

    // 2. Submit values to Postgres
    const { error } = await supabase.from('announcements').insert([
      { 
        title, 
        content,
        category,
        publisher: publisher.trim() ? publisher : 'University Student Government',
        image_url: uploadedUrl
      }
    ])
    
    setPosting(false)
    setUploadingImage(false)
    
    if (!error) { 
      setTitle('')
      setContent('')
      setCategory('General Advisory')
      setPublisher('')
      setImageFile(null)
      // Clear out native physical DOM file input element reset
      const fileInput = document.getElementById('bulletin-file-picker')
      if (fileInput) fileInput.value = ''
      
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

          {/* UPLOADABLE GRAPHIC IMAGE COMPONENT UPGRADE */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Image className="h-3 w-3" /> Info Graphic Attachment
            </label>
            <div className="relative flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50/40 hover:bg-slate-50 transition-colors group">
                <div className="flex flex-col items-center justify-center pt-4 pb-3 text-center px-4">
                  <Upload className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors mb-1" />
                  <p className="text-xs text-slate-600 font-medium">
                    {imageFile ? (
                      <span className="text-emerald-600 font-bold truncate block max-w-[200px]">📎 {imageFile.name}</span>
                    ) : 'Click to upload or drag image file'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or WEBP formats supported</p>
                </div>
                <input 
                  id="bulletin-file-picker" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0])
                    }
                  }}
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Main Content Body Description Text Area */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Broadcast Parameters Description</label>
            <textarea
              rows="3"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter comprehensive announcement content details here..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/30 transition resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={posting || uploadingImage}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-2.5 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {posting || uploadingImage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadingImage ? 'Uploading Graphic File...' : 'Deploying Layer...'}
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
