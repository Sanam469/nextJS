import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-white text-center">
      <div className="flex flex-col items-center max-w-2xl border border-white/10 bg-white/5 backdrop-blur-2xl rounded-[3rem] p-16 shadow-2xl relative overflow-hidden">
        {/* Soft Background Glows */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            Secure Platform
          </h1>
          <p className="text-gray-400 text-lg mb-12 font-medium tracking-wide">
            Enterprise-grade authentication with Next.js & MongoDB
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link 
              href="/login" 
              className="flex-1 bg-white text-black px-8 py-4 rounded-2xl font-bold text-center hover:bg-gray-200 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="flex-1 border border-white/20 bg-white/5 px-8 py-4 rounded-2xl font-bold text-center hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-gray-600 text-[10px] uppercase tracking-[0.4em] font-bold">
        Protected by Advanced Encryption • 2026
      </footer>
    </main>
  )
}
