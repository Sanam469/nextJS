"use client";
export default function UserProfile({params}: any) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 px-4 text-white">
            <div className="flex flex-col border border-white/10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-12 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] items-center text-center relative overflow-hidden">
                {/* Decorative soft glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-4xl font-bold mb-8 border border-white/20 shadow-2xl relative z-10">
                    {params?.id ? params.id.substring(0, 1).toUpperCase() : "U"}
                </div>
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-1">User Profile</h1>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black mb-12">Secure Identity Overview</p>
                    
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12"></div>

                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">User ID</p>
                    <div className="bg-black/60 border border-white/10 rounded-2xl p-5 mb-10 group hover:border-white/30 transition-all cursor-default">
                        <span className="text-sm font-mono text-white/80 break-all leading-relaxed tracking-wider">
                            {params.id}
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-3 bg-white/5 py-2 px-4 rounded-full border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Active Session</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => window.history.back()}
                className="mt-12 text-xs text-gray-500 hover:text-white uppercase tracking-[0.3em] font-bold transition-all flex items-center gap-2 group"
            >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
            </button>
        </div>
    )
}