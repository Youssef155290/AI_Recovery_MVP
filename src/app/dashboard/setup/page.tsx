import SetupForm from './SetupForm';
import Link from 'next/link';

export default function SetupPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/[0.04] rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-violet-400/[0.03] rounded-full blur-[80px]"></div>

            <div className="max-w-6xl mx-auto px-4 py-12 relative">
                {/* Top Nav */}
                <nav className="flex items-center justify-between mb-12">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium group">
                        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Home
                    </Link>
                    <Link href="/dashboard" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                        Skip to Dashboard →
                    </Link>
                </nav>

                {/* Step Navigation */}
                <div className="flex items-center justify-center gap-0 mb-14">
                    {[
                        { num: '1', label: 'Define Scope', active: true },
                        { num: '2', label: 'Monitor & Recover', active: false },
                        { num: '3', label: 'Sandbox Testing', active: false },
                    ].map((step, i) => (
                        <div key={i} className="flex items-center">
                            {i > 0 && (
                                <div className={`w-16 h-0.5 mx-3 ${i === 1 ? 'bg-gradient-to-r from-indigo-200 to-slate-200' : 'bg-slate-200'}`}></div>
                            )}
                            <div className="flex items-center gap-2.5">
                                <div className={`w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${step.active
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/60'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                    }`}>{step.num}</div>
                                <span className={`text-sm font-semibold ${step.active ? 'text-indigo-700' : 'text-slate-400'}`}>{step.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Header */}
                <header className="text-center mb-12 space-y-5 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold tracking-wide uppercase border border-indigo-100">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                        Step 1 of 3
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Define Your Recovery Scope
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Add the customers you want to simulate failed payments for. Each entry will appear on your Recovery Dashboard with live metrics.
                    </p>
                </header>

                {/* Hint Card */}
                <div className="max-w-3xl mx-auto mb-10 bg-white border border-indigo-100 rounded-2xl p-5 flex gap-4 shadow-sm card-hover animate-slide-up">
                    <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center text-lg">💡</div>
                    <div className="text-sm space-y-1.5">
                        <p className="font-bold text-slate-800">How this works</p>
                        <p className="text-slate-500 leading-relaxed">Each customer you add will be registered with a <strong className="text-slate-700">simulated failed payment</strong>. When you proceed, the AI generates personalized recovery emails for each one. Test different tones and view results on the dashboard.</p>
                    </div>
                </div>

                <main className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <SetupForm />
                </main>

                <footer className="mt-20 border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs tracking-wide">
                    <p>© 2026 RecoverAI • Powered by OpenRouter</p>
                    <div className="flex gap-6">
                        <Link href="/" className="hover:text-slate-600 transition-colors">← Home</Link>
                        <Link href="/dashboard" className="hover:text-slate-600 transition-colors">Dashboard →</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
