import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    setLoading(true)
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setAnnouncements(data)
    setLoading(false)
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setPosting(true)
    const { error } = await supabase
      .from('announcements')
      .insert([{ title, content }])

    setPosting(false)
    if (error) {
      alert(`Failed to post: ${error.message}`)
    } else {
      setTitle('')
      setContent('')
      fetchAnnouncements() // Refresh feed
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Post Creator Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Create Announcement</h3>
        <form onSubmit={handlePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Midterm Exam Schedule Changed"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Message Content</label>
            <textarea
              rows="4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your announcement details here..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={posting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 rounded-lg transition disabled:bg-gray-400"
          >
            {posting ? 'Publishing...' : 'Publish Announcement'}
          </button>
        </form>
      </div>

      {/* Live Bulletin Feed Grid */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Active Notice Board</h3>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading notices...</div>
        ) : announcements.length === 0 ? (
          <div className="bg-white p-8 text-center text-gray-400 border border-dashed rounded-xl">
            No announcements posted yet. Use the dashboard tool to create one!
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-between items-start gap-4">
                <h4 className="font-bold text-gray-900 text-base">{item.title}</h4>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{item.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
