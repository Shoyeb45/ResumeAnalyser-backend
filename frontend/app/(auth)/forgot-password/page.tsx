'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import axios from 'axios';

/**
 * Forgot Password Page Component
 * Handles password reset functionality by sending reset links to user's email
 * Includes form validation, loading states, and error handling
 */
const ForgotPasswordPage = () => {
    const router = useRouter();

    // State management for form data and UI states
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handle forgot password form submission
     * Sends API request to backend to initiate password reset process
     */
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Reset previous messages and set loading state
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // Make API call to forgot password endpoint
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`, {
                email,
            });
            
            // Handle successful response
            if (response.status === 200) {
                setSuccess('Password reset link sent to your email.');
                setEmail(''); // Clear email input on success
            }
        } catch (error) {
            // Handle API errors with appropriate user feedback
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message);
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            // Always reset loading state
            setIsLoading(false);
        }
    };

    /**
     * Handle resend functionality for password reset email
     * Reuses the main forgot password handler if email is present
     */
    const handleResend = () => {
        if (email) {
            // Create a mock event to reuse the main handler
            handleForgotPassword({ preventDefault: () => { } } as React.FormEvent);
        }
    };

    return (
        <div className='h-screen w-full flex items-center'>
            <div className='h-full w-full px-4 flex flex-col justify-center text-zinc-800 gap-4 max-w-md mx-auto'>

                {/* Navigation: Back to login button */}
                <button
                    onClick={() => router.push('/signin')}
                    className='flex items-center gap-2 text-sm cursor-pointer text-blue-500 hover:text-blue-700 bg-zinc-100 hover:bg-zinc-200 p-2 rounded w-fit'
                >
                    <ArrowLeft size={16} />
                    Back to login
                </button>

                {/* Page header with title and description */}
                <div className='flex flex-col gap-2 pb-1'>
                    <h1 className='font-bold text-3xl'>Reset your password</h1>
                    <p className='text-sm text-zinc-600'>
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                {/* Main forgot password form */}
                <form onSubmit={handleForgotPassword} className="w-full">
                    <h3 className="font-semibold text-base mb-1 text-left">
                        Email Address
                    </h3>
                    
                    {/* Email input with icon */}
                    <div className="relative">
                        <input
                            className="w-full p-2 pl-10 border border-zinc-300 rounded-md text-base focus:outline-none focus:border-zinc-500 mb-4"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                // Clear previous messages when user starts typing
                                if (error) setError('');
                                if (success) setSuccess('');
                            }}
                            placeholder="Enter your email address"
                            required
                        />
                        {/* Mail icon positioned inside input */}
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    </div>

                    {/* Error message display */}
                    {error && (
                        <div className='flex items-center gap-2 text-red-500 text-sm mb-4'>
                            <CircleAlert size={16} className='flex items-center' />
                            <p>{error}</p>
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
                        disabled={isLoading || !email}
                        className={`w-full px-4 py-3 rounded-md cursor-pointer transition-colors ${!isLoading && email
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                {/* Help text with resend option */}
                <div className="flex text-center text-sm text-zinc-600 mt-1 gap-2">
                    <p>Didn&apos;t receive the email? Check your spam folder or</p>
                    <button
                        onClick={handleResend}
                        className="text-blue-500 hover:text-blue-700 underline"
                        disabled={isLoading || !email}
                    >
                        try again
                    </button>
                </div>

                {/* Alternative action: Return to signin */}
                <div className="text-center text-sm text-zinc-600">
                    <p>
                        Remember your password?{' '}
                        <button
                            onClick={() => router.push('/signin')}
                            className="text-blue-500 hover:text-blue-700 underline"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;