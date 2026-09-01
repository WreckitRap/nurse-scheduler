import Logo from '@/Components/Logo';
import { Head, useForm } from '@inertiajs/react';
import { Lock, Mail } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    const input =
        'w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Head title="Log in — Nurse Scheduler" />

            {/* Brand panel */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex">
                <style>{`@keyframes ecg { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: -1200; } }`}</style>

                {/* Animated ECG line */}
                <svg
                    className="pointer-events-none absolute left-0 top-1/2 w-full -translate-y-1/2 opacity-20"
                    viewBox="0 0 600 200"
                    fill="none"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 100 H90 L105 100 L115 70 L125 130 L135 100 H240 L255 100 L265 60 L275 140 L285 100 H420 L435 100 L445 75 L455 125 L465 100 H600"
                        stroke="white"
                        strokeWidth="2"
                        style={{ strokeDasharray: 1200, animation: 'ecg 7s linear infinite' }}
                    />
                </svg>

                <div className="relative flex items-center gap-3">
                    <Logo className="h-10 w-10 drop-shadow" />
                    <div>
                        <div className="text-lg font-bold">Nurse Scheduler</div>
                        <div className="text-sm text-indigo-200">Hospital Scheduling</div>
                    </div>
                </div>

                <div className="relative">
                    <h1 className="text-4xl font-bold leading-tight">
                        Every shift.
                        <br />
                        Every nurse.
                        <br />
                        Perfectly placed.
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-6 text-indigo-200">
                        Build fair, conflict-free weekly rosters in minutes — coverage gaps, duty rules and time-off handled automatically.
                    </p>
                </div>

                <div className="relative text-xs text-indigo-300">© 2026 Nurse Scheduler · Built for nursing teams</div>
            </div>

            {/* Form panel */}
            <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile brand */}
                    <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                        <Logo className="h-10 w-10 drop-shadow" />
                        <div>
                            <div className="text-lg font-bold text-gray-900">Nurse Scheduler</div>
                            <div className="text-sm text-gray-500">Hospital Scheduling</div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900">Welcome back 👋</h2>
                        <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue.</p>

                        {status && <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{status}</div>}

                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        className={input}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="you@hospital.test"
                                        autoFocus
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        className={input}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 accent-indigo-600"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    Remember me
                                </label>
                                {canResetPassword && (
                                    <a href={route('password.request')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                        Forgot password?
                                    </a>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Log In
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">Accounts are created by your Nurse Admin.</p>
                </div>
            </div>
        </div>
    );
}