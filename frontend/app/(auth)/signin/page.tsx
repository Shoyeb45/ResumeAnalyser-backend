'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CircleAlert, Eye, EyeOff } from 'lucide-react';
import GoogleLogin from '@/components/auth/GoogleAuthButton';

/**
 * Sign In Page Component
 * Handles user authentication with both email/password and Google OAuth
 * Includes form validation, error handling, and secure credential management
 */
const SigninPage = () => {
    const router = useRouter();

    // State management for form data and UI states
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState(''); // Error message from sign-in process
    const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
    const [loading, setLoading] = useState(false); // Loading state during authentication

    /**
     * Handle input changes for form fields
     * Updates form state and clears previous error messages
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Clear errors when user starts typing to improve UX
        if (error) setError('');
    };

    /**
     * Handle sign-in process using credentials authentication
     * Validates form data, makes API call, and handles response
     */
    const handleSignIn = async () => {
        setError('');
        setLoading(true);

        // Client-side validation to ensure all fields are filled
        if (!form.email || !form.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            // Make API call to login endpoint with credentials
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
                email: form.email,
                password: form.password,
            }, {
                withCredentials: true, // Include cookies for session management
            });

            // Redirect to dashboard on successful authentication
            router.push('/dashboard');

        } catch (error) {
            // Handle authentication errors with user-friendly messages
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message)
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            // Always reset loading state
            setLoading(false);
        }
    };

    return (
        <div className='h-screen w-full flex items-center'>
            <div className='h-full w-full px-6 flex flex-col justify-center text-zinc-800 gap-4 max-w-md mx-auto'>

                {/* Page header with title and signup link */}
                <div className='flex flex-col gap-2 pb-3'>
                    <h1 className='font-bold text-3xl'>
                        Login to your account
                    </h1>
                    <p className='text-sm flex gap-1'>
                        Don&apos;t have an account?
                        {/* Navigation link to signup page */}
                        <a
                            className='text-blue-500 cursor-pointer hover:text-blue-700 underline'
                            onClick={() => router.push('signup')}
                        >
                            Sign Up
                        </a>
                    </p>
                </div>

                {/* Google OAuth sign-in option */}
                <div className="w-full max-w-md">
                    <GoogleLogin
                        onSuccess={() => router.push('/dashboard')}
                        className='w-full'
                        theme="filled_blue"
                        size="large"
                        onError={(error) => setError(error)}
                    />
                </div>

                {/* Visual divider between OAuth and credential login */}
                <div className='flex gap-2 items-center'>
                    <div className='h-[0.5px] w-full bg-zinc-600' />
                    OR
                    <div className='h-[0.5px] w-full bg-zinc-600' />
                </div>

                {/* Email & Password credential form */}
                <div className="flex justify-center items-center">
                    <div className="w-full">
                        {/* Email input field */}
                        <h3 className="font-semibold text-base mb-1 text-left">
                            Email
                        </h3>
                        <input
                            className="w-full p-2 border border-zinc-300 rounded-md text-base focus:outline-none focus:border-zinc-500 mb-4"
                            name='email'
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />

                        {/* Password field with forgot password link */}
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-base text-left">Password</h3>
                            {/* Forgot password link for password recovery */}
                            <button
                                type="button"
                                onClick={() => router.push('/forgot-password')}
                                className="text-sm text-blue-500 hover:text-blue-700 underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Password input with visibility toggle */}
                        <div className="relative">
                            <input
                                className="w-full p-2 pr-10 border border-zinc-300 rounded-md text-base focus:outline-none focus:border-zinc-500 mb-2"
                                name='password'
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                            {/* Password visibility toggle button */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Error message display */}
                        {error && (
                            <div className='flex items-center gap-1 text-red-500 text-sm transition-colors py-2 pb-3'>
                                <CircleAlert size={16} className='flex items-center' />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Sign-in submit button with conditional styling */}
                        <button
                            type="button"
                            onClick={handleSignIn}
                            disabled={!form.password || !form.email || loading}
                            className={`w-full px-4 py-2 mt-2 rounded-md cursor-pointer transition-colors ${form.password && form.email
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                                }`}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SigninPage;