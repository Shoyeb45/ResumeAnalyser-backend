"use client";

import { Button } from "@/components/ui/button";
import { FileText, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthenticationContext";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const { success } = useAuthContext();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (success) {
      router.push("/dashboard");
    } else {
      router.push("/signup");
    }
    return;
  };

  return (
    <nav className={`fixed top-0 bg-accent-foreground w-full z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-sm border-b-[0.5px] border-gray-200 shadow-lg' : 'backdrop-blur-sm border-b-[0.5px] border-gray-200'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center transition-all duration-300 hover:scale-105">
            <FileText className="h-8 w-8 text-primary mr-2 transition-all duration-300 hover:rotate-12" />
            <span className="text-lg md:text-xl font-heading font-bold text-foreground">
              IntelliResume
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {
              !success && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2 text-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => router.push("/signin")}
                >
                  Sign In
                </Button>
              )}
            <Button
              className="bg-primary hover:bg-primary/90 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              size="sm"
              onClick={handleGetStarted}
            >
              Get Started Free
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-gray-200 transition-all duration-300 hover:scale-110"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 transition-transform duration-300 rotate-180" />
              ) : (
                <Menu className="h-6 w-6 transition-transform duration-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="px-3 py-2 space-y-2">
              <Button variant="outline" size="sm" className="w-full text-gray-200 border-gray-200"
              >
                Sign In
              </Button>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white" size="sm"
                onClick={handleGetStarted}>
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
