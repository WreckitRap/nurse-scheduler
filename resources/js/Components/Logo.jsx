import { useId } from 'react';

export default function Logo({ className = 'h-9 w-9' }) {
    const gradId = 'nsGrad' + useId().replace(/[^a-zA-Z0-9]/g, '');

    return (
        <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Nurse Scheduler">
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4e7cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
            </defs>

            <rect x="0" y="0" width="64" height="64" rx="14" fill={`url(#${gradId})`} />
            <rect x="14" y="15" width="36" height="34" rx="5" fill="#ffffff" opacity="0.28" />
            <rect x="14" y="15" width="36" height="9" rx="4.5" fill="#ffffff" opacity="0.45" />
            <rect x="21" y="9" width="4.5" height="10" rx="2.25" fill="#ffffff" />
            <rect x="38.5" y="9" width="4.5" height="10" rx="2.25" fill="#ffffff" />
            <path d="M29 24h6v6h6v6h-6v6h-6v-6h-6v-6h6z" fill="#ffffff" />
            <path
                d="M14 47h8l3-5 4 8 3-6h6"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="46" cy="46" r="11" fill="#ffffff" />
            <path
                d="M46 40.5V46l4 3"
                fill="none"
                stroke="#5b21b6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}