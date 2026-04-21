"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";




export default function SignupPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
        username: "",
    })
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const onSignup = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", user);
            console.log("Signup success", response.data);
            router.push("/login");
            
        } catch (error:any) {
            console.log("Signup failed", error.message);
            
            toast.error(error.message);
        }finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(user.email.length > 0 && user.password.length > 0 && user.username.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);


    return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 px-4 text-white">
        <div className="flex flex-col border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-10 w-full max-w-md shadow-2xl transition-all">
            <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {loading ? "Creating Account..." : "Create your account"}
            </h1>
            
            <div className="flex flex-col gap-5">
                <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-semibold" htmlFor="username">Username</label>
                    <input 
                        className="p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 transition-all outline-none"
                        id="username"
                        type="text"
                        value={user.username}
                        onChange={(e) => setUser({...user, username: e.target.value})}
                        placeholder="john_doe"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-semibold" htmlFor="email">Email</label>
                    <input 
                        className="p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 transition-all outline-none"
                        id="email"
                        type="text"
                        value={user.email}
                        onChange={(e) => setUser({...user, email: e.target.value})}
                        placeholder="you@example.com"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-semibold" htmlFor="password">Password</label>
                    <input 
                        className="p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 transition-all outline-none"
                        id="password"
                        type="password"
                        value={user.password}
                        onChange={(e) => setUser({...user, password: e.target.value})}
                        placeholder="••••••"
                    />
                </div>
            </div>

            <button
                onClick={onSignup}
                disabled={buttonDisabled || loading}
                className={`mt-10 p-3 rounded-lg font-bold transition-all duration-300 ${buttonDisabled || loading ? "bg-white/5 text-gray-600 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/40 shadow-inner"}`}
            >
                {loading ? "Processing..." : buttonDisabled ? "Complete all fields" : "Sign Up"}
            </button>
            <div className="mt-8 text-center text-sm text-gray-400 font-medium">
                Already have an account? <Link href="/login" className="text-white hover:underline transition-all ml-1">Login</Link>
            </div>
        </div>
    </div>
    )
}