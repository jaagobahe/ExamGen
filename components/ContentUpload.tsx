import React, { useRef, useState, useEffect } from 'react';
import { FileData } from '../types';
import { CloudUpload, FileText, X, CheckCircle, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  fileData: FileData | null;
  onFileChange: (file: FileData | null) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const ContentUpload: React.FC<Props> = ({ 
  fileData, 
  onFileChange, 
  onGenerate,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state if file is removed externally or component remounts with data
  useEffect(() => {
    if (!fileData) {
        setUploadStatus('idle');
        setProgress(0);
        setErrorMessage('');
    } else {
        setUploadStatus('success');
        setProgress(100);
    }
  }, [fileData]);

  const handleFile = (file: File) => {
    setErrorMessage('');
    
    if (file && file.type === 'application/pdf') {
      setUploadStatus('uploading');
      setProgress(0);

      const reader = new FileReader();
      
      // Monitor progress
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      reader.onload = () => {
        // Simulate a brief moment at 100% before showing success state
        setProgress(100);
        setTimeout(() => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            
            onFileChange({
              name: file.name,
              mimeType: file.type,
              base64: base64Data
            });
            setUploadStatus('success');
        }, 500);
      };

      reader.onerror = () => {
        setUploadStatus('error');
        setErrorMessage('ফাইলটি পড়তে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      };

      reader.readAsDataURL(file);
    } else {
      setUploadStatus('error');
      setErrorMessage("দুঃখিত, শুধুমাত্র পিডিএফ (PDF) ফাইল আপলোড করা যাবে।");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      onFileChange(null);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-emerald-100 font-tiro max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-emerald-900 mb-2">বিষয়বস্তু আপলোড (Content Upload)</h2>
        <p className="text-emerald-600/80">প্রশ্ন তৈরির জন্য আপনার পিডিএফ ফাইলটি নিচে যুক্ত করুন</p>
      </div>

      {/* Upload Zone */}
      <div 
        className={`relative group border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${
          dragActive 
            ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' 
            : uploadStatus === 'error'
              ? 'border-red-300 bg-red-50'
              : fileData 
                ? 'border-emerald-200 bg-white' 
                : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/30'
        }`}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={handleDrop}
        onClick={() => !fileData && uploadStatus !== 'uploading' && fileInputRef.current?.click()}
      >
        {/* State: Uploading */}
        {uploadStatus === 'uploading' && (
           <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
              <p className="text-lg font-bold text-emerald-900 mb-2">ফাইল আপলোড হচ্ছে...</p>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                <div 
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-emerald-600">{progress}% সম্পন্ন</p>
           </div>
        )}

        {/* State: Error */}
        {uploadStatus === 'error' && (
            <div className="flex flex-col items-center justify-center py-4">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <p className="text-xl font-bold text-red-700 mb-2">আপলোড ব্যর্থ হয়েছে</p>
                <p className="text-red-600 mb-6 font-medium">{errorMessage}</p>
                <button 
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="px-6 py-2 rounded-full border border-red-300 text-red-700 font-semibold hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                    আবার চেষ্টা করুন
                </button>
            </div>
        )}

        {/* State: Idle (No file) */}
        {uploadStatus === 'idle' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-emerald-100 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <CloudUpload className="w-10 h-10 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-900 mb-2">পিডিএফ ফাইল ড্রপ করুন</p>
            <p className="text-emerald-500 text-sm mb-6 font-medium">অথবা</p>
            <button className="px-6 py-2 rounded-full border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-600 hover:text-white hover:border-transparent transition-all shadow-sm">
              ফাইল ব্রাউজ করুন (Browse File)
            </button>
            <p className="mt-4 text-xs text-emerald-400">শুধুমাত্র PDF ফাইল সাপোর্টেড</p>
          </div>
        )}

        {/* State: Success (File Loaded) */}
        {uploadStatus === 'success' && fileData && (
          <div className="flex items-center justify-between bg-emerald-50/50 p-2 rounded-xl">
            <div className="flex items-center gap-4 flex-1 overflow-hidden">
               <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100 relative">
                  <FileText className="w-8 h-8 text-emerald-600" />
                  <div className="absolute -top-1 -right-1 bg-white rounded-full">
                      <CheckCircle className="w-4 h-4 text-emerald-500 fill-white" />
                  </div>
               </div>
               <div className="text-left flex-1 min-w-0">
                  <p className="font-bold text-emerald-900 truncate text-lg">{fileData.name}</p>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-0.5">
                    <CheckCircle className="w-3 h-3" />
                    <span>আপলোড সম্পন্ন হয়েছে</span>
                  </div>
               </div>
            </div>
            <button 
              onClick={removeFile}
              className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100 shadow-sm ml-4"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="application/pdf"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
      </div>

      {/* Action Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onGenerate}
          disabled={isLoading || !fileData}
          className={`w-full md:w-auto min-w-[280px] px-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
            isLoading || !fileData
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:shadow-emerald-200/50 hover:shadow-2xl'
          }`}
        >
          {/* Spinner removed here as Overlay handles it */}
          <span>প্রশ্ন তৈরি করুন (Generate)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ContentUpload;