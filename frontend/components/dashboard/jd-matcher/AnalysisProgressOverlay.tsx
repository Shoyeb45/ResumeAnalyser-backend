import { useEffect, useState } from 'react';

const AnalysisProgressOverlay = ({ isScanning }: { isScanning: boolean }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isScanning) {
      setStep(0); // reset on start
      const timeouts = [
        setTimeout(() => setStep(1), 3000),
        setTimeout(() => setStep(2), 6000),
        setTimeout(() => setStep(3), 9000),
        setTimeout(() => setStep(4), 12000),
      ];
      return () => timeouts.forEach(clearTimeout);
    }
  }, [isScanning]);

  return (
    isScanning && (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analyzing Your Resume
            </h3>

            <p className="text-gray-600 mb-6">
              Our AI is comparing your resume with the job requirements...
            </p>

            <div className="space-y-3 text-sm">
              {step >= 1 && (
                <div className="flex items-center justify-between transition-opacity duration-300">
                  <span className="text-gray-700">Parsing resume content</span>
                  <span className="text-green-600 font-medium">✓</span>
                </div>
              )}

              {step >= 2 && (
                <div className="flex items-center justify-between transition-opacity duration-300">
                  <span className="text-gray-700">Analyzing job requirements</span>
                  <span className="text-green-600 font-medium">✓</span>
                </div>
              )}

              {step >= 3 && (
                <div className="flex items-center justify-between transition-opacity duration-300 text-gray-600">
                  <span>Generating compatibility score</span>
                  <span className="text-green-600 font-medium">✓</span>
                </div>
              )}

              {step >= 4 && (
                <div className="flex items-center justify-between transition-opacity duration-300 text-gray-600">
                  <span>Preparing recommendations</span>
                  <span className="text-green-600 font-medium">✓</span>
                </div>
              )}
            </div>

            <div className="mt-6 bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${step * 25}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AnalysisProgressOverlay;
