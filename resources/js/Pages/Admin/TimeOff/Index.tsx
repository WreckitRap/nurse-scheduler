import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, Inbox, X } from 'lucide-react';
import { useState } from 'react';

interface RequestRow {
    id: number;
    start_date: string;
    end_date: string;
    reason: string | null;
    status: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        nurse_profile: { unit: { name: string } | null } | null;
    };
}

const daysCount = (r: RequestRow) =>
    Math.round(
        (new Date(r.end_date.slice(0, 10) + 'T00:00:00').getTime() - new Date(r.start_date.slice(0, 10) + 'T00:00:00').getTime()) / 86400000,
    ) + 1;

const chip = (status: string) =>
    status === 'approved' ? (
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Approved</span>
    ) : status === 'rejected' ? (
        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Rejected</span>
    ) : (
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">Pending</span>
    );

export default function Index({ requests }: { requests: RequestRow[] }) {
    const flash = (usePage().props as any).flash;
    const [filter, setFilter] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');

    const filtered = requests
        .filter((r) => filter === 'all' || r.status === filter)
        .sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1));

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Time Off Requests</h1>
                    <p className="text-sm text-gray-500">Review and approve your team's leave requests.</p>
                </div>
            }
        >
            <Head title="Time Off Requests" />

            {flash?.success && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{flash.success}</div>}
            {flash?.error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{flash.error}</div>}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Filter tabs */}
                <div className="flex gap-2 border-b border-gray-100 p-4">
                    {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={
                                'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ' +
                                (filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                            }
                        >
                            {f}
                            {f === 'pending' && requests.some((r) => r.status === 'pending') && (
                                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px]">
                                    {requests.filter((r) => r.status === 'pending').length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-left text-sm font-medium text-gray-700">
                            <th className="px-5 py-3.5">Nurse</th>
                            <th className="px-5 py-3.5">Dates</th>
                            <th className="px-5 py-3.5">Reason</th>
                            <th className="px-5 py-3.5">Status</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50/60">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                            {r.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{r.user.name}</div>
                                            <div className="text-xs text-gray-500">{r.user.nurse_profile?.unit?.name ?? '—'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="font-medium text-gray-900">
                                        {new Date(r.start_date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        {' → '}
                                        {new Date(r.end_date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="text-xs text-gray-500">{daysCount(r)} day(s)</div>
                                </td>
                                <td className="max-w-xs truncate px-5 py-4 text-gray-600">{r.reason ?? '—'}</td>
                                <td className="px-5 py-4">{chip(r.status)}</td>
                                <td className="px-5 py-4">
                                    {r.status === 'pending' ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => router.patch(route('admin.time-off.approve', r.id), {}, { preserveScroll: true })}
                                                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                                            >
                                                <Check className="h-3.5 w-3.5" /> Approve
                                            </button>
                                            <button
                                                onClick={() => router.patch(route('admin.time-off.reject', r.id), {}, { preserveScroll: true })}
                                                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                            >
                                                <X className="h-3.5 w-3.5" /> Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-right text-xs text-gray-400">Decided</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5}>
                                    <div className="flex flex-col items-center justify-center py-14 text-center">
                                        <div className="rounded-2xl bg-indigo-50 p-4"><Inbox className="h-6 w-6 text-indigo-600" /></div>
                                        <div className="mt-3 text-sm font-semibold text-gray-900">No {filter} requests</div>
                                        <p className="mt-1 text-xs text-gray-500">Requests from your team will appear here.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}