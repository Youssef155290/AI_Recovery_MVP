'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

const COUNTRIES = [
    { code: 'Global', label: '🌍 All Regions' },
    { code: 'US', label: '🇺🇸 United States' },
    { code: 'GB', label: '🇬🇧 United Kingdom' },
    { code: 'DE', label: '🇩🇪 Germany' },
    { code: 'FR', label: '🇫🇷 France' },
    { code: 'CA', label: '🇨🇦 Canada' },
    { code: 'AU', label: '🇦🇺 Australia' },
    { code: 'JP', label: '🇯🇵 Japan' },
    { code: 'IN', label: '🇮🇳 India' },
    { code: 'BR', label: '🇧🇷 Brazil' },
    { code: 'SG', label: '🇸🇬 Singapore' },
    { code: 'IT', label: '🇮🇹 Italy' },
    { code: 'ES', label: '🇪🇸 Spain' },
    { code: 'NL', label: '🇳🇱 Netherlands' },
    { code: 'CH', label: '🇨🇭 Switzerland' },
    { code: 'AE', label: '🇦🇪 UAE' },
    { code: 'ZA', label: '🇿🇦 South Africa' },
    { code: 'MX', label: '🇲🇽 Mexico' },
    { code: 'KR', label: '🇰🇷 South Korea' },
    { code: 'NG', label: '🇳🇬 Nigeria' },
    { code: 'PL', label: '🇵🇱 Poland' },
    { code: 'AR', label: '🇦🇷 Argentina' },
];

const selectClass = "px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 outline-none cursor-pointer hover:border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

const QUICK_FILTERS = [
    { label: '💎 High Value', plan: 'Enterprise' },
    { label: '📅 Expired Cards', search: 'expired' },
    { label: '✅ Recovered', status: 'recovered' },
    { label: '⚠️ Unresolved', status: 'unresolved' },
];

export default function DashboardFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [plan, setPlan] = useState(searchParams.get('plan') || 'All Plans');
    const [country, setCountry] = useState(searchParams.get('country') || 'Global');
    const [status, setStatus] = useState(searchParams.get('status') || 'All');

    const apply = useCallback((overrides?: Record<string, string>) => {
        const params = new URLSearchParams();
        const s = overrides?.search ?? search;
        const p = overrides?.plan ?? plan;
        const c = overrides?.country ?? country;
        const st = overrides?.status ?? status;

        if (s) params.set('search', s);
        if (p !== 'All Plans') params.set('plan', p);
        if (c !== 'Global') params.set('country', c);
        if (st !== 'All') params.set('status', st);

        router.push(`/dashboard?${params.toString()}`);
    }, [search, plan, country, status, router]);

    useEffect(() => {
        const timer = setTimeout(() => apply(), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const hasFilters = search || plan !== 'All Plans' || country !== 'Global' || status !== 'All';
    const activeCount = [search, plan !== 'All Plans', country !== 'Global', status !== 'All'].filter(Boolean).length;

    const clearAll = () => {
        setSearch(''); setPlan('All Plans'); setCountry('Global'); setStatus('All');
        router.push('/dashboard');
    };

    return (
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:border-slate-300">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px] relative group">
                        <svg className="w-4 h-4 text-slate-300 group-focus-within:text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input
                            type="text"
                            placeholder="Search by email or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-300 hover:border-slate-300"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <select value={status} onChange={(e) => { setStatus(e.target.value); apply({ status: e.target.value }); }} className={selectClass}>
                            <option>All Status</option>
                            <option value="unresolved">⚠️ Unresolved</option>
                            <option value="recovered">✅ Recovered</option>
                        </select>

                        <select value={plan} onChange={(e) => { setPlan(e.target.value); apply({ plan: e.target.value }); }} className={selectClass}>
                            <option>All Plans</option>
                            <option>Basic</option>
                            <option>Pro</option>
                            <option>Enterprise</option>
                        </select>

                        <select value={country} onChange={(e) => { setCountry(e.target.value); apply({ country: e.target.value }); }} className={selectClass}>
                            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                        </select>
                    </div>

                    {hasFilters && (
                        <button onClick={clearAll} className="px-3.5 py-2.5 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1.5 border border-transparent hover:border-rose-200">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] mr-2 flex-shrink-0">Quick Segments:</span>
                {QUICK_FILTERS.map((f, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            if (f.search) setSearch(f.search);
                            if (f.plan) setPlan(f.plan);
                            if (f.status) setStatus(f.status);
                            apply({ search: f.search || '', plan: f.plan || 'All Plans', status: f.status || 'All' });
                        }}
                        className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all whitespace-nowrap active:scale-95 shadow-sm"
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
