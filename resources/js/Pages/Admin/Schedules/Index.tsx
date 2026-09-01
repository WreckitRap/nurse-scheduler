import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CalendarPlus, ChevronLeft, ChevronRight, UserMinus, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Nurse {
    id: number;
    name: string;
    nurse_profile: { max_weekly_hours: number; unit: { id: number; name: string } | null } | null;
}

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

interface Schedule { id: number; name: string; start_date: string; end_date: string; status: string; shifts_count?: number }

interface Leave { user_id: number; start_date: string; end_date: string }

const COLOR_BAR: Record<string, string> = {
    indigo: 'border-l-indigo-500',
    green: 'border-l-green-500',
    amber: 'border-l-amber-500',
    rose: 'border-l-rose-500',
    sky: 'border-l-sky-500',
    violet: 'border-l-violet-500',
};

const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

const shiftHours = (s: Shift) => {
    let e = toMin(s.end_time.slice(0, 5));
    const st = toMin(s.start_time.slice(0, 5));
    if (e <= st) e += 1440;
    return (e - st) / 60;
};

const overlaps = (a: Shift, b: Shift) => {
    let aE = toMin(a.end_time.slice(0, 5));
    const aS = toMin(a.start_time.slice(0, 5));
    if (aE <= aS) aE += 1440;
    let bE = toMin(b.end_time.slice(0, 5));
    const bS = toMin(b.start_time.slice(0, 5));
    if (bE <= bS) bE += 1440;
    return aS < bE && bS < aE;
};

const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
};

const pad = (n: number) => String(n).padStart(2, '0');

const input = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

