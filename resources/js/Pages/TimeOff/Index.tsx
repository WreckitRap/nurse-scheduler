import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CalendarX2, Send } from 'lucide-react';

interface RequestRow {
    id: number;
    start_date: string;
    end_date: string;
    reason: string | null;
    status: string;
    created_at: string;
}

const input = 'w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

const pad = (n: number) => String(n).padStart(2, '0');

const daysCount = (r: RequestRow) =>
    Math.round(
        (new Date(r.end_date.slice(0, 10) + 'T00:00:00').getTime() - new Date(r.start_date.slice(0, 10) + 'T00:00:00').getTime()) / 86400000,
    ) + 1;

export default function Index({ requests }: { requests: RequestRow[] }) {
    const flash = (usePage().props as any).flash;
    const { data, setData, post, processing, errors, reset } = useForm({ start_date: '', end_date: '', reason: '' });

    const minDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    })();

    const submit = (e: any) => {
        e.preventDefault();
        post(route('time-off.store'), { onSuccess: () => reset() });
    };

    const chip = (status: string) =>
        status === 'approved' ? (
            <span className="rounded-full bg-green-100 dark:bg-green-900/40 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">Approved</span>
        ) : status === 'rejected' ? (
            <span className="rounded-full bg-red-100 dark:bg-red-900/40 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300">Rejected</span>
        ) : (
            <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">Pending</span>
        );

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Time Off</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Request leave days — at least 30 days in advance.</p>
                </div>
            }
        >
            <Head title="Time Off" />

            {flash?.success && <div className="mb-4 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm font-medium text-green-700 dark:text-green-300">{flash.success}</div>}
            {flash?.error && <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">{flash.error}</div>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Request form */}
                <div className="h-fit rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">Request Time Off</div>
                    <form onSubmit={submit} className="space-y-4 p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
                                <input type="date" min={minDate} className={input} value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} required />
                                {errors.start_date && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.start_date}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
                                <input type="date" min={data.start_date || minDate} className={input} value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} required />
                                {errors.end_date && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.end_date}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Reason (optional)</label>
                            <textarea rows={3} className={input} value={data.reason} onChange={(e) => setData('reason', e.target.value)} placeholder="e.g. Family event" />
                        </div>
                        <p className="rounded-xl bg-indigo-50 dark:bg-indigo-900/40 px-3 py-2 text-xs text-indigo-700 dark:text-indigo-300">
                            Requests must be submitted <strong>at least 30 days</strong> before the start date. Earliest start: <strong>{minDate}</strong>.
                        </p>
                        <button type="submit" disabled={processing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                            <Send className="h-4 w-4" /> Submit Request
                        </button>
                    </form>
                </div>

                {/* My requests */}
                <div className="xl:col-span-2">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                        {/* Desktop table */}
                        <div className="hidden md:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <th className="px-5 py-3.5">Dates</th>
                                        <th className="px-5 py-3.5">Reason</th>
                                        <th className="px-5 py-3.5">Submitted</th>
                                        <th className="px-5 py-3.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {requests.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/50">
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {new Date(r.start_date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    {' → '}
                                                    {new Date(r.end_date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{daysCount(r)} day(s)</div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{r.reason ?? '—'}</td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{r.created_at.slice(0, 10)}</td>
                                            <td className="px-5 py-4">{chip(r.status)}</td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr>
                                            <td colSpan={4}>
                                                <div className="flex flex-col items-center justify-center py-14 text-center">
                                                    <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 p-4"><CalendarX2 className="h-6 w-6 text-indigo-600 dark:text-indigo-300" /></div>
                                                    <div className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">No requests yet</div>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Submit your first time-off request on the left.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="space-y-3 p-4 md:hidden">
                            {requests.map((r) => (
                                <div key={r.id} className="rounded-xl border border-gray-200 dark:border-gray-600 p-4">
                                    {/* Header: Date range + Status */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {new Date(r.start_date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                {' → '}
                                                {new Date(r.end_date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{daysCount(r)} day(s)</div>
                                        </div>
                                        {chip(r.status)}
                                    </div>

                                    {/* Body: Reason + Submitted */}
                                    <div className="mt-3 space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 text-sm">
                                        <div className="flex justify-between gap-2">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Reason</span>
                                            <span className="text-right text-gray-700 dark:text-gray-200">{r.reason ?? '—'}</span>
                                        </div>
                                        <div className="flex justify-between gap-2 border-t border-gray-200 dark:border-gray-600 pt-2">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Submitted</span>
                                            <span className="text-gray-700 dark:text-gray-200">{new Date(r.created_at.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {requests.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-14 text-center">
                                    <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 p-4"><CalendarX2 className="h-6 w-6 text-indigo-600 dark:text-indigo-300" /></div>
                                    <div className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">No requests yet</div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Submit your first time-off request above.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}