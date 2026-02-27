import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import SimulationForm from './SimulationForm';
import ActionButton from './ActionButton';
import DashboardFilters from './DashboardFilters';

export const dynamic = 'force-dynamic';

const COUNTRY_MAP: Record<string, { flag: string; name: string }> = {
    US: { flag: '🇺🇸', name: 'United States' }, GB: { flag: '🇬🇧', name: 'UK' },
    DE: { flag: '🇩🇪', name: 'Germany' }, FR: { flag: '🇫🇷', name: 'France' },
    CA: { flag: '🇨🇦', name: 'Canada' }, AU: { flag: '🇦🇺', name: 'Australia' },
    JP: { flag: '🇯🇵', name: 'Japan' }, IN: { flag: '🇮🇳', name: 'India' },
    BR: { flag: '🇧🇷', name: 'Brazil' }, ZA: { flag: '🇿🇦', name: 'S. Africa' },
    AE: { flag: '🇦🇪', name: 'UAE' }, SG: { flag: '🇸🇬', name: 'Singapore' },
    IT: { flag: '🇮🇹', name: 'Italy' }, ES: { flag: '🇪🇸', name: 'Spain' },
    NL: { flag: '🇳🇱', name: 'Netherlands' }, CH: { flag: '🇨🇭', name: 'Switzerland' },
    SE: { flag: '🇸🇪', name: 'Sweden' }, MX: { flag: '🇲🇽', name: 'Mexico' },
    KR: { flag: '🇰🇷', name: 'S. Korea' }, NG: { flag: '🇳🇬', name: 'Nigeria' },
    PL: { flag: '🇵🇱', name: 'Poland' }, AR: { flag: '🇦🇷', name: 'Argentina' },
};

const PLAN_BADGE: Record<string, string> = {
    Enterprise: 'bg-violet-100 text-violet-700 border border-violet-200',
    Pro: 'bg-blue-100 text-blue-700 border border-blue-200',
    Basic: 'bg-slate-100 text-slate-500 border border-slate-200',
};

