import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { CalendarDays, Clock, Hourglass, MapPin } from 'lucide-react';
import { useMemo } from 'react';

interface Shift {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    color: string;
    unit: { id: number; name: string } | null;
    schedule: { id: number; name: string } | null;
}

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

const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
};

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function StaffDashboard({ shifts, profile }: {
    shifts: Shift[];
    profile: { unit: string | null; max_weekly_hours: number } | null;
}) {
    const user = (usePage().props as any).auth.user;

    const now = new Date();
    const todayStr = iso(now);

    const upcoming = shifts.filter((s) => s.date.slice(0, 10) >= todayStr);
    const next = upcoming[0] ?? null;
    const hoursWeek = shifts.reduce((sum, s) => sum + shiftHours(s), 0);
    const max = profile?.max_weekly_hours ?? 40;

    const week = useMemo(() => {
        const start = new Date(now);
        start.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const ds = iso(d);
            const dayShifts = shifts.filter((s) => s.date.slice(0, 10) === ds);
            return {
                ds,
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                hours: dayShifts.reduce((x, s) => x + shiftHours(s), 0),
                isToday: ds === todayStr,
            };
        });
    }, [shifts]);

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name} 👋</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {profile?.unit ? `You're on ${profile.unit}. ` : ''}Here's your week at a glance.
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Shift</div>
                            <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                                {next
                                    ? new Date(next.date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + fmt(next.start_time)
                                    : '—'}
                            </div>
                        </div>
                        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/40 p-3"><CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-300" /></div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Hours This Week</div>
                            <div className={'mt-1 text-lg font-bold ' + (hoursWeek > max ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white')}>
                                {hoursWeek}h <span className="text-sm font-medium text-gray-400 dark:text-gray-500">/ {max}h</span>
                            </div>
                        </div>
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/40 p-3"><Clock className="h-5 w-5 text-amber-600 dark:text-amber-300" /></div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Shifts This Week</div>
                            <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{shifts.length}</div>
                        </div>
                        <div className="rounded-xl bg-green-50 dark:bg-green-900/40 p-3"><Hourglass className="h-5 w-5 text-green-600 dark:text-green-300" /></div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">My Unit</div>
                            <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{profile?.unit ?? '—'}</div>
                        </div>
                        <div className="rounded-xl bg-sky-50 dark:bg-sky-900/40 p-3"><MapPin className="h-5 w-5 text-sky-600 dark:text-sky-300" /></div>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Upcoming shifts */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm xl:col-span-2">
                    <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">My Upcoming Shifts</div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {upcoming.slice(0, 6).map((s) => (
                            <div key={s.id} className={'flex items-center justify-between gap-3 border-l-4 px-5 py-4 ' + (COLOR_BAR[s.color] ?? 'border-l-indigo-500')}>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 shrink-0">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                            {new Date(s.date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(s.date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                            {s.unit?.name}
                                            {s.date.slice(0, 10) === todayStr && (
                                                <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">TODAY</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{s.schedule?.name}</div>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{fmt(s.start_time)} – {fmt(s.end_time)}</div>
                            </div>
                        ))}
                        {upcoming.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-14 text-center">
                                <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 p-4"><CalendarDays className="h-6 w-6 text-indigo-600 dark:text-indigo-300" /></div>
                                <div className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">No upcoming shifts</div>
                                <p className="mt-1 max-w-xs text-xs text-gray-500 dark:text-gray-400">Enjoy your rest days! New published schedules will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* My week */}
                <div className="h-fit rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">My Week</div>
                    <div className="space-y-2 p-5">
                        {week.map((d) => (
                            <div
                                key={d.ds}
                                className={
                                    'flex items-center justify-between rounded-xl px-3 py-2.5 ' +
                                    (d.isToday
                                        ? 'bg-indigo-50 dark:bg-indigo-900/40 ring-1 ring-indigo-200 dark:ring-indigo-800'
                                        : 'bg-gray-50 dark:bg-gray-700/50')
                                }
                            >
                                <span className={'text-sm ' + (d.isToday ? 'font-bold text-indigo-700 dark:text-indigo-300' : 'font-medium text-gray-700 dark:text-gray-300')}>
                                    {d.label}
                                </span>
                                {d.hours > 0 ? (
                                    <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">{d.hours}h duty</span>
                                ) : (
                                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Off 💤</span>
                                )}
                            </div>
                        ))}
                        <div className="pt-2">
                            <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Weekly load</span>
                                <span>{hoursWeek}h / {max}h</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                                <div
                                    className={'h-2 rounded-full ' + (hoursWeek > max ? 'bg-amber-500' : 'bg-green-500')}
                                    style={{ width: Math.min(100, Math.round((hoursWeek / max) * 100)) + '%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}