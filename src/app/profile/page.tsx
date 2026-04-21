"use client";
import axios from "axios";
import Link from "next/link";
import React, {useState} from "react";
import {toast} from "react-hot-toast";
import {useRouter} from "next/navigation";
import ARGolf from "@/components/ARGolf";

export default function ProfilePage() {
    const router = useRouter()
    const [data, setData] = useState("nothing")

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
        setData(res.data.data._id)
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#050505] text-white selection:bg-white/20">
            {/* Slim Premium Sidebar */}
            <aside className="w-16 lg:w-20 border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl flex flex-col items-center py-8 z-50">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-lg font-bold mb-10 border border-white/10 shadow-2xl">
                    {data !== 'nothing' ? data.substring(0, 1).toUpperCase() : "U"}
                </div>

                <nav className="flex-1 flex flex-col gap-6">
                    <button 
                        onClick={getUserDetails}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group relative"
                        title="Account ID"
                    >
                        <svg className="w-5 h-5 text-white/40 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-[9px] font-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity tracking-widest uppercase">ID</span>
                    </button>

                    <button 
                        onClick={logout}
                        className="p-3 rounded-xl hover:bg-white/10 transition-all group relative"
                        title="Logout"
                    >
                        <svg className="w-5 h-5 text-white/20 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        <span className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-[9px] font-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity tracking-widest uppercase">Exit</span>
                    </button>
                </nav>

                <div className="rotate-180 [writing-mode:vertical-lr] text-[6px] font-black uppercase tracking-[1em] text-white/5 mt-auto">
                    AR GOLF • 2026
                </div>
            </aside>

            {/* Main Workspace - Zero Padding/Margin for Full Screen AR */}
            <main className="flex-1 relative bg-black overflow-hidden m-0 p-0">
                {/* Header Overlay */}
                <header className="absolute top-8 left-8 z-40 pointer-events-none">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white/90">AR Golf</h1>
                            <div className="px-2 py-0.5 bg-white text-black text-[8px] font-black rounded uppercase tracking-widest shadow-xl">Secure</div>
                        </div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Real-time Spatial Tracker</p>
                    </div>
                </header>

                <div className="absolute inset-0 w-full h-full">
                    <ARGolf />
                </div>
            </main>
        </div>
    )
}

