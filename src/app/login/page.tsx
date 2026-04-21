"use client";
import Link from "next/link";
import React, {useEffect} from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";





export default function LoginPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
       
    })
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);


    const onLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/login", user);
            console.log("Login success", response.data);
            toast.success("Login success");
            router.push("/profile");
        } catch (error:any) {
            console.log("Login failed", error.message);
            toast.error(error.message);
        } finally{
        setLoading(false);
        }
    }

    useEffect(() => {
        if(user.email.length > 0 && user.password.length > 0) {
            setButtonDisabled(false);
        } else{
            setButtonDisabled(true);
        }
    }, [user]);

    return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 px-4">
        <div className="flex flex-col border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl transition-all">
            <h1 className="text-2xl font-medium text-center text-white mb-8">
                {loading ? "Authenticating..." : "Sign in to your account"}
            </h1>
            
            <div className="flex flex-col gap-6">
                <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-medium" htmlFor="email">Email</label>
                    <input 
                        className="p-3 bg-transparent border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/50 focus:bg-white/5 transition-all outline-none"
                        id="email"
                        type="text"
                        value={user.email}
                        onChange={(e) => setUser({...user, email: e.target.value})}
                        placeholder="you@example.com"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-medium" htmlFor="password">Password</label>
                    <input 
                        className="p-3 bg-transparent border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/50 focus:bg-white/5 transition-all outline-none"
                        id="password"
                        type="password"
                        value={user.password}
                        onChange={(e) => setUser({...user, password: e.target.value})}
                        placeholder="••••••••"
                    />
                </div>
            </div>
            
            <button
                onClick={onLogin}
                disabled={buttonDisabled || loading}
                className={`mt-8 p-3 rounded-lg font-medium transition-all duration-300 ${buttonDisabled || loading ? "bg-white/10 text-gray-500 cursor-not-allowed" : "bg-white/90 text-black hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"} `}
            >
                {loading ? "Signing in..." : "Login"}
            </button>
            <div className="mt-8 text-center text-sm text-gray-400">
                Don't have an account? <Link href="/signup" className="text-white hover:text-gray-200 transition-colors ml-1">Sign up</Link>
            </div>
        </div>
    </div>
    )
}