'use client';

import { useState } from 'react';
import { triggerManualRecovery } from '@/lib/actions';

export default function ActionButton({ paymentId }: { paymentId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleAction = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);
        const result = await triggerManualRecovery(paymentId);
        setIsLoading(false);
        if (result.success) {
            setSent(true);
            setTimeout(() => setSent(false), 4000);
        }
    };

    return (
        <button
            onClick={handleAction}
            disabled={isLoading || sent}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white rounded-xl transition-all duration-300 ${sent
                    ? 'bg-emerald-500 shadow-md shadow-emerald-200'
                    : isLoading
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 shadow-md shadow-indigo-200 hover:bg-indigo-500 hover:-translate-y-0.5 hover:shadow-lg active:scale-95'
                }`}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    <span>Processing</span>
                </>
            ) : sent ? (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Sent!</span>
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>Retrigger AI</span>
                </>
            )}
        </button>
    );
}
