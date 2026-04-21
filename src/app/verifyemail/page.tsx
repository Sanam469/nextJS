"use client";

import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";


export default function VerifyEmailPage() {

    const [token, setToken] = useState("");
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);

    const verifyUserEmail = async () => {
        try {
            await axios.post('/api/users/verifyemail', {token})
            setVerified(true);
        } catch (error:any) {
            setError(true);
            console.log(error.response?.data);
        }
    }

    useEffect(() => {
        const urlToken = window.location.search.split("=")[1];
        setToken(urlToken || "");
    }, []);


    useEffect(() => {
        if(token.length > 0) {
            verifyUserEmail();
        }
    }, [token]);

    return(
        <div className="flex flex-col items-center justify-center min-h-screen py-2 px-4 text-white text-center">
            <div className="flex flex-col items-center border border-white/10 bg-white/5 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl max-w-md w-full">
                <h1 className="text-3xl font-bold mb-8">Verify Email</h1>
                
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-8 w-full">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2">Verification Token</p>
                    <h2 className="text-sm font-mono text-white/80 break-all">{token ? token : "No token detected"}</h2>
                </div>

                {verified && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mb-4">
                            <span className="text-green-500 text-xl">✓</span>
                        </div>
                        <h2 className="text-xl font-bold text-green-500 mb-6">Email Verified Successfully</h2>
                        <Link href="/login" className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                            Back to Login
                        </Link>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center mb-4">
                            <span className="text-red-500 text-xl">!</span>
                        </div>
                        <h2 className="text-xl font-bold text-red-500 mb-2">Verification Failed</h2>
                        <p className="text-sm text-gray-400 mb-6 font-medium">The token may be invalid or expired.</p>
                    </div>
                )}

                {!verified && !error && token && (
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-400 font-medium">Processing verification...</p>
                    </div>
                )}
            </div>
        </div>
    )
}