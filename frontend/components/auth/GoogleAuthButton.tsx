"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Interface for Google's credential response object
 * Contains the JWT token and selection method from Google Identity Services
 */
interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

/**
 * Props interface for GoogleLogin component
 * Provides customization options for appearance and behavior
 */
interface GoogleLoginProps {
  onSuccess?: (data: Record<string, unknown>) => void;
  onError?: (error: string) => void;
  apiEndpoint?: string;
  className?: string;
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  shape?: "rectangular" | "pill" | "circle" | "square";
}

/**
 * Global window interface extension for Google Identity Services
 * Adds type safety for Google's client library methods
 */
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

/**
 * Google Login Component
 * Handles Google OAuth authentication with customizable UI and secure token handling
 * Includes error handling, loading states, and automatic redirection
 */
export default function GoogleLogin({
  onSuccess,
  onError,
  apiEndpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`,
  className = "w-full max-w-md mx-auto",
  theme = "outline",
  size = "large",
  shape = "rectangular"
}: GoogleLoginProps) {
  // State management for authentication flow and UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref for Google Sign-In button container element
  const buttonRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  /**
   * Handle credential response from Google Identity Services
   * Processes the JWT token and makes API call to backend for authentication
   * Includes comprehensive error handling and user feedback
   */
  const handleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    // Validate that Google provided a credential token
    if (!response.credential) {
      const errorMsg = "No credential received from Google";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Set loading state and clear previous errors
    setIsLoading(true);
    setError(null);

    try {
      // Send JWT token to backend API for verification and user creation/login
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: response.credential }),
        credentials: "include", // Include cookies for session management
      });

      // Handle HTTP errors from backend
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Check for application-level errors in response
      if (data.error) {
        throw new Error(data.error);
      }

      // Authentication successful - trigger success callback and redirect
      console.log("Login success:", data);
      onSuccess?.(data);

      // Automatically redirect to dashboard after successful login
      router.push("/dashboard");
    } catch (err) {
      // Handle and display authentication errors to user
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      console.error("Login failed:", err);
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      // Reset loading state regardless of success or failure
      setIsLoading(false);
    }
  }, [apiEndpoint, onSuccess, onError, router]);

  /**
   * Load Google Identity Services script dynamically
   * Handles script loading with error handling and duplicate prevention
   */
  useEffect(() => {
    const loadGoogleScript = () => {
      // Check if Google Identity Services is already loaded
      if (window.google?.accounts?.id) {
        setIsGoogleLoaded(true);
        return;
      }

      // Create and configure script element for Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      // Handle successful script loading
      script.onload = () => setIsGoogleLoaded(true);
      
      // Handle script loading errors
      script.onerror = () => {
        const errorMsg = "Failed to load Google Sign-In script";
        setError(errorMsg);
        onError?.(errorMsg);
      };
      
      // Add script to document head to begin loading
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, [onError]);

  /**
   * Initialize Google Sign-In configuration and render button
   * Only runs once when Google script is loaded and DOM element is ready
   * Includes responsive width handling and comprehensive error handling
   */
  useEffect(() => {
    // Prevent multiple initializations and ensure prerequisites are met
    if (!isGoogleLoaded || !buttonRef.current || isInitialized) return;

    // Get Google Client ID from environment variables
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // Validate that Client ID is configured
    if (!clientId) {
      const errorMsg = "Google Client ID is not configured";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      // Get the actual width of the container for responsive button sizing
      const containerWidth = buttonRef.current.offsetWidth;
      
      // Initialize Google Identity Services with configuration
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false, // Prevent automatic account selection
        cancel_on_tap_outside: true, // Allow users to cancel by clicking outside
      });

      // Render the Google Sign-In button with customization options
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme,
        size,
        shape,
        width: containerWidth || 400, // Use container width or fallback to 400px
        logo_alignment: "left",
        text: "signin_with",
      });

      // Clear any previous errors and mark as initialized
      setError(null);
      setIsInitialized(true);
    } catch {
      // Handle initialization errors
      const errorMsg = "Failed to initialize Google Sign-In";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [isGoogleLoaded, theme, size, shape, onError, handleCredentialResponse, isInitialized]);

  /**
   * Error state display with retry functionality
   * Provides user-friendly error messages and recovery options
   */
  if (error) {
    return (
      <div className={`google-login-error ${className}`}>
        <div className="error-message text-red-600 text-sm mb-2">
          {error}
        </div>
        {/* Retry button to reload the page and attempt login again */}
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 text-sm underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  /**
   * Loading state display while Google script loads
   * Shows animated placeholder to improve perceived performance
   */
  if (!isGoogleLoaded) {
    return (
      <div className={`google-login-loading ${className}`}>
        <div className="loading-placeholder bg-gray-200 animate-pulse rounded-md h-10 w-full flex items-center justify-center">
          <span className="text-gray-500 text-sm">Loading Google Sign-In...</span>
        </div>
      </div>
    );
  }

  /**
   * Main Google Sign-In button component
   * Renders the actual Google button with loading overlay when processing
   */
  return (
    <div className={`google-login-container ${className}`}>
      {/* Container for Google's rendered button with conditional styling */}
      <div
        ref={buttonRef}
        className={`google-signin-button w-full ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      />
      {/* Loading overlay displayed during authentication process */}
      {isLoading && (
        <div className="loading-overlay mt-2 text-center">
          <span className="text-sm text-gray-600">Signing in...</span>
        </div>
      )}
    </div>
  );
}