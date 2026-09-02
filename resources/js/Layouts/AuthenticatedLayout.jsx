import Logo from '@/Components/Logo';
import { router, usePage } from '@inertiajs/react';
import {
    Bell, Building2, CalendarDays, CalendarRange, Clock, LayoutDashboard,
    LogOut, Menu, Settings, Users, X,
} from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const notifications = usePage().props.notifications ?? [];
    const unread = notifications.filter((n) => !n.read_at).length;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const isAdmin = user.role === 'nurse_admin';

    const navigation = [
        {
            section: 'Main',
            items: [
                { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, current: route().current('dashboard') },
                ...(isAdmin ? [{ name: 'Schedule', href: route('admin.schedules.index'), icon: CalendarDays, current: route().current('admin.schedules.*') }] : []),
                {
                    name: 'Time Off',
                    href: isAdmin ? route('admin.time-off.index') : route('time-off.index'),
                    icon: Clock,
                    current: isAdmin ? route().current('admin.time-off.*') : route().current('time-off.*'),
                },
            ],
        },
        ...(isAdmin ? [{
            section: 'Management',
            items: [
                { name: 'Nurse Staff', href: route('admin.nurses.index'), icon: Users, current: route().current('admin.nurses.*') },
                { name: 'Shift Templates', href: route('admin.shift-templates.index'), icon: CalendarRange, current: route().current('admin.shift-templates.*') },
                { name: 'Units', href: route('admin.units.index'), icon: Building2, current: route().current('admin.units.*') },
            ],
        }] : []),
    ];

    const sidebarContent = (
        <>
            <div className="flex h-16 items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-6">
                <Logo className="h-9 w-9 drop-shadow-sm" />
                <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">Nurse Scheduler</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Hospital Scheduling</div>
                </div>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
                {navigation.map((group) => (
                    <div key={group.section}>
                        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            {group.section}
                        </div>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                if (!item.href) {
                                    return (
                                        <div key={item.name} className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-500">
                                            <span className="flex items-center gap-3"><Icon className="h-4 w-4" />{item.name}</span>
                                            <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-semibold">SOON</span>
                                        </div>
                                    );
                                }
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ' +
                                            (item.current 
                                                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' 
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white')
                                        }
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.name}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                <a href={route('profile.edit')} className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white">
                    <Settings className="h-4 w-4" /> Settings
                </a>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-lg">
                        {user.nurse_profile?.avatar ?? (isAdmin ? '🩺' : user.name.charAt(0).toUpperCase())}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user.name}</div>
                        <div className="truncate text-xs text-gray-500 dark:text-gray-400">{isAdmin ? 'Nurse Admin' : 'Nurse Staff'}</div>
                    </div>
                    <button onClick={() => router.post(route('logout'))} title="Log out" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-white">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:flex">
                {sidebarContent}
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
                    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800">
                        <button className="absolute right-3 top-4 rounded-lg p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setSidebarOpen(false)}>
                            <X className="h-5 w-5" />
                        </button>
                        {sidebarContent}
                    </aside>
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex h-16 items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 lg:hidden">
                    <button className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </button>
                </header>

                <main className="flex min-h-[calc(100vh-4rem)] flex-col p-4 sm:p-6 lg:min-h-screen lg:p-8">
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div className="min-w-0 text-gray-900 dark:text-white">{header}</div>
                        
                        <div className="relative shrink-0">
                            <button onClick={() => setNotifOpen(!notifOpen)} className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-white" title="Notifications">
                                <Bell className="h-5 w-5" />
                                {unread > 0 && (
                                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                                        {unread}
                                    </span>
                                )}
                            </button>
                            {notifOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)} />
                                    <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-4 py-3">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
                                            {unread > 0 && (
                                                <button onClick={() => router.post(route('notifications.readAll'))} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.map((n) => (
                                                <a key={n.id} href={n.link ?? '#'} onClick={() => setNotifOpen(false)} className={'block border-b border-gray-50 dark:border-gray-700 px-4 py-3 text-sm ' + (n.read_at ? 'text-gray-500 dark:text-gray-400' : 'bg-indigo-50/50 dark:bg-indigo-900/20 font-medium text-gray-900 dark:text-white')}>
                                                    {n.message}
                                                    <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                                                </a>
                                            ))}
                                            {notifications.length === 0 && (
                                                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No notifications yet.</div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col">{children}</div>
                </main>
            </div>
        </div>
    );
}