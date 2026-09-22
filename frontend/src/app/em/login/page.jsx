'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmLoginPage() {
    const router = useRouter();

    const [loginType, setLoginType] = useState('employee');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError('');

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API || '';

            const res = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    loginType,
                }),
            });

            const data = await res.json();

            if (!data.status) {
                setError(data.msg || 'Login failed');
                return;
            }
            if (data.token) {
                localStorage.setItem('gstar_token', data.token);
            }

            if (data.role) {
                localStorage.setItem('gstar_role', data.role);
            }
            router.push('/ecom/belk-brand-scrapping');
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = () => {
        router.push('/signup');
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#0d0d17] px-4">
            <div className="w-full max-w-sm rounded-2xl border border-indigo-500/30 bg-[#12121f] p-8 shadow-[0_0_40px_-10px_rgba(99,102,241,0.35)]">

                <h1 className="text-2xl font-semibold text-white text-center mb-1">
                    E-commerce Management
                </h1>

                <p className="text-xs text-gray-500 text-center mb-6">
                    Gstar Tool
                </p>

                {/* Employee / Admin */}
                <div className="flex rounded-full bg-[#1c1c2e] p-1 mb-6">
                    {['employee', 'admin'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => {
                                setLoginType(type);
                                setError('');
                            }}
                            className={`flex-1 py-1.5 text-sm rounded-full capitalize transition ${
                                loginType === type
                                    ? 'bg-white text-[#12121f] font-medium'
                                    : 'text-gray-400'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    {/* Email */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">
                            Email
                        </label>

                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter email"
                            className="w-full rounded-lg bg-[#1c1c2e] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">
                            Password
                        </label>

                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter password"
                            className="w-full rounded-lg bg-[#1c1c2e] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Login */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 transition"
                    >
                        {loading
                            ? 'Please wait…'
                            : `Login as ${
                                  loginType === 'admin'
                                      ? 'Admin'
                                      : 'Employee'
                              }`}
                    </button>
                </form>

                {/* Signup */}
                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={handleSignup}
                        className="text-sm text-blue-400 hover:text-blue-300 transition"
                    >
                        Create New Account
                    </button>
                </div>

                {/* Forgot Password */}
                <div className="text-center">
                    <button
                        type="button"
                        className="text-sm text-gray-500 hover:text-gray-400 transition"
                    >
                        Forgot Password
                    </button>
                </div>

            </div>
        </main>
    );
}