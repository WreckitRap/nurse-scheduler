import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import PrimaryButton from '@/components/PrimaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';

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

export default function Index({ nurses }: { nurses: Nurse[] }) {
    const flash = (usePage().props as any).flash;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Nurse Staff</h2>}
        >
            <Head title="Nurse Staff" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-green-600">{flash?.success ?? ''}</p>
                        <Link href={route('admin.nurses.create')}>
                            <PrimaryButton>+ Add Nurse Staff</PrimaryButton>
                        </Link>
                    </div>

                    <div className="overflow-x-auto bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left dark:bg-gray-700">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Employee #</th>
                                    <th className="p-3">Unit</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Max Hrs/Wk</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {nurses.map((n) => (
                                    <tr key={n.id}>
                                        <td className="p-3">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{n.name}</div>
                                            <div className="text-xs text-gray-500">{n.email}</div>
                                        </td>
                                        <td className="p-3 text-gray-700 dark:text-gray-300">{n.nurse_profile?.employee_no ?? '—'}</td>
                                        <td className="p-3 text-gray-700 dark:text-gray-300">{n.nurse_profile?.unit?.name ?? '—'}</td>
                                        <td className="p-3 text-gray-700 dark:text-gray-300">{n.nurse_profile?.employment_type}</td>
                                        <td className="p-3 text-gray-700 dark:text-gray-300">{n.nurse_profile?.max_weekly_hours}</td>
                                        <td className="p-3">
                                            {n.nurse_profile?.is_active ? (
                                                <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Active</span>
                                            ) : (
                                                <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Inactive</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            <Link className="text-indigo-600 underline dark:text-indigo-400" href={route('admin.nurses.edit', n.id)}>
                                                Edit
                                            </Link>
                                            <button
                                                className="ml-3 text-gray-500 underline"
                                                onClick={() => router.patch(route('admin.nurses.toggle', n.id))}
                                            >
                                                {n.nurse_profile?.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {nurses.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-6 text-center text-gray-500">
                                            No nurse staff yet. Create the first one.
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