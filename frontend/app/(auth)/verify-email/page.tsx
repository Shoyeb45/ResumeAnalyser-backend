'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OTPVerification from '@/components/auth/OTPVerification'; 

/**
 * Main component that handles email verification logic
 * Extracts email from URL parameters and renders OTP verification
 */
const VerifyEmail = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState<string>('');

    useEffect(() => {
        // Extract email parameter from URL search params
        const emailParam = searchParams.get('email');

        // Redirect to signup if no email parameter is found
        if (!emailParam) {
            router.push('/signup');
            return;
        }

        // Decode the email parameter and set it to state
        // decodeURIComponent handles any URL encoding (e.g., @ becomes %40)
        setEmail(decodeURIComponent(emailParam));
    }, [searchParams, router]);

    // Show loading state while email is being processed
    if (!email) {
        return (
            <div className='h-screen w-full flex items-center justify-center'>
                <div className='text-zinc-600'>Loading...</div>
            </div>
        );
    }

    // Render the OTP verification component with the extracted email
    return <OTPVerification email={email} />;
};

/**
 * Page component that wraps VerifyEmail with Suspense boundary
 * This handles the loading state for the useSearchParams hook
 * which requires Suspense in Next.js App Router
 */
const VerifyEmailPage = () => {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center text-zinc-600">
                Loading...
            </div>
        }>
            <VerifyEmail />
        </Suspense>
    );
};

export default VerifyEmailPage;