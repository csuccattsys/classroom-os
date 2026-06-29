import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Globe, 
  HelpCircle, 
  Mail, 
  MapPin, 
  Link, 
  ExternalLink 
} from 'lucide-react';

export default function StudentPortal() {
  // ================= STATE MANAGEMENT =================
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= DATA FETCH =================
  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        setLoading(true);
        // Replace this mock data array with your actual backend/database API response
        const mockData = [
          {
            id: 1,
            category: 'Academic Advisory',
            title: 'Enrollment Schedule for First Semester, Academic Year 2026-2027',
            content: 'Please find below the official schedule for online and on-site enrollment processing. Ensure all clearance requirements are cleared in the MySchool portal before proceeding to your respective department chairs.',
            created_at: '2026-06-28T08:30:00Z',
            publisher: 'Office of the University Registrar',
            image_url: ''
          },
          {
            id: 2,
            category: 'USG Announcement',
            title: 'Distribution of Student IDs and Certificate of Registration (COR) Cases',
            content: 'Good day, CSUCCians! The University Student Government will begin distributing student ID jackets and COR protectors starting tomorrow at the USG Help Desk. Please bring your valid school ID or enrollment slip for verification.',
            created_at: '2026-06-29T10:15:00Z',
            publisher: 'University Student Government',
            image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1000'
          }
        ];
        setItems(mockData);
      } catch (error) {
        console.error("Error loading portal data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, []);

  // ================= UTILITY FUNCTIONS =================
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= LEFT / MAIN CONTENT AREA ================= */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium animate-pulse">
                Synchronizing live campus data registry...
              </div>
            ) : items.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                No active announcements or advisories found.
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id || index} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3.5 shadow-sm">
                    
                    <div className="flex justify-between items-start gap-4">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.category || 'General Advisory'}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <Clock className="h-3 w-3" /> {formatTime(item.created_at)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-800 tracking-tight">{item.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                    </div>

                    {item.image_url && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 max-h-72 flex items-center justify-center">
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="pt-1 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                      <User className="h-3 w-3 text-slate-400" /> {item.publisher || 'University Student Government'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CAMPUS ABOUT US STRIP */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 transition-all duration-300 hover:shadow-sm">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-600" /> Caraga State University Cabadbaran Campus
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This portal serves as an interactive ecosystem deployed for students to interact directly with internal campus commission bodies, review regulatory timelines, and maintain a highly verified line of dialogue with local councils.
              </p>
            </div>
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>USG Portal v1.2.0</span>
              <span>Secure SSL Registry Link</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT / SIDEBAR PUBLIC CHANNELS ================= */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* HIGH-GRAPHICS USG HELPDESK CARD */}
          <div className="bg-slate-900 text-white border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg relative overflow-hidden group">
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <span className="text-slate-100 font-black text-xs uppercase tracking-wider">USG Help Desk</span>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                Live Support
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Have concerns regarding local structural policies, clearance exceptions, or financial audits? Reach out directly to our help channels:
            </p>
            
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 transform hover:translate-x-1">
                <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/10">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Official Email</span>
                  <span className="truncate font-mono text-[11px] text-slate-300">usg@csucc.edu.ph</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 transform hover:translate-x-1">
                <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/10 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Physical Office Location</span>
                  <span className="text-[11px] text-slate-300 leading-normal font-medium">Original Office Near Swimming Pool alongside LCO Room</span>
                </div>
              </div>
            </div>
          </div>

          {/* HIGH-GRAPHICS DYNAMIC INSTITUTIONAL LINKS HUB */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3.5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2.5">
              <div className="p-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
                <Link className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              Institutional Links Hub
            </div>
            
            <div className="grid grid-cols-1 gap-2.5 pt-0.5">
              <a 
                href="https://myschool.csucc.edu.ph" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-500/20 text-slate-700 hover:text-emerald-900 transition-all duration-200 group text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors shrink-0" />
                  <span className="truncate">MySchool Student Portal</span>
                </div>
                <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