const ERROR_BADGE: Record<string, { bg: string; label: string }> = {
    insufficient_funds: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Low Funds' },
    expired_card: { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Expired Card' },
    bank_declined: { bg: 'bg-red-50 text-red-600 border-red-200', label: 'Bank Decline' },
    fraudulent: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Fraud Flag' },
    processing_error: { bg: 'bg-slate-50 text-slate-600 border-slate-200', label: 'Processing' },
};

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { revenue?: string; plan?: string; country?: string; search?: string; status?: string };
}) {
    const params = await searchParams;
    const { plan, country, search, status: statusFilter } = params;

    let query = supabaseAdmin
        .from('failed_payments')
        .select(`
            id, amount, status, error_code, created_at, 
            customers!inner (id, name, email, company_name, country), 
            invoices (stripe_invoice_id, hosted_invoice_url), 
            recovery_attempts (status, sent_at, ai_generated_email_body),
            subscriptions:customers(subscriptions(plan_level))
        `)
        .order('created_at', { ascending: false });

    if (country && country !== 'Global') query = query.eq('customers.country', country);
    if (search) query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`, { foreignTable: 'customers' });

    const { data: failedPayments } = await query;
    const { data: recoveredRevenue } = await supabaseAdmin.from('recovered_revenue').select('amount_recovered');

    const MOCK_PAYMENTS = [
        { id: 'mock-1', amount: 8900, status: 'unresolved', error_code: 'insufficient_funds', created_at: new Date().toISOString(), customers: { name: 'Alex Rivera', email: 'alex@designflow.io', company_name: 'DesignFlow', country: 'US' }, subscriptions: [{ plan_level: 'Pro' }], recovery_attempts: [{ status: 'sent', sent_at: new Date().toISOString() }], invoices: { hosted_invoice_url: '#' } },
        { id: 'mock-2', amount: 24900, status: 'recovered', error_code: 'expired_card', created_at: new Date(Date.now() - 86400000).toISOString(), customers: { name: 'Sarah Chen', email: 'sarah@cloudscale.com', company_name: 'CloudScale', country: 'SG' }, subscriptions: [{ plan_level: 'Enterprise' }], recovery_attempts: [{ status: 'sent', sent_at: new Date(Date.now() - 86400000).toISOString() }], invoices: { hosted_invoice_url: '#' } },
        { id: 'mock-3', amount: 4900, status: 'unresolved', error_code: 'bank_declined', created_at: new Date(Date.now() - 172800000).toISOString(), customers: { name: 'Marco Rossi', email: 'marco@gelato.it', company_name: 'Gelato OS', country: 'IT' }, subscriptions: [{ plan_level: 'Basic' }], recovery_attempts: [], invoices: { hosted_invoice_url: '#' } },
        { id: 'mock-4', amount: 35000, status: 'unresolved', error_code: 'fraudulent', created_at: new Date(Date.now() - 300000).toISOString(), customers: { name: 'Jordan Smith', email: 'jordan@fintech.co', company_name: 'FinTech Co', country: 'GB' }, subscriptions: [{ plan_level: 'Enterprise' }], recovery_attempts: [{ status: 'sent', sent_at: new Date().toISOString() }], invoices: { hosted_invoice_url: '#' } },
        { id: 'mock-5', amount: 9900, status: 'recovered', error_code: 'expired_card', created_at: new Date(Date.now() - 432000000).toISOString(), customers: { name: 'Priya Sharma', email: 'priya@datawave.in', company_name: 'DataWave', country: 'IN' }, subscriptions: [{ plan_level: 'Pro' }], recovery_attempts: [{ status: 'sent', sent_at: new Date(Date.now() - 400000000).toISOString() }], invoices: { hosted_invoice_url: '#' } },
    ];

    const isDemo = !failedPayments || failedPayments.length === 0;
    let filtered = isDemo ? MOCK_PAYMENTS : (failedPayments as any[]);

    if (plan && plan !== 'All Plans') {
        filtered = filtered.filter((p: any) => {
            const subs = p.customers?.subscriptions || p.subscriptions;
            return Array.isArray(subs) ? subs.some((s: any) => s.plan_level === plan) : subs?.plan_level === plan;
        });
    }
    if (statusFilter && statusFilter !== 'All') {
        filtered = filtered.filter((p: any) => p.status === statusFilter);
    }

    const all = isDemo ? MOCK_PAYMENTS : (failedPayments as any[]);
    const totalLeakage = all.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
    const recoveredAmt = isDemo
        ? MOCK_PAYMENTS.filter(p => p.status === 'recovered').reduce((s, p) => s + p.amount, 0)
        : (recoveredRevenue as any[])?.reduce((s: number, r: any) => s + (Number(r.amount_recovered) || 0), 0) || 0;
    const rate = totalLeakage > 0 ? ((recoveredAmt / totalLeakage) * 100).toFixed(1) : '0.0';
    const unresolvedCount = all.filter((p: any) => p.status === 'unresolved').length;
    const emailsSent = all.filter((p: any) => p.recovery_attempts?.length > 0).length;

    const metrics = [
        { label: 'Total Leakage', value: `$${(totalLeakage / 100).toLocaleString()}`, color: 'text-slate-800', accent: 'border-l-rose-400', icon: '📉' },
        { label: 'Recovered', value: `$${(recoveredAmt / 100).toLocaleString()}`, color: 'text-emerald-600', accent: 'border-l-emerald-500', icon: '💰' },
        { label: 'Recovery Rate', value: `${rate}%`, color: 'text-blue-600', accent: 'border-l-blue-500', icon: '📊' },
        { label: 'Unresolved', value: `${unresolvedCount}`, color: 'text-rose-500', accent: 'border-l-amber-400', icon: '⚠️' },
        { label: 'AI Emails Sent', value: `${emailsSent}`, color: 'text-violet-600', accent: 'border-l-violet-400', icon: '🤖' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 font-sans">
            <div className="max-w-[1440px] mx-auto p-4 md:p-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
                    <div>
                        {/* Step breadcrumb */}
                        <div className="flex items-center gap-0 mb-3">
                            {[
                                { num: '✓', label: 'Scope', done: true, current: false },
                                { num: '2', label: 'Monitor & Recover', done: false, current: true },
                                { num: '3', label: 'Sandbox', done: false, current: false },
                            ].map((step, i) => (
                                <div key={i} className="flex items-center">
                                    {i > 0 && <div className={`w-8 h-px mx-1.5 ${step.current ? 'bg-indigo-300' : 'bg-slate-200'}`}></div>}
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center ${step.done ? 'bg-emerald-500 text-white' :
                                            step.current ? 'bg-indigo-600 text-white shadow shadow-indigo-200' :
                                                'bg-slate-100 text-slate-400'
                                            }`}>{step.num}</div>
                                        <span className={`text-[10px] font-semibold ${step.done ? 'text-emerald-600' : step.current ? 'text-indigo-700' : 'text-slate-400'
                                            }`}>{step.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">Revenue Recovery Command</h1>
                            {isDemo && (
                                <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg uppercase border border-amber-200 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                                    Demo Data
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm mt-1">AI-powered intervention for failed subscription payments.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/" className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            Home
                        </Link>
                        <Link href="/dashboard/setup" className="px-4 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 hover:shadow-sm transition-all flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Add Customers
                        </Link>
                        <div className={`px-3.5 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 ${isDemo ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                            <span className={`relative flex h-2 w-2 ${isDemo ? '' : ''}`}>
                                {!isDemo && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isDemo ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                            </span>
                            {isDemo ? 'VIRTUAL SIMULATION' : 'LIVE MONITORING'}
                        </div>
                    </div>
                </header>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {metrics.map((m, i) => (
                        <div key={i} className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover border-l-4 ${m.accent} animate-slide-up`} style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{m.label}</p>
                                <span className="text-sm">{m.icon}</span>
                            </div>
                            <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="xl:col-span-3 space-y-6">
                        <DashboardFilters />

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-sm font-bold text-slate-800">Failed Payment Records</h2>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">{filtered.length}</span>
                                </div>
                                <div className="text-xs text-slate-400 font-medium">
                                    Sorted by most recent
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100">
                                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Customer</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Company & Region</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Plan & Amount</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Failure</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Status</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filtered.length > 0 ? filtered.map((p: any, idx: number) => {
                                            const planLabel = p.subscriptions?.[0]?.plan_level || p.customers?.subscriptions?.[0]?.plan_level || 'Basic';
                                            const cc = p.customers?.country || '';
                                            const cInfo = COUNTRY_MAP[cc] || { flag: '🌍', name: cc };
                                            const hasRecovery = p.recovery_attempts?.length > 0;
                                            const errInfo = ERROR_BADGE[p.error_code] || ERROR_BADGE.processing_error;
                                            return (
                                                <tr
                                                    key={p.id}
                                                    className="group hover:bg-indigo-50/40 transition-all duration-300 animate-slide-up"
                                                    style={{ animationDelay: `${0.1 + (idx * 0.04)}s`, animationFillMode: 'both' }}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 border border-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                                                {(p.customers?.name || '?')[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{p.customers?.name || 'Unknown'}</div>
                                                                <div className="text-slate-400 text-[11px] font-mono tracking-tight">{p.customers?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-slate-700 font-bold">{p.customers?.company_name || '—'}</div>
                                                        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-1">{cInfo.flag} {cInfo.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase mb-2 ${PLAN_BADGE[planLabel] || PLAN_BADGE.Basic}`}>{planLabel}</span>
                                                        <div className="text-sm font-black text-slate-900 tabular-nums">${(p.amount / 100).toFixed(2)}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-sm ${errInfo.bg}`}>{errInfo.label}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${p.status === 'recovered' ? 'bg-emerald-100/80 text-emerald-800' : 'bg-rose-100/80 text-rose-800'
                                                            }`}>
                                                            <span className="relative flex h-2 w-2">
                                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${p.status === 'recovered' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                                                <span className={`relative inline-flex rounded-full h-2 w-2 ${p.status === 'recovered' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                            </span>
                                                            {p.status}
                                                        </span>
                                                        <div className="text-[10px] text-slate-400 font-medium mt-2">
                                                            {hasRecovery ? `AI Intervened ${new Date(p.recovery_attempts[0].sent_at).toLocaleDateString()}` : 'Queueing intervention...'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {isDemo ? (
                                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">Mock</span>
                                                        ) : (
                                                            <div className="opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                                <ActionButton paymentId={p.id} />
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-24 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">📋</div>
                                                        <div>
                                                            <p className="text-slate-500 text-sm font-semibold mb-1">No records match your filters</p>
                                                            <p className="text-slate-400 text-xs">Try changing your filter criteria or add new customers.</p>
                                                        </div>
                                                        <Link href="/dashboard/setup" className="px-4 py-2 text-xs text-indigo-600 font-bold bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">+ Add Customers</Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="xl:col-span-1 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <SimulationForm />

                        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-200/30 relative overflow-hidden">
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-sm backdrop-blur-sm">💡</span>
                                    <h3 className="font-bold text-sm">Recovery Pro Tips</h3>
                                </div>
                                <ul className="text-xs text-slate-300/80 space-y-3 leading-relaxed">
                                    <li className="flex gap-2.5">
                                        <span className="text-emerald-400 mt-0.5">●</span>
                                        <span>AI personas achieve <strong className="text-white">14% higher recovery</strong> vs. templates</span>
                                    </li>
                                    <li className="flex gap-2.5">
                                        <span className="text-amber-400 mt-0.5">●</span>
                                        <span>Use <strong className="text-white">Urgent tone</strong> for Enterprise accounts over $200</span>
                                    </li>
                                    <li className="flex gap-2.5">
                                        <span className="text-blue-400 mt-0.5">●</span>
                                        <span><strong className="text-white">Friendly tone</strong> best for first-time failures</span>
                                    </li>
                                    <li className="flex gap-2.5">
                                        <span className="text-violet-400 mt-0.5">●</span>
                                        <span>Expired card has the <strong className="text-white">highest recovery potential</strong></span>
                                    </li>
                                </ul>
                            </div>
                            <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl animate-glow"></div>
                            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-violet-400/10 rounded-full blur-2xl animate-glow" style={{ animationDelay: '1s' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
