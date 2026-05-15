import React from 'react'

const Entry = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-white font-sans">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-800/50 p-8 text-center backdrop-blur-md border border-slate-700/50 shadow-2xl">
        
        {/* Decorative Top Glow */}
        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl"></div>

        {/* Modern Animated Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="animate-spin absolute h-full w-full rounded-full border-4 border-slate-700 border-t-blue-500"></div>
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Heading with Gradient Text */}
        <h2 className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
          Under Construction
        </h2>

        {/* Subtext */}
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          We are currently brainstorming and developing something amazing. Stay tuned for updates!
        </p>

        {/* Progress Badge */}
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-slate-700/40 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          Active Development
        </div>

      </div>
    </div>
  )
}

export default Entry