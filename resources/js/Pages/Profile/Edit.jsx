import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Moon, Sun, User, KeyRound, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Edit({ mustVerifyEmail, status }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile, security, and app preferences.</p>
                </div>
            }
        >
            <Head title="Settings" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Appearance Card */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Appearance
                    </div>
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isDark ? (
                                    <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/40 p-2">
                                        <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-amber-50 p-2">
                                        <Sun className="h-4 w-4 text-amber-600" />
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Night Mode</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                    isDark ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        isDark ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile Information
                    </div>
                    <div className="p-5">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Update Password
                    </div>
                    <div className="p-5">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                </div>

                {/* Delete Account */}
                <div className="overflow-hidden rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="border-b border-red-100 dark:border-red-900/50 px-5 py-4 text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                    </div>
                    <div className="p-5">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}