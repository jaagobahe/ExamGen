import React, { useState } from 'react';
import { ExamConfig, GeneratedQuestion, QuestionType } from '../types';
import { ArrowLeft, RefreshCw, Download, Printer, Eye, X, BookOpenText } from 'lucide-react';

interface Props {
  config: ExamConfig;
  questions: GeneratedQuestion[];
  onBack: () => void;
  onReset: () => void;
}

const PrintLayout: React.FC<Props> = ({ config, questions, onBack, onReset }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  
  const isMcq = config.questionType === QuestionType.MCQ;
  const isCreative = config.questionType === QuestionType.CREATIVE;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    // Give UI a moment to update state
    await new Promise(resolve => setTimeout(resolve, 100));

    const element = document.getElementById('print-area');
    
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
        alert("PDF তৈরির লাইব্রেরি এখনও লোড হয়নি। দয়া করে পেজটি রিফ্রেশ করুন বা ইন্টারনেট সংযোগ চেক করুন।");
        setIsGeneratingPdf(false);
        return;
    }

    if (!element) {
        alert("Content area not found!");
        setIsGeneratingPdf(false);
        return;
    }

    const opt = {
      margin:       5, // Reduced margin to 5mm to prevent cutoff (CSS handles internal padding)
      filename:     `${config.examName}_${config.className}_${config.subject || 'Exam'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false }, 
      jsPDF:        { unit: 'mm', format: 'a4', orientation: isCreative ? 'landscape' : 'portrait' }
    };

    try {
        // @ts-ignore
        await window.html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("PDF generation failed", error);
        alert("PDF ডাউনলোড ব্যর্থ হয়েছে। অনুগ্রহ করে 'প্রিন্ট' বাটন ব্যবহার করুন এবং ডেস্টিনেশন হিসেবে 'Save as PDF' নির্বাচন করুন।");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  // Convert English numerals to Bangla numerals for numbering
  const toBanglaNum = (n: number | string | undefined) => {
    if (n === undefined || n === null) return '';
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().replace(/\d/g, (d) => banglaDigits[parseInt(d)] || d);
  };

  const getLetter = (index: number) => {
    const letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ']; // Added extra letters just in case
    return letters[index] || '';
  };

  const creativeMarks = ['১', '২', '৩', '৪'];

  // Clean text to remove duplicate labels if model returns them
  const cleanText = (text: string) => {
    if (!text) return '';
    return text.replace(/^[\(\[]?[\u0995-\u0998a-dA-D0-9]+[\)\]\.]\s*/, '').trim();
  };

  return (
    <div className="flex flex-col items-center relative">
      <style>{`
        @media print {
          @page {
            size: ${isCreative ? 'landscape' : 'portrait'};
            margin: 0.5cm;
          }
        }
      `}</style>

      {/* Action Bar (Hidden in Print) */}
      <div className={`w-full flex flex-wrap justify-between items-center mb-6 gap-4 print:hidden ${isCreative ? 'max-w-[265mm]' : 'max-w-[180mm]'}`}>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> এডিট (Edit)
        </button>
        <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowReferenceModal(true)}
              className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded font-medium transition-colors"
            >
              <BookOpenText className="w-4 h-4" /> রেফারেন্স (Reference)
            </button>
            <button 
              onClick={() => setShowAnswerModal(true)}
              className="flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded font-medium transition-colors"
            >
              <Eye className="w-4 h-4" /> উত্তরমালা (Answer Key)
            </button>
            <button 
              onClick={onReset}
              className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> নতুন (New)
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-2 rounded font-medium transition-colors"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট (Print)
            </button>
            <button 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 rounded font-medium shadow transition-colors disabled:opacity-50"
            >
              {isGeneratingPdf ? 'প্রসেসিং...' : 'পিডিএফ ডাউনলোড (PDF)'}
              {!isGeneratingPdf && <Download className="w-4 h-4" />}
            </button>
        </div>
      </div>

      {/* Paper Container */}
      <div 
        id="print-area" 
        className={`bg-white shadow-2xl print:shadow-none p-10 text-black font-tiro relative box-border mx-auto leading-tight transition-all
          ${isCreative ? 'w-[265mm] min-h-[210mm]' : 'w-[180mm] min-h-[297mm]'}`}
      >
        
        {/* Exam Header */}
        <div className="text-center mb-6 border-b-2 border-black pb-2">
          <h1 className="text-3xl font-bold mb-2">{config.schoolName}</h1>
          <div className="flex justify-center items-center gap-2 text-xl font-semibold mb-1">
            <span>{config.examName}</span> <span>{config.year}</span>
          </div>
          <div className="text-lg font-medium mb-1">
             <span>শ্রেণী: {config.className}</span>
          </div>
          {config.subject && (
            <div className="text-lg font-medium mb-2">
                 <span>বিষয়: {config.subject}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold w-full mt-2 border-t border-black/20 pt-1">
             <span>সময়: {config.time}</span>
             <span>পূর্ণমান: {config.totalMarks}</span>
          </div>
          {isCreative && (
            <div className="w-full text-center mt-2 font-semibold text-sm">
                বিঃ দ্রঃ ১০টি প্রশ্নের মধ্যে যেকোনো ৭ টি প্রশ্নের উত্তর দিতে হবে ।
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className={`${isMcq ? 'grid grid-cols-2 gap-x-8 gap-y-6 text-sm' : ''} ${isCreative ? 'columns-2 gap-8 space-y-0' : 'space-y-6'}`}>
          {questions.map((q, idx) => (
            <div key={idx} className={`break-inside-avoid ${isCreative ? 'mb-6' : ''}`}>
              <div className="flex gap-1">
                <span className="font-bold whitespace-nowrap w-6 text-lg">{toBanglaNum(idx + 1)}।</span>
                
                <div className="flex-1">
                    {/* Question Body */}
                    {isMcq ? (
                        <div>
                            <p className="mb-1 font-medium leading-snug">{q.questionText}</p>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 ml-1 text-gray-800">
                                {q.options?.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex gap-1">
                                        <span className="font-medium">({getLetter(optIdx)})</span>
                                        <span>{cleanText(opt)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Creative Question (Srijonshil) */}
                            {q.stemContext && (
                                <div className="p-3 mb-2 bg-gray-50 print:bg-transparent border border-gray-200 print:border-gray-300 text-justify text-sm leading-relaxed">
                                    {q.stemContext}
                                </div>
                            )}

                            {/* Render SVG Diagram if present */}
                            {q.diagramSvg && (
                              <div 
                                className="my-3 flex justify-center p-2 border border-dashed border-gray-300 print:border-black/10 rounded bg-white"
                                title="Generated Diagram"
                                dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                              />
                            )}

                            <div className="space-y-1 ml-1">
                                {q.stems?.map((stem, stemIdx) => (
                                    <div key={stemIdx} className="flex gap-2 items-start justify-between">
                                        <div className="flex gap-2 flex-1">
                                            <span className="font-semibold w-5">({getLetter(stemIdx)})</span>
                                            <span className="text-sm leading-snug">{cleanText(stem)}</span>
                                        </div>
                                        <span className="font-semibold text-sm w-4 text-right">
                                            {toBanglaNum(creativeMarks[stemIdx] || '0')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-gray-400 print:hidden">
            Generated by ExamGen Bangla
        </div>
      </div>

      {/* Answer Key Modal */}
      {showAnswerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col font-tiro">
            <div className="p-4 border-b flex justify-between items-center bg-emerald-50 rounded-t-lg">
              <h2 className="text-xl font-bold text-emerald-900">উত্তরমালা (Answer Key)</h2>
              <button 
                onClick={() => setShowAnswerModal(false)}
                className="p-1 hover:bg-emerald-200 rounded-full text-emerald-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {isMcq ? (
                <div className="grid grid-cols-4 gap-4 text-sm">
                    {questions.map((q, idx) => (
                        <div key={idx} className="flex gap-2 items-center p-2 border border-gray-100 rounded bg-gray-50">
                            <span className="font-bold text-emerald-700">{toBanglaNum(idx + 1)}.</span>
                            <span className="font-bold">
                                {q.correctOptionIndex !== undefined ? `(${getLetter(q.correctOptionIndex)})` : '-'}
                            </span>
                        </div>
                    ))}
                </div>
              ) : (
                 <div className="space-y-4 text-sm">
                    {questions.map((q, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-3 last:border-0">
                            <div className="font-bold mb-1 text-emerald-700">{toBanglaNum(idx + 1)}. উত্তর সংকেত:</div>
                            <p className="text-gray-700 ml-4 whitespace-pre-wrap">{q.correctAnswer || "বর্ণনামূলক উত্তর"}</p>
                        </div>
                    ))}
                 </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end">
              <button 
                onClick={() => setShowAnswerModal(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reference Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col font-tiro">
            <div className="p-4 border-b flex justify-between items-center bg-blue-50 rounded-t-lg">
              <h2 className="text-xl font-bold text-blue-900">রেফারেন্স (Source Reference)</h2>
              <button 
                onClick={() => setShowReferenceModal(false)}
                className="p-1 hover:bg-blue-200 rounded-full text-blue-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <div className="space-y-4 text-sm">
                   {questions.map((q, idx) => (
                       <div key={idx} className="border-b border-gray-100 pb-3 last:border-0">
                           <div className="flex items-start gap-2 mb-1">
                               <span className="font-bold text-blue-700 whitespace-nowrap">{toBanglaNum(idx + 1)}.</span>
                               <span className="font-semibold text-gray-800 line-clamp-1">
                                   {isMcq ? q.questionText : (q.stemContext?.substring(0, 50) + "...")}
                               </span>
                           </div>
                           <div className="ml-6 p-2 bg-blue-50/50 rounded border border-blue-100 text-gray-700 text-sm">
                               <span className="font-semibold text-blue-800 text-xs uppercase tracking-wider block mb-1">Source Topic / Context:</span>
                               {q.reference || "No specific reference provided."}
                           </div>
                       </div>
                   ))}
                </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end">
              <button 
                onClick={() => setShowReferenceModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintLayout;