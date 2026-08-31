import Logo from '@/Components/Logo';
import { router, usePage } from '@inertiajs/react';
import {
    Bell,
    Building2,
    CalendarDays,
    CalendarRange,
    Clock,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isAdmin = user.role === 'nurse_admin';

    const navigation = [
        {
            section: 'Main',
            items: [
                { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, current: route().current('dashboard') },
                { name: 'Schedule', href: isAdmin ? route('admin.schedules.index') : null, icon: CalendarDays, current: route().current('admin.schedules.*') },
                { name: 'Time Off', href: null, icon: Clock, soon: true },
            ],
        },
        ...(isAdmin
            ? [{
                section: 'Management',
                items: [
                    { name: 'Nurse Staff', href: route('admin.nurses.index'), icon: Users, current: route().current('admin.nurses.*') },
                    { name: 'Shift Templates', href: route('admin.shift-templates.index'), icon: CalendarRange, current: route().current('admin.shift-templates.*') },
                    { name: 'Units', href: route('admin.units.index'), icon: Building2, current: route().current('admin.units.*') },
                ],
            }]
            : []),
    ];

    const sidebarContent = (
        <>
            {/* Brand + Notification bell */}
            <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
                <Logo className="h-9 w-9 drop-shadow-sm" />
            <div>
                <div className="text-sm font-bold text-gray-900">Nurse Scheduler</div>
                <div className="text-xs text-gray-500">Hospital Scheduling</div>
            </div>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
                {navigation.map((group) => (
                    <div key={group.section}>
                        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {group.section}
                        </div>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                if (!item.href) {
                                    return (
                                        <div key={item.name} className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-400">
                                            <span className="flex items-center gap-3">
                                                <Icon className="h-4 w-4" />
                                                {item.name}
                                            </span>
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400">SOON</span>
                                        </div>
                                    );
                                }
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ' +
                                            (item.current ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
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

            {/* Settings + User card */}
            <div className="border-t border-gray-100 p-4">
                <a
                    href={route('profile.edit')}
                    className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </a>

                <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-gray-900">{user.name}</div>
                        <div className="truncate text-xs text-gray-500">{isAdmin ? 'Nurse Admin' : 'Nurse Staff'}</div>
                    </div>
                    <button
                        onClick={() => router.post(route('logout'))}
                        title="Log out"
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
                {sidebarContent}
            </aside>

            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
                    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
                        <button
                            className="absolute right-3 top-4 rounded-lg p-1 text-gray-500 hover:bg-gray-100"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        {sidebarContent}
                    </aside>
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex h-16 items-center border-b border-gray-200 bg-white px-4 sm:px-6 lg:hidden">
                    <button
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </header>

                <main className="flex min-h-[calc(100vh-4rem)] flex-col p-4 sm:p-6 lg:min-h-screen lg:p-8">
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div className="min-w-0">{header}</div>
                        <button
                            className="relative shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        </button>
                    </div>
                    <div className="flex flex-1 flex-col">{children}</div>
                </main>
            </div>
        </div>
    );
}