function CalendarBoard({ schedule, shifts, nurses, leaves }: { schedule: Schedule | null; shifts: Shift[]; nurses: Nurse[]; leaves: Leave[] }) {
    const [month, setMonth] = useState(() => {
        const base = schedule ? schedule.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
        return new Date(base + 'T00:00:00');
    });
    const [selectedDate, setSelectedDate] = useState<string | null>(schedule ? schedule.start_date.slice(0, 10) : null);
    const [assignShiftId, setAssignShiftId] = useState<number | null>(null);
    const assignShift = useMemo(() => shifts.find((s) => s.id === assignShiftId) ?? null, [shifts, assignShiftId]);

    useEffect(() => {
        const base = schedule ? schedule.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
        setMonth(new Date(base + 'T00:00:00'));
        setSelectedDate(schedule ? schedule.start_date.slice(0, 10) : null);
    }, [schedule?.id]);

    const rangeStart = schedule?.start_date.slice(0, 10) ?? null;
    const rangeEnd = schedule?.end_date.slice(0, 10) ?? null;

    const cells = useMemo(() => {
        const y = month.getFullYear();
        const m = month.getMonth();
        const offset = new Date(y, m, 1).getDay();
        const days = new Date(y, m + 1, 0).getDate();
        const list: (string | null)[] = Array(offset).fill(null);
        for (let d = 1; d <= days; d++) list.push(`${y}-${pad(m + 1)}-${pad(d)}`);
        return list;
    }, [month]);

    const dayShifts = useMemo(
        () =>
            shifts
                .filter((s) => s.date.slice(0, 10) === selectedDate)
                .sort((a, b) => (a.unit?.name ?? '').localeCompare(b.unit?.name ?? '') || a.start_time.localeCompare(b.start_time)),
        [shifts, selectedDate],
    );

    const nurseHours = (nurseId: number) =>
        shifts
            .filter((s) => s.nurses.some((n) => n.id === nurseId))
            .reduce((sum, s) => sum + shiftHours(s), 0);

    const conflictFor = (nurse: Nurse, shift: Shift) =>
        shifts.find(
            (s) =>
                s.id !== shift.id &&
                s.date.slice(0, 10) === shift.date.slice(0, 10) &&
                s.nurses.some((n) => n.id === nurse.id),
        ) ?? null;

    const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const shiftDay = (ds: string, delta: number) => {
        const d = new Date(ds + 'T00:00:00');
        d.setDate(d.getDate() + delta);
        return iso(d);
    };

    const streakIfAdded = (nurseId: number, dateStr: string) => {
        const dates = new Set(
            shifts.filter((s) => s.nurses.some((n) => n.id === nurseId)).map((s) => s.date.slice(0, 10)),
        );
        if (dates.has(dateStr)) return 0;
        let back = 0;
        while (dates.has(shiftDay(dateStr, -(back + 1)))) back++;
        let forward = 0;
        while (dates.has(shiftDay(dateStr, forward + 1))) forward++;
        return back + 1 + forward;
    };

    const onLeaveFor = (nurseId: number, dateStr: string) =>
        leaves.some(
            (l) =>
                l.user_id === nurseId &&
                l.start_date.slice(0, 10) <= dateStr &&
                l.end_date.slice(0, 10) >= dateStr,
        );

    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Calendar */}
            <div className="h-fit rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                        {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-gray-400">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d} className="py-1">{d}</div>)}
                    </div>
                    <div className="mt-1 grid grid-cols-7 gap-1">
                        {cells.map((ds, i) =>
                            ds === null ? (
                                <div key={'e' + i} />
                            ) : (
                                <button
                                    key={ds}
                                    onClick={() => setSelectedDate(ds)}
                                    className={
                                        'h-10 rounded-lg text-sm ' +
                                        (selectedDate === ds
                                            ? 'bg-indigo-600 font-bold text-white'
                                            : rangeStart && rangeEnd && ds >= rangeStart && ds <= rangeEnd
                                              ? 'bg-indigo-50 font-semibold text-indigo-700 hover:bg-indigo-100'
                                              : 'text-gray-700 hover:bg-gray-100')
                                    }
                                >
                                    {Number(ds.slice(8, 10))}
                                </button>
                            ),
                        )}
                    </div>
                    {schedule && (
                        <p className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                            Highlighted days belong to <strong>{schedule.name}</strong>. Click a day to see its shifts.
                        </p>
                    )}
                </div>
            </div>

            {/* Day shifts */}
            <div className="xl:col-span-2">
                <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4 text-sm font-semibold text-gray-900">
                        {selectedDate
                            ? 'Shifts for ' + new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                            : 'Pick a day on the calendar'}
                    </div>
                    <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
                        {dayShifts.map((s) => (
                            <div key={s.id} className={'rounded-xl border border-gray-200 border-l-4 bg-white p-4 shadow-sm ' + (COLOR_BAR[s.color] ?? 'border-l-indigo-500')}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-gray-900">{s.unit?.name}</span>
                                    <span
                                        className={
                                            'rounded-full px-2 py-0.5 text-xs font-medium ' +
                                            (s.nurses.length >= s.required_nurses ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')
                                        }
                                    >
                                        {s.nurses.length}/{s.required_nurses}
                                    </span>
                                </div>
                                <div className="mt-0.5 text-xs text-gray-500">{fmt(s.start_time)} – {fmt(s.end_time)}</div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {s.nurses.map((n) => (
                                        <span key={n.id} className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                            {n.name}
                                            <button
                                                onClick={() => router.delete(route('admin.shifts.unassign', [s.id, n.id]), { preserveScroll: true })}
                                                className="text-indigo-400 hover:text-red-600"
                                                title="Remove"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setAssignShiftId(s.id)}
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                                >
                                    <UserPlus className="h-3.5 w-3.5" /> Assign Nurse
                                </button>
                            </div>
                        ))}
                        {dayShifts.length === 0 && (
                            <div className="col-span-full py-10 text-center text-sm text-gray-500">
                                No shifts on this day for the selected schedule.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Assign dialog */}
            <Dialog open={!!assignShift} onOpenChange={(o) => { if (!o) setAssignShiftId(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign nurse — {assignShift?.unit?.name}</DialogTitle>
                        <DialogDescription>
                            {assignShift && `${fmt(assignShift.start_time)} – ${fmt(assignShift.end_time)} · needs ${assignShift.required_nurses}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-80 space-y-2 overflow-y-auto">
                        {nurses.map((n) => {
                            const assigned = assignShift?.nurses.some((x) => x.id === n.id) ?? false;
                            const conflict = assignShift && !assigned ? conflictFor(n, assignShift) : null;
                            const hours = nurseHours(n.id);
                            const max = n.nurse_profile?.max_weekly_hours ?? 40;
                            const wouldExceed = assignShift ? hours + shiftHours(assignShift) > max : false;
                            const overStreak = assignShift && !assigned ? streakIfAdded(n.id, assignShift.date.slice(0, 10)) > 3 : false;
                            const onLeave = assignShift && !assigned ? onLeaveFor(n.id, assignShift.date.slice(0, 10)) : false;

                            return (
                                <div key={n.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5">
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{n.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {n.nurse_profile?.unit?.name ?? 'No unit'} ·{' '}
                                            <span className={hours + (assignShift && !assigned ? shiftHours(assignShift) : 0) > max ? 'font-semibold text-amber-600' : ''}>
                                                {hours}h / {max}h{wouldExceed && !assigned ? ' ⚠' : ''}
                                            </span>
                                        </div>
                                        {conflict && <div className="text-xs font-medium text-red-600">Already on duty: {conflict.unit?.name} {fmt(conflict.start_time)}</div>}
                                        {overStreak && <div className="text-xs font-medium text-red-600">3 days straight already</div>}
                                        {onLeave && <div className="text-xs font-medium text-red-600">On approved leave</div>}
                                    </div>
                                    {assigned ? (
                                        <button
                                            onClick={() => assignShift && router.delete(route('admin.shifts.unassign', [assignShift.id, n.id]), { preserveScroll: true })}
                                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                        >
                                            <UserMinus className="h-3.5 w-3.5" /> Remove
                                        </button>
                                    ) : (
                                        <button
                                            disabled={!!conflict || overStreak || onLeave}
                                            onClick={() => assignShift && router.post(route('admin.shifts.assign', assignShift.id), { nurse_id: n.id }, { preserveScroll: true })}
                                            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <UserPlus className="h-3.5 w-3.5" /> Assign
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function Index({ schedules, schedule, shifts, nurses, leaves, templates_count }: {
    schedules: Schedule[];
    schedule: Schedule | null;
    shifts: Shift[];
    nurses: Nurse[];
    leaves: Leave[];
    templates_count: number;
}) {
    const flash = (usePage().props as any).flash;
    const { data, setData, post, processing, errors } = useForm({ name: '', start_date: '', end_date: '' });

    const submit = (e: any) => {
        e.preventDefault();
        post(route('admin.schedules.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Schedules</h1>
                    <p className="text-sm text-gray-500">Build weekly rosters from your shift templates.</p>
                </div>
            }
        >
            <Head title="Schedules" />

            {flash?.success && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{flash.success}</div>}
            {flash?.error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{flash.error}</div>}

            {/* Top: create + list */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="h-fit rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4 text-sm font-semibold text-gray-900">Create Schedule</div>
                    <form onSubmit={submit} className="space-y-4 p-5">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Name (optional)</label>
                            <input className={input} value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Auto: Sep 01 – Sep 07, 2026" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
                                <input type="date" className={input} value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} required />
                                {errors.start_date && <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
                                <input type="date" className={input} value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} required />
                                {errors.end_date && <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>}
                            </div>
                        </div>
                        <p className="rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                            Shifts auto-generated from <strong>{templates_count}</strong> active template(s) × every unit × every day.
                        </p>
                        <button type="submit" disabled={processing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                            <CalendarPlus className="h-4 w-4" /> Create Schedule
                        </button>
                    </form>
                </div>

            <div className="xl:col-span-2">
                <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {/* Desktop table */}
                    <div className="hidden md:block">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-left text-sm font-medium text-gray-700">
                                    <th className="px-5 py-3.5">Schedule</th>
                                    <th className="px-5 py-3.5">Period</th>
                                    <th className="px-5 py-3.5">Shifts</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {schedules.map((s) => (
                                    <tr
                                        key={s.id}
                                        onClick={() => router.get(route('admin.schedules.index', { schedule: s.id }))}
                                        className={(schedule?.id === s.id ? 'bg-indigo-100 ' : '') + 'cursor-pointer hover:bg-indigo-100'}
                                    >
                                        <td className="px-5 py-4 font-semibold text-gray-900">{s.name}</td>
                                        <td className="px-5 py-4 text-gray-600">{s.start_date.slice(0, 10)} → {s.end_date.slice(0, 10)}</td>
                                        <td className="px-5 py-4 text-gray-600">{s.shifts_count}</td>
                                        <td className="px-5 py-4">
                                            {s.status === 'published' ? (
                                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Published</span>
                                            ) : (
                                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">Draft</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {s.status === 'draft' && (
                                                    <button
                                                        onClick={() => router.patch(route('admin.schedules.publish', s.id), {}, { preserveScroll: true })}
                                                        className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-50"
                                                    >
                                                        Publish
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {schedules.length === 0 && (
                                    <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-gray-500">No schedules yet. Create your first weekly roster on the left.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="divide-y divide-gray-100 md:hidden">
                        {schedules.map((s) => (
                            <div key={s.id} className={(schedule?.id === s.id ? 'bg-indigo-50/50 ' : '') + 'p-4'}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-gray-900">{s.name}</div>
                                        <div className="mt-0.5 text-xs text-gray-500">{s.start_date.slice(0, 10)} → {s.end_date.slice(0, 10)}</div>
                                    </div>
                                    {s.status === 'published' ? (
                                        <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Published</span>
                                    ) : (
                                        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">Draft</span>
                                    )}
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-2">
                                    <span className="text-xs text-gray-500">{s.shifts_count} shifts</span>
                                    <div className="flex gap-2">
                                        {s.status === 'draft' && (
                                            <button
                                                onClick={() => router.patch(route('admin.schedules.publish', s.id), {}, { preserveScroll: true })}
                                                className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-50"
                                            >
                                                Publish
                                            </button>
                                        )}
                                        <Link
                                            href={route('admin.schedules.index', { schedule: s.id })}
                                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                        >
                                            Select
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {schedules.length === 0 && (
                            <div className="p-10 text-center text-sm text-gray-500">No schedules yet. Create your first weekly roster above.</div>
                        )}
                    </div>
                </div>
            </div>
            </div>

            {/* Bottom: calendar + day shifts */}
            <div className="mt-6">
                <CalendarBoard schedule={schedule} shifts={shifts} nurses={nurses} leaves={leaves} />
            </div>
        </AuthenticatedLayout>
    );
}