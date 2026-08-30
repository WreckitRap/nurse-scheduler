import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Nurse {
    id: number;
    name: string;
    email: string;
    nurse_profile: {
        employee_no: string;
        specialization: string | null;
        employment_type: string;
        max_weekly_hours: number;
        is_active: boolean;
        unit: { id: number; name: string } | null;
    } | null;
}

interface Unit { id: number; name: string }

const PER_PAGE = 10;

function StatusChip({ active }: { active: boolean }) {
    return active ? (
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Active</span>
    ) : (
        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Inactive</span>
    );
}

export default function Index({ nurses, units }: { nurses: Nurse[]; units: Unit[] }) {
    const flash = (usePage().props as any).flash;

    const [search, setSearch] = useState('');
    const [unitFilter, setUnitFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortKey, setSortKey] = useState<'name' | 'employee_no' | 'unit' | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const [menuOpen, setMenuOpen] = useState<number | null>(null);

    const filtered = useMemo(() => {
        let list = [...nurses];

        const q = search.trim().toLowerCase();
        if (q) {
            list = list.filter(
                (n) =>
                    n.name.toLowerCase().includes(q) ||
                    n.email.toLowerCase().includes(q) ||
                    (n.nurse_profile?.employee_no ?? '').toLowerCase().includes(q),
            );
        }

        if (unitFilter) {
            list = list.filter((n) => String(n.nurse_profile?.unit?.id ?? '') === unitFilter);
        }

        if (statusFilter) {
            const wantActive = statusFilter === 'active';
            list = list.filter((n) => Boolean(n.nurse_profile && n.nurse_profile.is_active) === wantActive);
        }

        if (sortKey) {
            list.sort((a, b) => {
                const av =
                    sortKey === 'name'
                        ? a.name
                        : sortKey === 'employee_no'
                        ? (a.nurse_profile?.employee_no ?? '')
                        : (a.nurse_profile?.unit?.name ?? '');
                const bv =
                    sortKey === 'name'
                        ? b.name
                        : sortKey === 'employee_no'
                        ? (b.nurse_profile?.employee_no ?? '')
                        : (b.nurse_profile?.unit?.name ?? '');
                return av.localeCompare(bv) * (sortDir === 'asc' ? 1 : -1);
            });
        }

        return list;
    }, [nurses, search, unitFilter, statusFilter, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const current = Math.min(page, totalPages);
    const paged = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
    const from = filtered.length === 0 ? 0 : (current - 1) * PER_PAGE + 1;
    const to = Math.min(current * PER_PAGE, filtered.length);

    const toggleSort = (key: 'name' | 'employee_no' | 'unit') => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const SortIcon = ({ k }: { k: 'name' | 'employee_no' | 'unit' }) =>
        sortKey === k ? (
            sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
        ) : (
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
        );

    const rowMenu = (n: Nurse) => (
        <div className="relative inline-block">
            <button
                onClick={() => setMenuOpen(menuOpen === n.id ? null : n.id)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen === n.id && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                    <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                        <Link
                            href={route('admin.nurses.edit', n.id)}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Pencil className="h-4 w-4" /> Edit
                        </Link>
                        <button
                            onClick={() => {
                                setMenuOpen(null);
                                router.patch(route('admin.nurses.toggle', n.id));
                            }}
                            className={
                                'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm ' +
                                (n.nurse_profile?.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50')
                            }
                        >
                            {n.nurse_profile?.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            {n.nurse_profile?.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Nurse Staff</h1>
                    <p className="text-sm text-gray-500">Manage your nursing team accounts and profiles.</p>
                </div>
            }
        >
            <Head title="Nurse Staff" />

            {flash?.success && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {flash.success}
                </div>
            )}

            <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                        <div className="relative sm:max-w-xs sm:flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search name, email, ID..."
                                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <select
                            value={unitFilter}
                            onChange={(e) => { setUnitFilter(e.target.value); setPage(1); }}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">All Units</option>
                            {units.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-8 text-sm text-gray-600 focus:border-indigo-500 focus:outline-none sm:w-40"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <Link
                        href={route('admin.nurses.create')}
                        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" /> Add Nurse Staff
                    </Link>
                </div>

                {/* Desktop table */}
                <div className="hidden flex-1 overflow-x-auto md:block">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-left text-sm font-medium text-gray-700">
                                <th className="px-5 py-3.5">No.</th>
                                <th className="px-5 py-3.5">
                                    <button className="flex items-center gap-1.5" onClick={() => toggleSort('name')}>
                                        Name <SortIcon k="name" />
                                    </button>
                                </th>
                                <th className="px-5 py-3.5">
                                    <button className="flex items-center gap-1.5" onClick={() => toggleSort('employee_no')}>
                                        Employee # <SortIcon k="employee_no" />
                                    </button>
                                </th>
                                <th className="px-5 py-3.5">
                                    <button className="flex items-center gap-1.5" onClick={() => toggleSort('unit')}>
                                        Unit <SortIcon k="unit" />
                                    </button>
                                </th>
                                <th className="px-5 py-3.5">Type</th>
                                <th className="px-5 py-3.5">Max Hrs/Wk</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paged.map((n, i) => (
                                <tr key={n.id} className="hover:bg-gray-50/60">
                                    <td className="px-5 py-4 text-gray-500">{from + i}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                                {n.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{n.name}</div>
                                                <div className="text-xs text-gray-500">{n.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">{n.nurse_profile?.employee_no ?? '—'}</td>
                                    <td className="px-5 py-4 text-gray-600">{n.nurse_profile?.unit?.name ?? '—'}</td>
                                    <td className="px-5 py-4 capitalize text-gray-600">{(n.nurse_profile?.employment_type ?? '').replace('_', '-')}</td>
                                    <td className="px-5 py-4 text-gray-600">{n.nurse_profile?.max_weekly_hours}</td>
                                    <td className="px-5 py-4"><StatusChip active={!!n.nurse_profile?.is_active} /></td>
                                    <td className="px-5 py-4 text-right">{rowMenu(n)}</td>
                                </tr>
                            ))}
                            {paged.length === 0 && (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="flex flex-col items-center justify-center py-14 text-center">
                                            <div className="rounded-2xl bg-indigo-50 p-4"><Users className="h-6 w-6 text-indigo-600" /></div>
                                            <div className="mt-3 text-sm font-semibold text-gray-900">No nurses found</div>
                                            <p className="mt-1 text-xs text-gray-500">Try changing your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="flex-1 space-y-4 p-4 md:hidden">
                    {paged.map((n) => (
                        <div key={n.id} className="rounded-2xl border border-gray-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                        {n.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{n.name}</div>
                                        <div className="text-xs text-gray-500">{n.email}</div>
                                    </div>
                                </div>
                                {rowMenu(n)}
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 text-xs">
                                <div><div className="text-gray-500">Employee #</div><div className="font-semibold text-gray-900">{n.nurse_profile?.employee_no ?? '—'}</div></div>
                                <div><div className="text-gray-500">Unit</div><div className="font-semibold text-gray-900">{n.nurse_profile?.unit?.name ?? '—'}</div></div>
                                <div><div className="text-gray-500">Type</div><div className="font-semibold capitalize text-gray-900">{(n.nurse_profile?.employment_type ?? '').replace('_', '-')}</div></div>
                                <div><div className="text-gray-500">Status</div><div className="mt-0.5"><StatusChip active={!!n.nurse_profile?.is_active} /></div></div>
                            </div>
                        </div>
                    ))}
                    {paged.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                            <div className="rounded-2xl bg-indigo-50 p-4"><Users className="h-6 w-6 text-indigo-600" /></div>
                            <div className="mt-3 text-sm font-semibold text-gray-900">No nurses found</div>
                            <p className="mt-1 text-xs text-gray-500">Try changing your search or filters.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row">
                    <p className="text-sm text-gray-500">
                        Showing {from} - {to} of {filtered.length} nurses
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={current === 1}
                            onClick={() => setPage(current - 1)}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={
                                    'h-9 w-9 rounded-lg text-sm font-medium ' +
                                    (p === current ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50')
                                }
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            disabled={current === totalPages}
                            onClick={() => setPage(current + 1)}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}