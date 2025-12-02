"use client"

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

const EmptyState: React.FC = () => {
    const router = useRouter();

    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes uploaded yet</h3>
            <p className="text-gray-600 mb-6">Get started by uploading your first resume to analyze and manage your job applications.</p>
            <button
                onClick={() => router.push('/dashboard/jd-matcher')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
                Upload Your First Resume
            </button>
        </div>
    )
};

export default EmptyState;
