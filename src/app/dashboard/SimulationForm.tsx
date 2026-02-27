'use client';

import { useState } from 'react';
import { simulateFailedPayment } from '@/lib/actions';

const TONES = [
    { id: 'friendly', label: 'Friendly', emoji: '😊', desc: 'Warm, empathetic, casual' },
    { id: 'formal', label: 'Formal', emoji: '🏢', desc: 'Professional, corporate' },
    { id: 'urgent', label: 'Urgent', emoji: '⚡', desc: 'Time-sensitive, direct' },
];

const FAILURE_REASONS = [
    { value: 'insufficient_funds', label: 'Insufficient Funds' },
    { value: 'expired_card', label: 'Expired Card' },
    { value: 'bank_declined', label: 'Bank Declined' },
    { value: 'fraudulent', label: 'Suspected Fraud' },
    { value: 'processing_error', label: 'Processing Error' },
];

export default function SimulationForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<null | 'success' | 'error'>(null);
    const [selectedTone, setSelectedTone] = useState('friendly');
    const [emailPreview, setEmailPreview] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);
        setEmailPreview(null);

        const formData = new FormData(e.currentTarget);
        const result = await simulateFailedPayment({
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            amount: parseInt(formData.get('amount') as string) * 100,
            reason: formData.get('reason') as string || 'insufficient_funds',
            company: formData.get('company') as string,
            country: formData.get('country') as string,
            plan: formData.get('plan') as string,
            tone: selectedTone,
        });

        setIsLoading(false);
        if (result.success) {
            setStatus('success');
            if (result.emailPreview) {
                setEmailPreview(result.emailPreview);
            }
        } else {
            setStatus('error');
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-5 relative overflow-hidden">
                <div className="flex items-center gap-3 relative z-10">
                    <span className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-lg backdrop-blur-md border border-white/10 shadow-inner">🧪</span>
                    <div>
                        <h2 className="text-white font-black text-sm tracking-tight uppercase">Recovery Sandbox</h2>
                        <p className="text-indigo-100/80 text-[10px] font-medium leading-tight">Test AI-driven recovery workflows instantly</p>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl font-black"></div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Core Fields */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Name</label>
                        <input name="name" type="text" required placeholder="John Doe" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all" />
                    </div>
                    <div className="group">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1.5 px-0.5 transition-colors group-focus-within:text-indigo-500">Target Email</label>
                        <input name="email" type="email" required placeholder="john@acme.com" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300" />
                        <p className="text-[9px] text-slate-400 mt-2 px-0.5 leading-relaxed italic">
                            <span className="text-amber-500 font-bold">Resend Limit:</span> Test emails can only be sent to your verified address.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount ($)</label>
                        <input name="amount" type="number" required defaultValue="29" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Failure Reason</label>
                        <select name="reason" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer">
                            {FAILURE_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Advanced Toggle */}
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1">
                    <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>

                {showAdvanced && (
                    <div className="space-y-3 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company</label>
                                <input name="company" type="text" placeholder="Acme Inc" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plan</label>
                                <select name="plan" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer">
                                    <option>Basic</option>
                                    <option>Pro</option>
                                    <option>Enterprise</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Country</label>
                            <select name="country" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer">
                                <option value="US">🇺🇸 United States</option>
                                <option value="GB">🇬🇧 United Kingdom</option>
                                <option value="DE">🇩🇪 Germany</option>
                                <option value="FR">🇫🇷 France</option>
                                <option value="CA">🇨🇦 Canada</option>
                                <option value="JP">🇯🇵 Japan</option>
                                <option value="IN">🇮🇳 India</option>
                                <option value="BR">🇧🇷 Brazil</option>
                                <option value="SG">🇸🇬 Singapore</option>
                                <option value="AU">🇦🇺 Australia</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* AI Tone Selector */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">AI Email Tone</label>
                    <div className="grid grid-cols-3 gap-2">
                        {TONES.map(tone => (
                            <button
                                key={tone.id}
                                type="button"
                                onClick={() => setSelectedTone(tone.id)}
                                className={`p-2.5 rounded-xl border text-center transition-all ${selectedTone === tone.id
                                    ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-500/20'
                                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                <div className="text-lg">{tone.emoji}</div>
                                <div className="text-[10px] font-bold text-slate-700">{tone.label}</div>
                                <div className="text-[9px] text-slate-400">{tone.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    disabled={isLoading}
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-indigo-200'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            Generating AI Email...
                        </>
                    ) : '🔥 Trigger AI Recovery Flow'}
                </button>

                {/* Result Feedback */}
                {status === 'success' && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm space-y-2 animate-scale-in">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✨</div>
                            <span>Generation Successful!</span>
                        </div>
                        <p className="text-emerald-600/80 text-[11px] font-medium leading-relaxed pl-8">The AI-personalized recovery email has been drafted and dispatched. Refresh the table to view the trace.</p>
                    </div>
                )}
                {status === 'error' && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm space-y-2 animate-scale-in">
                        <div className="flex items-center gap-2 text-rose-700 font-bold">
                            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">⚠️</div>
                            <span>Simulation Failed</span>
                        </div>
                        <p className="text-rose-600/80 text-[11px] font-medium leading-relaxed pl-8">Check terminal logs. Ensure your OpenAI and Resend API keys are correctly configured in .env.local.</p>
                    </div>
                )}

                {/* Email Preview */}
                {emailPreview && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            <span className="text-xs font-bold text-slate-500">Generated Email Preview</span>
                        </div>
                        <div className="p-4 text-sm text-slate-700 leading-relaxed max-h-48 overflow-y-auto" dangerouslySetInnerHTML={{ __html: emailPreview }} />
                    </div>
                )}
            </form>
        </div>
    );
}
