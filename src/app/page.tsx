import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-600/[0.07] rounded-full blur-[140px] animate-glow"></div>
            <div className="absolute top-2/3 right-1/4 w-[500px] h-[500px] bg-violet-600/[0.06] rounded-full blur-[120px] animate-glow" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/[0.04] rounded-full blur-[100px] animate-float"></div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

            <div className="relative z-10 max-w-3xl w-full px-6 text-center">
                {/* Badge */}
                <div className="animate-fade-in inline-flex items-center gap-2.5 px-5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs font-semibold text-indigo-300 tracking-[0.2em] uppercase backdrop-blur-md mb-10">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    AI-Powered Revenue Recovery
                </div>

                {/* Hero Title */}
                <h1 className="animate-slide-up text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
                    Recover Lost
                    <br />
                    <span className="gradient-text">Revenue</span> Before
                    <br />
                    It&apos;s Gone
                </h1>

                <p className="animate-slide-up text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed mb-10" style={{ animationDelay: '0.1s' }}>
                    Simulate failed subscription payments, generate AI-personalized recovery emails, and measure your recovery rate — all in one command center.
                </p>

                {/* CTA Buttons */}
                <div className="animate-slide-up flex flex-col sm:flex-row gap-4 justify-center mb-16" style={{ animationDelay: '0.2s' }}>
                    <Link
                        href="/dashboard/setup"
                        className="group relative px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/20 hover:-translate-y-1 hover:shadow-indigo-500/30 active:scale-[0.98]"
                    >
                        <span>Start Recovery Simulation</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/[0.05] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-8 py-4 glass-dark text-white/90 border border-white/[0.08] rounded-2xl font-bold text-lg hover:bg-white/[0.08] hover:border-white/[0.15] transition-all text-center hover:-translate-y-0.5"
                    >
                        View Dashboard
                    </Link>
                </div>

                {/* Step Indicator */}
                <div className="animate-fade-in flex items-center justify-center gap-0 mb-12" style={{ animationDelay: '0.3s' }}>
                    {[
                        { num: '1', label: 'Define Scope', active: true },
                        { num: '2', label: 'Monitor & Recover', active: false },
                        { num: '3', label: 'Test in Sandbox', active: false },
                    ].map((step, i) => (
                        <div key={i} className="flex items-center">
                            {i > 0 && <div className="w-12 h-px bg-gradient-to-r from-slate-700 to-slate-800 mx-2"></div>}
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${step.active
                                        ? 'bg-indigo-500/80 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-white/[0.06] text-slate-500 border border-white/[0.08]'
                                    }`}>{step.num}</div>
                                <span className={`text-xs font-medium ${step.active ? 'text-slate-300' : 'text-slate-600'}`}>{step.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Floating Stats */}
                <div className="animate-slide-up grid grid-cols-3 gap-4 max-w-lg mx-auto" style={{ animationDelay: '0.4s' }}>
                    {[
                        { value: '+14%', label: 'Higher Recovery', color: 'text-white' },
                        { value: 'AI', label: 'Personalized', color: 'text-emerald-400' },
                        { value: 'Real', label: 'Email Delivery', color: 'text-white' },
                    ].map((stat, i) => (
                        <div key={i} className="card-hover bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm text-center group">
                            <div className={`text-2xl font-black ${stat.color} group-hover:scale-110 transition-transform duration-300`}>{stat.value}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-[0.15em] mt-1.5 font-semibold">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-6 text-center text-xs text-slate-700 tracking-wider">
                Powered by <span className="text-slate-500">OpenRouter AI</span> • <span className="text-slate-500">Supabase</span> • <span className="text-slate-500">Resend</span>
            </footer>
        </main>
    );
}
