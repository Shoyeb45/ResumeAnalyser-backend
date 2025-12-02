'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert, Check } from 'lucide-react';
import axios from 'axios';

interface OTPVerificationProps {
    email: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ email }) => {
    // Using Next.js router for navigation
    const router = useRouter();

    // State to hold the 6-digit OTP code
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));

    // State to hold any error messages from the verification process
    const [error, setError] = useState<string>('');

    // State to show success message
    const [success, setSuccess] = useState<boolean>(false);

    // State for loading during API call
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // State for resend cooldown timer
    const [resendTimer, setResendTimer] = useState<number>(0);

    // Refs for OTP input fields to handle focus management
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Effect to handle resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Function to handle OTP input changes
    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        const value = element.value;

        // Only allow single digit
        if (value.length > 1) return;

        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        // Update OTP array
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Clear error when user starts typing
        if (error) setError('');

        // Move to next input if current field is filled
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Function to handle backspace and move to previous input
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                // If current field is empty, move to previous field and clear it
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            } else if (otp[index]) {
                // If current field has value, just clear it
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    // Function to handle paste event for OTP
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits

        if (pastedData.length >= 6) {
            const newOtp = pastedData.slice(0, 6).split('');
            setOtp(newOtp);

            // Focus on the last filled input or the next empty one
            const nextIndex = Math.min(newOtp.length, 5);
            inputRefs.current[nextIndex]?.focus();
        }
    };

    // Function to verify the OTP code
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if all OTP fields are filled
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // API request to verify OTP
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-email`, {
                email: email,
                code: otpString,
            });

            if (response.status === 200) {
                setSuccess(true);

                // Redirect to dashboard after successful verification
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                setError(response.data.message || 'Verification failed');
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Function to resend OTP code
    const handleResendCode = async () => {
        if (resendTimer > 0) return;

        try {
            setError('');

            // API request to resend OTP (you may need to implement this endpoint)
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/regenerate-verification-token`, {
                email: email,
            });

            // Start 60-second cooldown timer
            setResendTimer(60);

            // Clear current OTP
            setOtp(new Array(6).fill(''));

            // Focus on first input
            inputRefs.current[0]?.focus();

        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message);
            } else {
                setError('Failed to resend code. Please try again.');
            }
        }
    };

    // Check if OTP is complete
    const isOtpComplete = otp.every(digit => digit !== '');

    return (
        <div className='h-screen w-full flex items-center'>
            <div className='h-full w-full px-6 flex flex-col justify-center text-zinc-800 gap-4 max-w-md mx-auto'>

                {/* Back to signup link */}
                <div >
                    <button
                        type="button"
                        onClick={() => router.push('/signup')}
                        className="flex items-center gap-2 text-sm cursor-pointer text-blue-500 hover:text-blue-700 bg-zinc-100 hover:bg-zinc-200 p-2 rounded w-fit"
                        disabled={isLoading}
                    >
                        ← Back to signup
                    </button>
                </div>

                {/* Header section with title and email display */}
                <div className='flex flex-col gap-2 '>
                    <h1 className='font-bold text-3xl'>Verify your email</h1>
                    <p className='text-sm text-zinc-600'>
                        We&apos;ve sent a 6-digit verification code to
                    </p>
                    <p className='text-sm font-medium text-zinc-800'>
                        {email}
                    </p>
                </div>

                {/* Success message */}
                {success && (
                    <div className='flex items-start gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200'>
                        <Check size={16} className='mt-0.5' />
                        <div>
                            <p className='font-medium'>Email verified successfully!</p>
                            <p className='text-green-700'>Redirecting to your dashboard...</p>
                        </div>
                    </div>
                )}

                {/* OTP verification form */}
                <form onSubmit={handleVerifyOTP} className="w-full">
                    <h3 className="font-semibold text-base mb-3 text-left">
                        Enter verification code
                    </h3>

                    {/* OTP input fields */}
                    <div className="flex justify-between px-1 mb-4" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                className="w-13 h-13 text-center text-xl font-semibold border border-zinc-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                disabled={isLoading || success}
                                autoComplete="off"
                            />
                        ))}
                    </div>

                    {/* Display error message if verification fails */}
                    {error && (
                        <div className='flex items-start gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-4'>
                            <CircleAlert size={16} className='mt-0.5' />
                            {error}
                        </div>
                    )}

                    {/* Verify button */}
                    <button
                        type="submit"
                        disabled={!isOtpComplete || isLoading || success}
                        className={`w-full px-4 py-3 rounded-md font-medium transition-colors ${isOtpComplete && !isLoading && !success
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? 'Verifying...' : success ? 'Verified!' : 'Verify Email'}
                    </button>

                    {/* Resend code section */}
                    <div className="flex gap-2 items-center text-center mt-6">
                        <p className="text-sm text-zinc-600 ">
                            Didn&apos;t receive the code?
                        </p>
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={resendTimer > 0 || isLoading || success}
                            className={`text-sm font-medium ${resendTimer > 0 || isLoading || success
                                ? 'text-zinc-400 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-700 cursor-pointer'
                                }`}
                        >
                            {resendTimer > 0
                                ? `Resend code in ${resendTimer}s`
                                : 'Resend verification code'
                            }
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default OTPVerification;