import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'RecoverAI — Subscription Revenue Recovery',
    description: 'AI-powered failed payment detection and automated recovery for SaaS subscriptions. Recover lost revenue before it\'s gone.',
    keywords: 'billing recovery, subscription, SaaS, AI, payment recovery, revenue leakage',
    openGraph: {
        title: 'RecoverAI — Subscription Revenue Recovery',
        description: 'AI-powered failed payment detection and automated recovery for SaaS subscriptions.',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className="font-sans antialiased">{children}</body>
        </html>
    );
}
