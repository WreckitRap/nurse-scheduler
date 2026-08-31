import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Unit { id: number; name: string }

interface Nurse {
    id: number;
    name: string;
    email: string;
    role: string;
    nurse_profile: {
        employee_no: string;
        unit_id: number | null;
        specialization: string | null;
        employment_type: string;
        max_weekly_hours: number;
    } | null;
}

const input = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
const label = 'mb-1 block text-sm font-medium text-gray-700';
const err = 'mt-1 text-xs text-red-600';

export default function Edit({ nurse, units }: { nurse: Nurse; units: Unit[] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: nurse.name,
        email: nurse.email,
        password: '',
        role: nurse.role,
        employee_no: nurse.nurse_profile?.employee_no ?? '',
        unit_id: nurse.nurse_profile?.unit_id ? String(nurse.nurse_profile.unit_id) : '',
        specialization: nurse.nurse_profile?.specialization ?? '',
        employment_type: nurse.nurse_profile?.employment_type ?? 'full_time',
        max_weekly_hours: String(nurse.nurse_profile?.max_weekly_hours ?? 40),
    });

    const submit = (e: any) => {
        e.preventDefault();
        put(route('admin.nurses.update', nurse.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Edit Nurse Staff</h1>
                    <p className="text-sm text-gray-500">Update {nurse.name}'s account and profile.</p>
                </div>
            }
        >
            <Head title="Edit Nurse Staff" />

            <div className="flex flex-1 flex-col">
                <Link href={route('admin.nurses.index')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-4 w-4" /> Back to list
                </Link>

                <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4 text-sm font-semibold text-gray-900">Account</div>
                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                        <div>
                            <label className={label}>Full Name</label>
                            <input className={input} value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            {errors.name && <p className={err}>{errors.name}</p>}
                        </div>
                        <div>
                            <label className={label}>Email</label>
                            <input type="email" className={input} value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                            {errors.email && <p className={err}>{errors.email}</p>}
                        </div>
                        <div>
                            <label className={label}>New Password</label>
                            <input type="password" className={input} value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Leave blank to keep current" />
                            {errors.password && <p className={err}>{errors.password}</p>}
                        </div>
                        <div>
                            <label className={label}>Role</label>
                            <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nurse_staff">Nurse Staff</SelectItem>
                                    <SelectItem value="nurse_admin">Nurse Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="border-y border-gray-100 bg-gray-50/50 px-5 py-4 text-sm font-semibold text-gray-900">Professional Profile</div>
                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                        <div>
                            <label className={label}>Employee #</label>
                            <input className={input} value={data.employee_no} onChange={(e) => setData('employee_no', e.target.value)} required />
                            {errors.employee_no && <p className={err}>{errors.employee_no}</p>}
                        </div>
                        <div>
                            <label className={label}>Unit</label>
                            <Select value={data.unit_id || undefined} onValueChange={(v) => setData('unit_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                                <SelectContent>
                                    {units.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.unit_id && <p className={err}>{errors.unit_id}</p>}
                        </div>
                        <div>
                            <label className={label}>Specialization</label>
                            <input className={input} value={data.specialization} onChange={(e) => setData('specialization', e.target.value)} />
                        </div>
                        <div>
                            <label className={label}>Employment Type</label>
                            <Select value={data.employment_type} onValueChange={(v) => setData('employment_type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full_time">Full-Time</SelectItem>
                                    <SelectItem value="part_time">Part-Time</SelectItem>
                                    <SelectItem value="per_diem">Per-Diem</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className={label}>Max Weekly Hours</label>
                            <input type="number" min={1} max={80} className={input} value={data.max_weekly_hours} onChange={(e) => setData('max_weekly_hours', e.target.value)} required />
                            {errors.max_weekly_hours && <p className={err}>{errors.max_weekly_hours}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                        <Link href={route('admin.nurses.index')} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                            <Save className="h-4 w-4" /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}