import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface UnitRow {
    id: number;
    name: string;
    code: string;
    total_count: number;
    active_count: number;
}

const input = 'w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default function Index({ units }: { units: UnitRow[] }) {
    const flash = (usePage().props as any).flash;
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<UnitRow | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({ name: '', code: '' });

    const startEdit = (u: UnitRow) => {
        setEditingId(u.id);
        setData({ name: u.name, code: u.code });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const submit = (e: any) => {
        e.preventDefault();
        if (editingId) {
            put(route('admin.units.update', editingId), { onSuccess: () => { setEditingId(null); reset(); } });
        } else {
            post(route('admin.units.store'), { onSuccess: () => reset() });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Units</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hospital units where your nurses are assigned.</p>
                </div>
            }
        >
            <Head title="Units" />

            {flash?.success && (
                <div className="mb-4 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm font-medium text-green-700 dark:text-green-300">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                    {flash.error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Form card */}
                <div className="h-fit rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {editingId ? 'Edit Unit' : 'Add Unit'}
                    </div>
                    <form onSubmit={submit} className="space-y-4 p-5">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Unit Name</label>
                            <input className={input} value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Pharmacy" required />
                            {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Code</label>
                            <input className={input} value={data.code} onChange={(e) => setData('code', e.target.value.toUpperCase())} placeholder="e.g. PHARM" maxLength={20} required />
                            {errors.code && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.code}</p>}
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" disabled={processing} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                                <Plus className="h-4 w-4" /> {editingId ? 'Save Changes' : 'Add Unit'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="xl:col-span-2">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <th className="px-5 py-3.5">Unit</th>
                                    <th className="px-5 py-3.5">Code</th>
                                    <th className="px-5 py-3.5">Nurses</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {units.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/50">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/40 p-2"><Building2 className="h-4 w-4 text-amber-600 dark:text-amber-300" /></div>
                                                <span className="font-semibold text-gray-900 dark:text-white">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">{u.code}</span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{u.active_count} active of {u.total_count}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => startEdit(u)} className="rounded-lg border border-gray-200 dark:border-gray-600 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" title="Edit">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => setDeleteTarget(u)} className="rounded-lg border border-red-200 dark:border-red-900/50 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {units.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-14 text-center text-sm text-gray-500 dark:text-gray-400">No units yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this unit. Are you sure you want to do this action?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.delete(route('admin.units.destroy', deleteTarget!.id))}>
                            Yes, delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}