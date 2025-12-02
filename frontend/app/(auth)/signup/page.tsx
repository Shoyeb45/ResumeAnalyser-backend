'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert, Check, X, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import GoogleLogin from '@/components/auth/GoogleAuthButton';

/**
 * Sign Up Page Component
 * Handles user registration with both email/password and Google OAuth
 * Includes comprehensive form validation, password strength checking, and error handling
 */
const SignupPage = () => {
    // Using Next.js router for navigation
    const router = useRouter();

    // State management for form data and UI states
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(''); // Error message from the signup process
    const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
    const [loading, setLoading] = useState(false); // Loading state during signup

    /**
     * Password strength validation function
     * Evaluates password against multiple security criteria
     * Returns validation results and strength score
     */
    const validatePasswordStrength = (password: string) => {
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        };

        const score = Object.values(requirements).filter(Boolean).length;

        return {
            requirements,
            score,
            isStrong: score >= 4 && requirements.minLength
        };
    };

    // Get password strength info for current password input
    const passwordStrength = validatePasswordStrength(form.password);

    /**
     * Get strength label and color based on password score
     * Returns appropriate styling and text for password strength indicator
     */
    const getStrengthInfo = (score: number): { label: string; color: string } => {
        if (score === 0) return { label: '', color: '' };
        if (score <= 2) return { label: 'Weak', color: 'text-red-500' };
        if (score <= 3) return { label: 'Fair', color: 'text-yellow-500' };
        if (score <= 4) return { label: 'Good', color: 'text-blue-500' };
        return { label: 'Strong', color: 'text-green-500' };
    };

    const strengthInfo = getStrengthInfo(passwordStrength.score);

    /**
     * Handle input changes for form fields
     * Updates form state and clears previous error messages for better UX
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Clear error when user starts typing to improve user experience
        if (error) setError('');
    };

    /**
     * Handle sign-up process using credentials authentication
     * Validates all form data, checks password strength, and makes API call
     */
    const handleSignUp = async () => {
        setError('');
        setLoading(true);

        // Client-side validation for email format
        if (!form.email || !form.email.includes('@')) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        // Validate password strength before proceeding
        if (!passwordStrength.isStrong) {
            setError('Please create a stronger password that meets all requirements');
            setLoading(false);
            return;
        }

        // Check if name is provided and not empty
        if (!form.name || form.name.trim() === '') {
            setError('Please enter your name');
            setLoading(false);
            return;
        }

        try {
            // Make API call to signup endpoint with user credentials
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`, {
                name: form.name,
                email: form.email,
                password: form.password,
            }, {
                withCredentials: true, // Include cookies for session management
            });

            // Navigate to OTP verification page with email parameter on successful signup
            router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);

        } catch (error) {
            // Handle signup errors with user-friendly messages
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

                {/* Page header with title and login link */}
                <div className='flex flex-col gap-2 pb-3'>
                    <h1 className='font-bold text-3xl'>Create your account</h1>
                    <p className='text-sm flex gap-1'>
                        Already have an account?
                        {/* Navigation link to login page */}
                        <a className='text-blue-500 cursor-pointer hover:text-blue-700 underline' onClick={() => router.push('signin')}>Log in</a>
                    </p>
                </div>

                {/* Google OAuth sign-up option */}
                <div className="w-full max-w-md">
                    <GoogleLogin
                        onSuccess={() => router.push('/dashboard')}
                        className='w-full'
                        theme="filled_blue"
                        size="large"
                        onError={(error) => setError(error)}
                    />
                </div>

                {/* Visual divider between OAuth and credential signup */}
                <div className='flex gap-2 items-center'>
                    <div className='h-[0.5px] w-full bg-zinc-600' />OR
                    <div className='h-[0.5px] w-full bg-zinc-600' />
                </div>

                {/* Email & Password credential form */}
                <div className="w-full">
                    {/* Name input field */}
                    <h3 className="font-semibold text-base mb-1 text-left">
                        Name
                    </h3>
                    <input
                        className="w-full p-2 border border-zinc-300 rounded-md text-base focus:outline-none focus:border-zinc-500 mb-4"
                        name='name'
                        type="text"
                        placeholder='Enter your name'
                        value={form.name || ''}
                        onChange={handleChange}
                        required
                    />

                    {/* Email input field */}
                    <h3 className="font-semibold text-base mb-1 text-left">
                        Email
                    </h3>
                    <input
                        className="w-full p-2 border border-zinc-300 rounded-md text-base focus:outline-none focus:border-zinc-500 mb-4"
                        name='email'
                        type="email"
                        placeholder='Enter your email'
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    {/* Password input field with visibility toggle */}
                    <h3 className="font-semibold text-base mb-1 text-left">Password</h3>
                    <div className="relative">
                        <input
                            className="w-full p-2 pr-10 border border-zinc-300 rounded-md text-base focus:outline-none focus:border-zinc-500 mb-2"
                            name='password'
                            type={showPassword ? "text" : "password"}
                            placeholder='Enter your password'
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        {/* Password visibility toggle button */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-700"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Password strength indicator - only shown when password is entered */}
                    {form.password && (
                        <div className="mb-4">
                            {/* Visual strength bar with 5 segments */}
                            <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-2 flex-1 rounded ${level <= passwordStrength.score
                                            ? passwordStrength.score <= 2
                                                ? 'bg-red-500' // Weak passwords - red
                                                : passwordStrength.score <= 3
                                                    ? 'bg-yellow-500' // Fair passwords - yellow
                                                    : passwordStrength.score <= 4
                                                        ? 'bg-blue-500' // Good passwords - blue
                                                        : 'bg-green-500' // Strong passwords - green
                                            : 'bg-zinc-200' // Inactive segments - gray
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Strength label with appropriate color */}
                            {strengthInfo.label && (
                                <p className={`text-sm font-medium ${strengthInfo.color} mb-2`}>
                                    Password strength: {strengthInfo.label}
                                </p>
                            )}

                            {/* Detailed requirements checklist with visual indicators */}
                            <div className="text-xs space-y-1">
                                <div className={`flex items-center gap-2 ${passwordStrength.requirements.minLength ? 'text-green-600' : 'text-zinc-500'}`}>
                                    {passwordStrength.requirements.minLength ? <Check size={14} /> : <X size={14} />}
                                    At least 8 characters
                                </div>
                                <div className={`flex items-center gap-2 ${passwordStrength.requirements.hasUppercase ? 'text-green-600' : 'text-zinc-500'}`}>
                                    {passwordStrength.requirements.hasUppercase ? <Check size={14} /> : <X size={14} />}
                                    One uppercase letter
                                </div>
                                <div className={`flex items-center gap-2 ${passwordStrength.requirements.hasLowercase ? 'text-green-600' : 'text-zinc-500'}`}>
                                    {passwordStrength.requirements.hasLowercase ? <Check size={14} /> : <X size={14} />}
                                    One lowercase letter
                                </div>
                                <div className={`flex items-center gap-2 ${passwordStrength.requirements.hasNumber ? 'text-green-600' : 'text-zinc-500'}`}>
                                    {passwordStrength.requirements.hasNumber ? <Check size={14} /> : <X size={14} />}
                                    One number
                                </div>
                                <div className={`flex items-center gap-2 ${passwordStrength.requirements.hasSpecialChar ? 'text-green-600' : 'text-zinc-500'}`}>
                                    {passwordStrength.requirements.hasSpecialChar ? <Check size={14} /> : <X size={14} />}
                                    One special character
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error message display with alert icon */}
                    {error && (
                        <div className='flex items-center gap-1 text-red-500 text-sm transition-colors py-2 pb-3'>
                            <CircleAlert size={16} className='flex items-center' />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Submit button with conditional styling and validation */}
                    <button
                        type="submit"
                        disabled={!passwordStrength.isStrong || !form.email || loading}
                        onClick={handleSignUp}
                        className={`w-full px-4 py-2 mt-3 rounded-md cursor-pointer transition-colors ${passwordStrength.isStrong && form.email
                            ? 'bg-blue-600 text-white hover:bg-blue-700' // Enabled state
                            : 'bg-zinc-300 text-zinc-500 cursor-not-allowed' // Disabled state
                            }`}
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;