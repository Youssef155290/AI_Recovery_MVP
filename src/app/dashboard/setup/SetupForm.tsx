'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { simulateFailedPayment } from '@/lib/actions';

type CustomerRow = {
    id: string;
    email: string;
    name: string;
    company: string;
    revenue: string;
    plan: string;
    country: string;
    reason: string;
};

const EMPTY_CUSTOMER = (): CustomerRow => ({
    id: Math.random().toString(36).substr(2, 9),
    email: '', name: '', company: '',
    revenue: '$1k - $5k', plan: 'Basic', country: 'US', reason: 'insufficient_funds'
});

const REVENUE_MAP: Record<string, number> = {
    '$1k - $5k': 2900,
    '$5k - $20k': 9900,
    '$20k - $100k': 49900,
    '$100k+': 99900,
};

const FAILURE_REASONS = [
    { value: 'insufficient_funds', label: 'Insufficient Funds', icon: '💳' },
    { value: 'expired_card', label: 'Expired Card', icon: '📅' },
    { value: 'bank_declined', label: 'Bank Declined', icon: '🏦' },
    { value: 'fraudulent', label: 'Suspected Fraud', icon: '🚨' },
    { value: 'processing_error', label: 'Processing Error', icon: '⚙️' },
];

const COUNTRIES = [
    { code: 'US', flag: '🇺🇸', name: 'United States' },
    { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
    { code: 'DE', flag: '🇩🇪', name: 'Germany' },
    { code: 'FR', flag: '🇫🇷', name: 'France' },
    { code: 'CA', flag: '🇨🇦', name: 'Canada' },
    { code: 'AU', flag: '🇦🇺', name: 'Australia' },
    { code: 'JP', flag: '🇯🇵', name: 'Japan' },
    { code: 'IN', flag: '🇮🇳', name: 'India' },
    { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
    { code: 'ZA', flag: '🇿🇦', name: 'South Africa' },
    { code: 'AE', flag: '🇦🇪', name: 'UAE' },
    { code: 'SG', flag: '🇸🇬', name: 'Singapore' },
    { code: 'IT', flag: '🇮🇹', name: 'Italy' },
    { code: 'ES', flag: '🇪🇸', name: 'Spain' },
    { code: 'NL', flag: '🇳🇱', name: 'Netherlands' },
    { code: 'CH', flag: '🇨🇭', name: 'Switzerland' },
    { code: 'SE', flag: '🇸🇪', name: 'Sweden' },
    { code: 'MX', flag: '🇲🇽', name: 'Mexico' },
    { code: 'KR', flag: '🇰🇷', name: 'South Korea' },
    { code: 'NG', flag: '🇳🇬', name: 'Nigeria' },
    { code: 'PL', flag: '🇵🇱', name: 'Poland' },
    { code: 'AR', flag: '🇦🇷', name: 'Argentina' },
];

const PLAN_COLORS: Record<string, string> = {
    'Basic': 'bg-slate-100 text-slate-600 border-slate-200',
    'Pro': 'bg-blue-50 text-blue-600 border-blue-200',
    'Enterprise': 'bg-violet-50 text-violet-600 border-violet-200',
};

const inputClass = "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 hover:border-slate-300";
const selectClass = "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none cursor-pointer hover:border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";
const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1.5";

export default function SetupForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [customers, setCustomers] = useState<CustomerRow[]>([EMPTY_CUSTOMER()]);

    const addRow = () => setCustomers([...customers, EMPTY_CUSTOMER()]);

    const updateRow = (id: string, field: keyof CustomerRow, value: string) => {
        setCustomers(customers.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const removeRow = (id: string) => {
        if (customers.length > 1) {
            setCustomers(customers.filter(c => c.id !== id));
        }
    };

    const validCustomers = customers.filter(c => c.email && c.name);

    const handleSubmit = async () => {
        if (validCustomers.length === 0) return;
        setIsLoading(true);
        setProgress(0);

        try {
            for (let i = 0; i < validCustomers.length; i++) {
                const customer = validCustomers[i];
                await simulateFailedPayment({
                    name: customer.name,
                    email: customer.email,
                    company: customer.company,
                    amount: REVENUE_MAP[customer.revenue] || 2900,
                    plan: customer.plan,
                    country: customer.country,
                    reason: customer.reason,
                });
                setProgress(Math.round(((i + 1) / validCustomers.length) * 100));
            }
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Failed to initialize customers. Check terminal logs.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-5 max-w-5xl mx-auto">
            {/* Customer Cards */}
            <div className="space-y-4">
                {customers.map((c, idx) => (
                    <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 p-6 group animate-scale-in">
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-indigo-200/50">{idx + 1}</span>
                                <div>
                                    <span className="text-sm font-bold text-slate-800">Customer Profile</span>
                                    <span className="text-[10px] text-slate-400 ml-2">
                                        {c.name && c.email ? '✓ Complete' : '• Fill required fields'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {c.plan && (
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${PLAN_COLORS[c.plan] || PLAN_COLORS.Basic}`}>
                                        {c.plan}
                                    </span>
                                )}
                                {customers.length > 1 && (
                                    <button onClick={() => removeRow(c.id)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all p-1.5 rounded-lg">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Name / Email / Company Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Full Name <span className="text-rose-400">*</span></label>
                                <input placeholder="e.g. Sarah Chen" className={inputClass} value={c.name} onChange={(e) => updateRow(c.id, 'name', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Email Address <span className="text-rose-400">*</span></label>
                                <input placeholder="e.g. sarah@cloudscale.com" type="email" className={inputClass} value={c.email} onChange={(e) => updateRow(c.id, 'email', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Company / SaaS Name</label>
                                <input placeholder="e.g. CloudScale" className={inputClass} value={c.company} onChange={(e) => updateRow(c.id, 'company', e.target.value)} />
                            </div>
                        </div>

                        {/* Selectors Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                                <label className={labelClass}>Revenue Range</label>
                                <select className={selectClass} value={c.revenue} onChange={(e) => updateRow(c.id, 'revenue', e.target.value)}>
                                    {Object.keys(REVENUE_MAP).map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Plan Level</label>
                                <select className={selectClass} value={c.plan} onChange={(e) => updateRow(c.id, 'plan', e.target.value)}>
                                    <option>Basic</option>
                                    <option>Pro</option>
                                    <option>Enterprise</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Region</label>
                                <select className={selectClass} value={c.country} onChange={(e) => updateRow(c.id, 'country', e.target.value)}>
                                    {COUNTRIES.map(co => <option key={co.code} value={co.code}>{co.flag} {co.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Failure Reason</label>
                                <select className={selectClass} value={c.reason} onChange={(e) => updateRow(c.id, 'reason', e.target.value)}>
                                    {FAILURE_REASONS.map(r => <option key={r.value} value={r.value}>{r.icon} {r.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Customer Button */}
            <button
                onClick={addRow}
                className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/40 flex items-center justify-center gap-2.5 transition-all duration-300 group"
            >
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </div>
                Add Another Customer to Scope
            </button>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
                <div className="text-sm text-slate-500 font-medium flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${validCustomers.length > 0
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}>{validCustomers.length}</span>
                    <span>{validCustomers.length === 1 ? 'Customer' : 'Customers'} ready for simulation</span>
                </div>
                <button
                    disabled={validCustomers.length === 0 || isLoading}
                    onClick={handleSubmit}
                    className={`px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 flex items-center gap-3 ${validCustomers.length === 0 || isLoading
                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                            : 'bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-200/60 active:scale-[0.98] shadow-indigo-200/40'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            Processing {progress}%
                        </>
                    ) : (
                        <>
                            Proceed to Dashboard
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                        </>
                    )}
                </button>
            </div>

            {/* Progress Bar */}
            {isLoading && (
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-500 h-full rounded-full transition-all duration-700 ease-out relative" style={{ width: `${progress}%` }}>
                        <div className="absolute inset-0 shimmer-bg"></div>
                    </div>
                </div>
            )}
        </div>
    );
}
