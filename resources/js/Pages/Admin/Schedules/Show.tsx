import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';
import { useMemo } from 'react';

interface Shift {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    required_nurses: number;
    color: string;
    unit: { id: number; name: string } | null;
    nurses: { id: number; name: string }[];
}

interface Schedule {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
}

const COLOR_BAR: Record<string, string> = {
    indigo: 'border-l-indigo-500',
    green: 'border-l-green-500',
    amber: 'border-l-amber-500',
    rose: 'border-l-rose-500',
    sky: 'border-l-sky-500',
    violet: 'border-l-violet-500',
};

const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
};

export default function Show({ schedule, shifts }: { schedule: Schedule; shifts: Shift[] }) {
    const flash = (usePage().props as any).flash;

    const dates = useMemo(() => {
        const list: string[] = [];
        const d = new Date(schedule.start_date.slice(0, 10) + 'T00:00:00');
        const end = new Date(schedule.end_date.slice(0, 10) + 'T00:00:00');
        while (d <= end) {
            list.push(d.toISOString().slice(0, 10));
            d.setDate(d.getDate() + 1);
        }
        return list;
    }, [schedule]);

    const byDate = useMemo(() => {
        const map: Record<string, Shift[]> = {};
        for (const s of shifts) {
            const k = s.date.slice(0, 10);
            (map[k] ||= []).push(s);
        }
        for (const k of Object.keys(map)) {
            map[k].sort((a, b) => (a.unit?.name ?? '').localeCompare(b.unit?.name ?? '') || a.start_time.localeCompare(b.start_time));
        }
        return map;
    }, [shifts]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{schedule.name}</h1>
                        <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            {dates.length} days · {shifts.length} shifts
                            {schedule.status === 'published' ? (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Published</span>
                            ) : (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Draft</span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.schedules.index')}
                            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Link>
                        {schedule.status === 'draft' && (
                            <button
                                onClick={() => router.patch(route('admin.schedules.publish', schedule.id))}
                                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                <Send className="h-4 w-4" /> Publish Schedule
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={schedule.name} />

            {flash?.success && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{flash.success}</div>}
            {flash?.error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{flash.error}</div>}

            <div className="flex gap-4 overflow-x-auto pb-4">
                {dates.map((date) => {
                    const day = new Date(date + 'T00:00:00');
                    return (
                        <div key={date} className="w-60 shrink-0">
                            <div className="mb-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center shadow-sm">
                                <div className="text-xs font-semibold uppercase text-gray-400">
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                    {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {(byDate[date] ?? []).map((s) => (
                                    <div
                                        key={s.id}
                                        className={'rounded-xl border border-gray-200 border-l-4 bg-white p-3 shadow-sm ' + (COLOR_BAR[s.color] ?? 'border-l-indigo-500')}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-semibold text-gray-900">{s.unit?.name}</span>
                                            <span
                                                className={
                                                    'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                    (s.nurses.length >= s.required_nurses ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')
                                                }
                                            >
                                                {s.nurses.length}/{s.required_nurses}
                                            </span>
                                        </div>
                                        <div className="mt-0.5 text-xs text-gray-500">{fmt(s.start_time)} – {fmt(s.end_time)}</div>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {s.nurses.map((n) => (
                                                <span key={n.id} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                                    {n.name.split(' ').map((p) => p.charAt(0)).join('').slice(0, 2)}
                                                </span>
                                            ))}
                                            {s.nurses.length === 0 && <span className="text-xs text-gray-400">Unassigned</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </AuthenticatedLayout>
    );
}