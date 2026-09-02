import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, CalendarDays, Clock, UserCheck, UserPlus, Users } from 'lucide-react';
import { router } from '@inertiajs/react';

function StatCard({ icon: Icon, label, value, accent }) {
    return (
        <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                </div>
                <div className={'rounded-xl p-3 ' + accent}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function Card({ title, action, children }) {
    return (
        <div className="flex h-full flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-5 py-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{title}</div>
                {action}
            </div>
            <div className="flex-1 p-5">{children}</div>
        </div>
    );
}

function EmptyState({ icon: Icon, accent, title, text }) {
    return (
        <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <div className={'rounded-2xl p-4 ' + accent}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{title}</div>
            <p className="mt-1 max-w-xs text-xs text-gray-500 dark:text-gray-400">{text}</p>
        </div>
    );
}

export default function Dashboard({ stats, nurses, units_list, coverage, pending_time_off }) {
    const user = usePage().props.auth.user;
    const isAdmin = user.role === 'nurse_admin';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name} 👋</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isAdmin
                            ? "Here's what's happening with your nursing team today."
                            : 'Here is your upcoming schedule at a glance.'}
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            {isAdmin ? (
                <>
                    {/* Row 1: stats */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard icon={Users} label="Total Nurses" value={stats.total_nurses} accent="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300" />
                        <StatCard icon={UserCheck} label="Active Nurses" value={stats.active_nurses} accent="bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-300" />
                        <StatCard icon={Building2} label="Units" value={stats.units} accent="bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300" />
                        <StatCard icon={Clock} label="Pending Time-Off" value={stats.pending_requests} accent="bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300" />
                    </div>

                    {/* Row 2: team + coverage */}
                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <div className="xl:col-span-2">
                            <Card
                                title="Nurse Staff"
                                action={
                                    <div className="flex items-center gap-4">
                                        <Link href={route('admin.nurses.create')} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                                            + Add
                                        </Link>
                                        <Link href={route('admin.nurses.index')} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:underline">
                                            See All
                                        </Link>
                                    </div>
                                }
                            >
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {(nurses ?? []).map((n) => (
                                        <div key={n.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-lg">
                                                    {n.nurse_profile?.avatar || n.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{n.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {n.nurse_profile?.unit?.name ?? 'No unit'} · {n.nurse_profile?.employee_no}
                                                    </div>
                                                </div>
                                            </div>
                                            {n.nurse_profile?.is_active ? (
                                                <span className="rounded-full bg-green-100 dark:bg-green-900/40 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">Active</span>
                                            ) : (
                                                <span className="rounded-full bg-red-100 dark:bg-red-900/40 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300">Inactive</span>
                                            )}
                                        </div>
                                    ))}
                                    {(nurses ?? []).length === 0 && (
                                        <EmptyState icon={Users} accent="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300" title="No nurses yet" text="Create your first nurse staff to start scheduling." />
                                    )}
                                </div>
                            </Card>
                        </div>

                        <Card title="Coverage Snapshot">
                            {coverage ? (
                                <div>
                                    <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 px-3 py-2">
                                        <span className="truncate text-xs font-medium text-indigo-700 dark:text-indigo-300">{coverage.schedule_name}</span>
                                        <span className="shrink-0 rounded-full bg-white dark:bg-gray-700 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                            {coverage.open_slots} open
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {coverage.days.map((d) => {
                                            const pct = d.required ? Math.min(100, Math.round((d.assigned / d.required) * 100)) : 100;
                                            const bar = pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500';
                                            return (
                                                <div key={d.date}>
                                                    <div className="mb-1 flex items-center justify-between text-xs">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                                            {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-gray-400">{d.assigned}/{d.required} filled</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                                                        <div className={'h-2 rounded-full ' + bar} style={{ width: pct + '%' }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {coverage.days.length === 0 && (
                                            <p className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">No upcoming shifts in this schedule.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <EmptyState
                                    icon={CalendarDays}
                                    accent="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
                                    title="No schedule yet"
                                    text="Create a schedule to see live coverage gaps here."
                                />
                            )}
                        </Card>
                    </div>

                    {/* Row 3: units + quick actions + time off */}
                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <Card title="Units Overview">
                            <div className="space-y-4">
                                {(units_list ?? []).map((u) => (
                                    <div key={u.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/40 p-2">
                                                <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{u.code}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{u.active_count}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">active of {u.total_count}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card title="Quick Actions">
                            <div className="grid gap-3">
                                <Link
                                    href={route('admin.nurses.create')}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    <UserPlus className="h-4 w-4" /> Add Nurse Staff
                                </Link>
                                <Link
                                    href={route('admin.nurses.index')}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <Users className="h-4 w-4" /> Manage Nurse Staff
                                </Link>
                                <Link
                                    href={route('admin.schedules.index')}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <CalendarDays className="h-4 w-4" /> Create Schedule
                                </Link>
                            </div>
                        </Card>

                        <Card title="Time Off">
                            {pending_time_off && pending_time_off.length > 0 ? (
                                <div className="space-y-3">
                                    {pending_time_off.slice(0, 5).map((r) => (
                                        <div key={r.id} className="rounded-xl border border-gray-200 dark:border-gray-600 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{r.user.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {r.user.nurse_profile?.unit?.name ?? '—'} ·{' '}
                                                        {new Date(r.start_date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        {' → '}
                                                        {new Date(r.end_date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 gap-1.5">
                                                    <button
                                                        onClick={() => router.patch(route('admin.time-off.approve', r.id), {}, { preserveScroll: true })}
                                                        className="rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                                                        title="Approve"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => router.patch(route('admin.time-off.reject', r.id), {}, { preserveScroll: true })}
                                                        className="rounded-lg border border-red-200 dark:border-red-900/50 px-2.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        title="Reject"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <a href={route('admin.time-off.index')} className="block text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                                        Review all requests →
                                    </a>
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Clock}
                                    accent="bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300"
                                    title="No pending requests"
                                    text="Time-off requests from your team will appear here for approval."
                                />
                            )}
                        </Card>
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatCard icon={CalendarDays} label="Next Shift" value="—" accent="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300" />
                        <StatCard icon={Clock} label="Hours This Week" value="0h" accent="bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-300" />
                        <StatCard icon={UserCheck} label="Status" value="Active" accent="bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300" />
                    </div>

                    <div className="mt-6">
                        <Card title="My Upcoming Shifts">
                            <EmptyState
                                icon={CalendarDays}
                                accent="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
                                title="No shifts yet"
                                text="Your published schedule will show up here once the admin assigns you to shifts."
                            />
                        </Card>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}