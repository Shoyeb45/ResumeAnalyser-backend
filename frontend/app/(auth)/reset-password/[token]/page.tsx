'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { CircleAlert, Eye, EyeOff, CheckCircle } from 'lucide-react';

/**
 * Reset Password Page Component
 * Handles password reset functionality using a token from URL parameters
 * Includes password validation, token verification, and secure form handling
 */
const ResetPasswordPage = () => {
    const router = useRouter();
    const params = useParams();
    const token = params?.token as string;

    // State management for form data and UI states
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    // Password visibility toggle states for better UX
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /**
     * Validate reset token on component mount
     * Checks if token exists in URL parameters
     */
    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
            setTokenValid(false);
        } else {
            // Token exists, set as valid initially
            // Actual validation will happen when user submits the form
            setTokenValid(true);
        }
    }, [token]);

    /**
     * Handle input changes for password fields
     * Updates state and clears previous messages
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear previous messages when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    /**
     * Validate password strength according to security requirements
     * Returns error message if validation fails, null if valid
     */
    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(password)) {
            return 'Password must contain at least one number';
        }
        return null;
    };

    /**
     * Handle password reset form submission
     * Validates inputs, makes API call, and handles response
     */
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        // Client-side validation before API call
        if (!passwords.password || !passwords.confirmPassword) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (passwords.password !== passwords.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        const passwordError = validatePassword(passwords.password);
        if (passwordError) {
            setError(passwordError);
            setIsLoading(false);
            return;
        }

        try {
            // Make API call to reset password endpoint with token
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password/${token}`, {
                password: passwords.password
            });

            // Handle successful password reset
            if (response.data.success) {
                setSuccess(response.data.message || 'Password has been reset successfully! Redirecting to login...');
                setPasswords({ password: '', confirmPassword: '' });

                // Auto-redirect to signin after 3 seconds
                setTimeout(() => {
                    router.push('/signin');
                }, 3000);
            }

        } catch (error) {
            // Handle API errors with appropriate user feedback
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response?.data?.message || error.response?.data?.error);
                // Mark token as invalid for 400/404 errors
                if (error.response?.status === 400 || error.response?.status === 404) {
                    setTokenValid(false);
                }
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state while token validation is in progress
    if (tokenValid === null) {
        return (
            <div className='h-screen w-full flex items-center justify-center'>
                <div className='text-center'>
                    <p className='text-zinc-600'>Loading...</p>
                </div>
            </div>
        );
    }

    // Error state for invalid or expired tokens
    if (tokenValid === false) {
        return (
            <div className='h-screen w-full flex items-center'>
                <div className='h-full w-full px-6 flex flex-col justify-center text-zinc-800 gap-4 max-w-md mx-auto text-center'>
                    <div className='flex flex-col gap-4 items-center'>
                        {/* Error icon */}
                        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
                            <CircleAlert size={32} className='text-red-500' />
                        </div>
                        <h1 className='font-bold text-2xl'>Invalid Reset Link</h1>
                        <p className='text-sm text-zinc-600 mb-4'>
                            {error || 'This password reset link is invalid or has expired.'}
                        </p>
                        
                        {/* Recovery options */}
                        <div className='flex flex-col gap-2 w-full'>
                            <button
                                onClick={() => router.push('/forgot-password')}
                                className='w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                            >
                                Request New Reset Link
                            </button>
                            <button
                                onClick={() => router.push('/signin')}
                                className='w-full px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 transition-colors'
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main reset password form for valid tokens
    return (
        <div className='h-screen w-full flex items-center'>
            <div className='h-full w-full px-6 flex flex-col justify-center text-zinc-800 gap-4 max-w-md mx-auto'>

                {/* Page header with icon and description */}
                <div className='flex flex-col gap-2 pb-3'>
                    <h1 className='font-bold text-3xl'>Set New Password</h1>
                    <p className='text-sm text-zinc-600'>
                        Please enter your new password below. Make sure it&apos;s strong and secure.
                    </p>
                </div>

                {/* Password reset form */}
                <form onSubmit={handleResetPassword} className="w-full">

                    {/* New Password Field with visibility toggle */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-base mb-1 text-left">
                            New Password
                        </h3>
                        <div className="relative">
                            <input
                                className="w-full p-2 pr-10 border border-zinc-300 rounded-md text-base focus:outline-none focus:border-zinc-500"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={passwords.password}
                                onChange={handleChange}
                                placeholder="Enter your new password"
                                required
                                disabled={isLoading}
                            />
                            {/* Password visibility toggle button */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 transition-colors"
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field with visibility toggle */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-base mb-1 text-left">
                            Confirm New Password
                        </h3>
                        <div className="relative">
                            <input
                                className="w-full p-2 pr-10 border border-zinc-300 rounded-md text-base focus:outline-none focus:border-zinc-500"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your new password"
                                required
                                disabled={isLoading}
                            />
                            {/* Confirm password visibility toggle button */}
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 transition-colors"
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Password requirements guide for user reference */}
                    <div className="mb-4 text-xs text-zinc-600">
                        <p className="mb-1">Password must contain:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>At least 8 characters</li>
                            <li>One uppercase letter</li>
                            <li>One lowercase letter</li>
                            <li>One number</li>
                        </ul>
                    </div>

                    {/* Error message display */}
                    {error && (
                        <div className='flex items-center gap-2 text-red-500 text-sm mb-4'>
                            <CircleAlert size={16} />
                            {error}
                        </div>
                    )}

                    {/* Success message display */}
                    {success && (
                        <div className='flex items-center gap-2 text-green-500 text-sm mb-4'>
                            <CheckCircle size={16} />
                            {success}
                        </div>
                    )}

                    {/* Submit button with conditional styling and disabled state */}
                    <button
                        type="submit"
                        disabled={isLoading || !passwords.password || !passwords.confirmPassword}
                        className={`w-full px-4 py-2 rounded-md cursor-pointer transition-colors ${!isLoading && passwords.password && passwords.confirmPassword
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>

                {/* Alternative action: Back to login */}
                <div className="text-center text-sm text-zinc-600 mt-4">
                    <p>
                        Remember your password?{' '}
                        <button
                            onClick={() => router.push('/signin')}
                            className="text-blue-500 hover:text-blue-700 underline"
                            disabled={isLoading}
                        >
                            Back to Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;