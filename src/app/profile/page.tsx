"use client";
import axios from "axios";
import Link from "next/link";
import React, {useState} from "react";
import {toast} from "react-hot-toast";
import {useRouter} from "next/navigation";
import ARGolf from "@/components/ARGolf";

export default function ProfilePage() {
    const router = useRouter()
    const [data, setData] = useState<any>({
        username: "",
        email: "",
        _id: ""
    })

    const [showDetails, setShowDetails] = useState(false)

    const logout = async () => {
        try {
            await axios.get('/api/users/logout')
            toast.success('Logout successful')
            router.push('/login')
        } catch (error:any) {
            console.log(error.message);
            toast.error(error.message)
        }
    }

    const getUserDetails = async () => {
        const res = await axios.get('/api/users/me')
        console.log(res.data);
        setData(res.data.data)
        setShowDetails(true)
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#050505] text-white selection:bg-white/20 flex-col lg:flex-row">
            {/* Slim Premium Sidebar - Responsive */}
            <aside className="w-full lg:w-20 h-16 lg:h-full border-b lg:border-b-0 lg:border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl flex lg:flex-col items-center justify-between lg:justify-start px-6 lg:px-0 lg:py-8 z-50">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-lg font-bold lg:mb-10 border border-white/10 shadow-2xl">
                    {data.username ? data.username.substring(0, 1).toUpperCase() : "U"}
                </div>

                <nav className="flex lg:flex-col gap-4 lg:gap-6">
                    <button 
                        onClick={getUserDetails}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group relative"
                        title="Account ID"
                    >
                        <svg className="w-5 h-5 text-white/40 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span className="hidden lg:block absolute left-full ml-4 px-2 py-1 bg-white text-black text-[9px] font-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity tracking-widest uppercase">ID</span>
                    </button>

                    <button 
                        onClick={logout}
                        className="p-3 rounded-xl hover:bg-red-500/10 transition-all group relative"
                        title="Logout"
                    >
                        <svg className="w-5 h-5 text-white/20 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        <span className="hidden lg:block absolute left-full ml-4 px-2 py-1 bg-red-500 text-white text-[9px] font-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity tracking-widest uppercase">Exit</span>
                    </button>
                </nav>

                <div className="hidden lg:block rotate-180 [writing-mode:vertical-lr] text-[6px] font-black uppercase tracking-[1em] text-white/5 mt-auto">
                    AR GOLF • 2026
                </div>
            </aside>

            {/* Main Workspace */}
            <main className="flex-1 relative bg-black overflow-hidden m-0 p-0">
                {/* Header Overlay - Adjusted for mobile */}
                <header className="absolute top-4 lg:top-8 left-4 lg:left-8 z-40 pointer-events-none">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 lg:gap-3">
                            <h1 className="text-2xl lg:text-4xl font-black tracking-tighter uppercase italic text-white/90">AR Golf</h1>
                            <div className="px-2 py-0.5 bg-green-500 text-black text-[7px] lg:text-[8px] font-black rounded uppercase tracking-widest shadow-xl">Active</div>
                        </div>
                        <p className="text-[8px] lg:text-[10px] font-black text-white/20 uppercase tracking-[0.3em] lg:tracking-[0.5em]">Real-time Spatial Tracker</p>
                    </div>
                </header>

                {/* User Details Modal Card */}
                {showDetails && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
                        <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-white/5 rounded-2xl">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                <button onClick={() => setShowDetails(false)} className="text-white/20 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            
                            <div className="mb-8">
                                <h1 className="text-2xl font-black text-white uppercase italic leading-none mb-1">{data.username || "GOLFER"}</h1>
                                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active Player</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <span className="block text-[8px] uppercase tracking-widest text-white/20 mb-1">Email Address</span>
                                    <span className="text-white font-medium text-xs break-all">{data.email || "No Email linked"}</span>
                                </div>
                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <span className="block text-[8px] uppercase tracking-widest text-white/20 mb-1">Reference ID</span>
                                    <code className="text-green-500 font-mono text-[10px] break-all">{data._id}</code>
                                </div>
                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                                    <span className="text-[8px] uppercase tracking-widest text-white/20">Status</span>
                                    <span className="text-[10px] font-black text-white uppercase italic">Verified • 2026</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setShowDetails(false)}
                                className="w-full mt-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Close Identification
                            </button>
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 w-full h-full">
                    <ARGolf />
                </div>
            </main>
        </div>
    )
}

