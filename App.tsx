import React, { useState } from 'react';
import ConfigForm from './components/ConfigForm';
import ContentUpload from './components/ContentUpload';
import PrintLayout from './components/PrintLayout';
import LoadingOverlay from './components/LoadingOverlay';
import { ExamConfig, QuestionType, FileData, GeneratedQuestion } from './types';
import { generateQuestions } from './services/geminiService';
import { BookOpen } from 'lucide-react';

const initialConfig: ExamConfig = {
  schoolName: '',
  examName: 'বার্ষিক পরীক্ষা',
  className: 'দশম',
  subject: '',
  year: '২০২৫',
  time: '৪০ মিনিট',
  totalMarks: '২০',
  questionCount: 5,
  questionType: QuestionType.MCQ,
};

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [config, setConfig] = useState<ExamConfig>(initialConfig);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // We pass empty string for textContext as we are now PDF only
      const result = await generateQuestions(config, "", fileData);
      setQuestions(result);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'প্রশ্ন তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setConfig(initialConfig);
    setFileData(null);
    setQuestions([]);
    setStep(1);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-900 font-tiro pb-10 relative">
        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay />}

        {/* App Bar - Hidden on Print */}
        <header className="bg-white shadow-sm border-b border-emerald-100 print:hidden mb-8 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-2">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                    <BookOpen size={24} />
                </div>
                <h1 className="text-xl font-bold text-emerald-900">ExamGen Bangla</h1>
            </div>
        </header>

        <main className="max-w-5xl mx-auto px-4">
            
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm print:hidden" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Step 1: Configuration */}
            {step === 1 && (
                <div className="max-w-2xl mx-auto animate-fade-in">
                   <ConfigForm 
                     config={config} 
                     onChange={setConfig} 
                     onNext={() => setStep(2)} 
                   />
                </div>
            )}

            {/* Step 2: Content Upload */}
            {step === 2 && (
                <div className="max-w-3xl mx-auto animate-fade-in">
                    <button 
                        onClick={() => setStep(1)} 
                        className="mb-4 text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-semibold transition-colors"
                    >
                        &larr; আগের ধাপ (Back)
                    </button>
                    <ContentUpload 
                        fileData={fileData}
                        onFileChange={setFileData}
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                    />
                </div>
            )}

            {/* Step 3: Print Preview */}
            {step === 3 && (
                <div className="animate-fade-in">
                    <PrintLayout 
                        config={config}
                        questions={questions}
                        onBack={() => setStep(2)}
                        onReset={handleReset}
                    />
                </div>
            )}
        </main>
    </div>
  );
};

export default App;