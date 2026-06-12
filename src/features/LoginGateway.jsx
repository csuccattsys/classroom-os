import React from 'react'
import { LogIn, Eye, AlertTriangle } from 'lucide-react'

export default function LoginGateway({
  email,
  setEmail,
  password,
  setPassword,
  loginError,
  authProcessing,
  handleLoginSubmit,
  handlePublicAccess,
  usgLogo
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-emerald-600 selection:text-white relative overflow-hidden font-sans antialiased">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-5">
        
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center overflow-hidden shadow-md mx-auto">
            <img src={usgLogo} alt="CSUCC USG Seal" className="h-full w-full object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight uppercase text-slate-900">CSUCC USG Governance Portal</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5"Please login to access the portal</p>
          </div>
        </div>

        {loginError && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <p>{loginError}</p>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Officer Email Address</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@csucc.edu.ph"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 bg-slate-50/50 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1"Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 bg-slate-50/50 transition"
            />
          </div>

          <button
            type="submit"
            disabled={authProcessing}
            className="w-full bg-slate-900 hover:bg-emerald-950 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="h-3.5 w-3.5" />
            {authProcessing ? 'Verifying Gateway...' : 'Authenticate Credentials'}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-[9px] text-slate-400 font-black uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <button
          type="button"
          onClick={handlePublicAccess}
          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-3 rounded-xl border border-slate-200/60 shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Eye className="h-3.5 w-3.5 text-slate-500" />
          Access Public Student View
        </button>

      </div>
    </div>
  )
}
