import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import TimePicker from '@/Components/ui/time-picker';

interface Template {
    id: number;
    name: string;
    unit_id: number | null;
    start_time: string;
    end_time: string;
    required_nurses: number;
    color: string;
    unit: { id: number; name: string } | null;
}

const COLORS: Record<string, string> = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
};

export default function Index({ templates, units }: { templates: Template[]; units: { id: number; name: string }[] }) {
    const flash = (usePage().props as any).flash;
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        unit_id: '',
        start_time: '07:00',
        end_time: '15:00',
        required_nurses: '1',
        color: 'indigo',
    });

    const startEdit = (t: Template) => {
        setEditingId(t.id);
        setData({
            name: t.name,
            unit_id: t.unit_id ? String(t.unit_id) : '',
            start_time: t.start_time.slice(0, 5),
            end_time: t.end_time.slice(0, 5),
            required_nurses: String(t.required_nurses),
            color: t.color,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const submit = (e: any) => {
        e.preventDefault();
        if (editingId) {
            put(route('admin.shift-templates.update', editingId), {
                onSuccess: () => { setEditingId(null); reset(); },
            });
        } else {
            post(route('admin.shift-templates.store'), { onSuccess: () => reset() });
        }
    };

    const input = 'w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shift Templates</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Define the reusable shifts your schedules are built from.</p>
                </div>
            }
        >
            <Head title="Shift Templates" />

            {flash?.success && (
                <div className="mb-4 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm font-medium text-green-700 dark:text-green-300">
                    {flash.success}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Form card */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {editingId ? 'Edit Shift Template' : 'Add Shift Template'}
                    </div>
                    <form onSubmit={submit} className="space-y-4 p-5">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Shift Name</label>
                            <input className={input} value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Morning" required />
                            {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
                            <Select value={data.unit_id || 'none'} onValueChange={(v) => setData('unit_id', v === 'none' ? '' : v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Units" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">All Units</SelectItem>
                                    {units.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Start</label>
                                <TimePicker value={data.start_time} onChange={(v) => setData('start_time', v)} />
                                {errors.start_time && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.start_time}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">End</label>
                                <TimePicker value={data.end_time} onChange={(v) => setData('end_time', v)} />
                                {errors.end_time && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.end_time}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Required Nurses</label>
                                <input type="number" min={1} max={20} className={input} value={data.required_nurses} onChange={(e) => setData('required_nurses', e.target.value)} required />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                                <Select value={data.color} onValueChange={(v) => setData('color', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(COLORS).map((c) => (
                                            <SelectItem key={c} value={c}>
                                                <span className="flex items-center gap-2 capitalize">
                                                    <span className={'h-3 w-3 rounded-full ' + COLORS[c]} /> {c}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" /> {editingId ? 'Save Changes' : 'Add Template'}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="xl:col-span-2">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <th className="px-5 py-3.5">Shift</th>
                                    <th className="px-5 py-3.5">Unit</th>
                                    <th className="px-5 py-3.5">Time</th>
                                    <th className="px-5 py-3.5">Required</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {templates.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/50">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <span className={'h-3 w-3 rounded-full ' + (COLORS[t.color] ?? 'bg-indigo-500')} />
                                                <span className="font-semibold text-gray-900 dark:text-white">{t.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{t.unit?.name ?? 'All Units'}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{t.start_time.slice(0, 5)} – {t.end_time.slice(0, 5)}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{t.required_nurses}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => startEdit(t)}
                                                    className="rounded-lg border border-gray-200 dark:border-gray-600 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => { if (confirm('Delete this shift template?')) router.delete(route('admin.shift-templates.destroy', t.id)); }}
                                                    className="rounded-lg border border-red-200 dark:border-red-900/50 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {templates.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-14 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No shift templates yet. Create your first one — e.g. Morning (07:00–15:00), Mid (14:00–22:00), Night (22:00–07:00).
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}