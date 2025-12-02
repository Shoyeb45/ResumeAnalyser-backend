const ProgressStepper: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
    const getStepLabel = (index: number) => {
        switch (index) {
            case 0: return 'Skill Extraction';
            case 1: return 'Assessment';
            case 2: return 'Career Feedback';
            default: return `Step ${index + 1}`;
        }
    };

    return (
        <div className="w-full mb-8">
            {/* Mobile Layout (< md screens) */}
            <div className="md:hidden">
                <div className="flex flex-col space-y-4">
                    {Array.from({ length: totalSteps }, (_, i) => (
                        <div key={i} className="flex items-center">
                            {/* Step Circle */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                                i + 1 <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                            }`}>
                                {i + 1}
                            </div>
                            
                            {/* Step Label */}
                            <span className={`ml-3 font-medium text-sm ${
                                i + 1 <= currentStep ? 'text-blue-500' : 'text-gray-500'
                            }`}>
                                {getStepLabel(i)}
                            </span>
                            
                            {/* Current Step Indicator */}
                            {i + 1 === currentStep && (
                                <div className="ml-auto">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Mobile Progress Bar */}
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Desktop Layout (>= md screens) */}
            <div className="hidden md:flex items-center justify-between">
                {Array.from({ length: totalSteps }, (_, i) => (
                    <div key={i} className="flex items-center flex-1">
                        {/* Step Circle */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            i + 1 <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                            {i + 1}
                        </div>
                        
                        {/* Step Label */}
                        <span className={`ml-3 font-medium whitespace-nowrap ${
                            i + 1 <= currentStep ? 'text-blue-500' : 'text-gray-500'
                        }`}>
                            {getStepLabel(i)}
                        </span>
                        
                        {/* Connector Line */}
                        {i < totalSteps - 1 && (
                            <div className="flex-1 mx-4 min-w-[2rem]">
                                <div className={`h-[2px] w-full ${
                                    i + 1 < currentStep ? 'bg-blue-500' : 'bg-gray-300'
                                }`} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressStepper;