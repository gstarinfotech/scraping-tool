'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OM_API } from '@/utils/om';

export default function AdminSignupPage() {
    const router = useRouter();

    const [formdata, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        password: '',
        img: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [enteredOtp, setEnteredOtp] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }));

        if (name === 'email') {
            setIsVerified(false);
            setOtpSent(false);
            setEnteredOtp('');
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formdata.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formdata.mobile.trim()) {
            newErrors.mobile = 'Mobile is required';
        }

        if (!formdata.email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (!formdata.password.trim()) {
            newErrors.password = 'Password is required';
        }

        return newErrors;
    };

    const sendOtp = async () => {
        if (!formdata.email.trim()) {
            alert('Please Enter Email');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${OM_API}/admin/sendotp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formdata.email,
                }),
            });

            const data = await response.json();

            if (data.status) {
                setOtpSent(true);
                setIsVerified(false);
                setEnteredOtp('');
                alert('OTP sent successfully');
            } else {
                alert(data.msg || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            alert('Something went wrong while sending OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!enteredOtp.trim()) {
            alert('Please Enter OTP');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${OM_API}/admin/verifyotp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formdata.email,
                    otp: enteredOtp,
                }),
            });

            const data = await response.json();

            if (data.status) {
                setIsVerified(true);
                alert('OTP verified successfully');
            } else {
                setIsVerified(false);
                alert(data.msg || 'Incorrect OTP');
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            alert('Something went wrong while verifying OTP');
        } finally {
            setLoading(false);
        }
    };

    const uploadProfilePic = async (file) => {
        if (!file) {
            alert('Please select file first');
            return;
        }

        setLoading(true);

        try {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const baseUrl = process.env.NEXT_PUBLIC_API || '';

            const response = await fetch(
                `${baseUrl}/upload/uploadprofilepic`,
                {
                    method: 'POST',
                    body: uploadData,
                }
            );

            const data = await response.json();

            if (data.status) {
                setFormData((prev) => ({
                    ...prev,
                    img: data.img,
                }));

                alert('Profile picture uploaded successfully');
            } else {
                alert('Error while uploading image');
                console.error(data.msg);
            }
        } catch (error) {
            console.error('Upload image error:', error);
            alert('Something went wrong while uploading image');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (!isVerified) {
            alert('Please verify your email OTP first');
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const response = await fetch(`${OM_API}/admin/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formdata,
                }),
            });

            const data = await response.json();

            if (data.status) {
                alert('Signed up successfully!');
                router.push('/om/login');
            } else {
                alert(data.msg || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Something went wrong while signing up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0d0d17] px-4 py-10 text-white">
            <div className="mx-auto w-full max-w-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-semibold">
                        Admin Signup
                    </h1>

                    <p className="mt-2 text-sm text-gray-400">
                        Create your Order Management admin account
                    </p>
                </div>

                <div className="rounded-2xl border border-indigo-500/20 bg-[#12121f] p-6 shadow-[0_0_40px_-15px_rgba(99,102,241,0.35)] md:p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-5"
                    >
                        <div>
                            <label className="mb-1 block text-sm text-gray-300">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formdata.name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                className="w-full rounded-lg border border-white/10 bg-[#1c1c2e] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                            />

                            {errors.name && (
                                <p className="mt-1 text-xs text-red-400">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-gray-300">
                                Mobile Number
                            </label>

                            <input
                                type="tel"
                                name="mobile"
                                value={formdata.mobile}
                                onChange={handleChange}
                                placeholder="Enter mobile number"
                                className="w-full rounded-lg border border-white/10 bg-[#1c1c2e] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                            />

                            {errors.mobile && (
                                <p className="mt-1 text-xs text-red-400">
                                    {errors.mobile}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-gray-300">
                                Email Address
                            </label>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <input
                                    type="email"
                                    name="email"
                                    value={formdata.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                    className="flex-1 rounded-lg border border-white/10 bg-[#1c1c2e] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                                />

                                <button
                                    type="button"
                                    onClick={sendOtp}
                                    disabled={loading}
                                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Get OTP
                                </button>
                            </div>

                            {errors.email && (
                                <p className="mt-1 text-xs text-red-400">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {otpSent && (
                            <div>
                                <label className="mb-1 block text-sm text-gray-300">
                                    Enter OTP
                                </label>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <input
                                        type="text"
                                        value={enteredOtp}
                                        onChange={(e) =>
                                            setEnteredOtp(e.target.value)
                                        }
                                        placeholder="Enter OTP"
                                        className="flex-1 rounded-lg border border-white/10 bg-[#1c1c2e] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                                    />

                                    <button
                                        type="button"
                                        onClick={verifyOtp}
                                        disabled={loading || isVerified}
                                        className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isVerified ? 'Verified' : 'Verify'}
                                    </button>
                                </div>

                                {!isVerified && (
                                    <p className="mt-2 text-xs text-yellow-400">
                                        OTP sent successfully. Please enter it above.
                                    </p>
                                )}

                                {isVerified && (
                                    <p className="mt-2 text-xs text-green-400">
                                        ✓ OTP verified
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm text-gray-300">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formdata.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                className="w-full rounded-lg border border-white/10 bg-[#1c1c2e] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                            />

                            {errors.password && (
                                <p className="mt-1 text-xs text-red-400">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-gray-300">
                                Profile Picture
                            </label>

                            <input
                                type="file"
                                accept=".jpg,.png,.jpeg"
                                onChange={(e) =>
                                    uploadProfilePic(
                                        e.target.files?.[0]
                                    )
                                }
                                className="block w-full rounded-lg border border-white/10 bg-[#1c1c2e] px-3 py-2 text-sm text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-indigo-700"
                            />

                            {formdata.img && (
                                <p className="mt-2 text-xs text-green-400">
                                    ✓ Profile picture uploaded
                                </p>
                            )}
                        </div>

                        {isVerified && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? 'Please Wait...'
                                    : 'Sign Up'}
                            </button>
                        )}
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Already registered?{' '}
                        <Link
                            href="/om/login"
                            className="text-blue-400 hover:text-blue-300"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}