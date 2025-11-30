import React, { useEffect, useState } from 'react';

const LoadingOverlay: React.FC = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-emerald-950/80 backdrop-blur-sm transition-opacity duration-300 font-tiro">
      <div className="relative w-24 h-16 mb-8">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20 rounded-full blur-sm"></div>
        <ul className="book-pages m-0 p-0 list-none relative w-full h-full perspective-[1000px]">
          <li className="page"></li>
          <li className="page"></li>
          <li className="page"></li>
          <li className="page"></li>
          <li className="page"></li>
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-emerald-800 z-20"></div>
        </ul>
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-2 tracking-wide animate-pulse drop-shadow-md">
        প্রশ্ন তৈরি করা হচ্ছে...
      </h2>
      <div className="text-emerald-300 font-mono text-xl mb-4">
        সময় অতিবাহিত: {formatTime(seconds)}
      </div>

      <div className="flex gap-2 items-center justify-center">
         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      </div>

      <style>{`
        .book-pages li.page {
          position: absolute;
          top: 0;
          left: 50%; /* Start from center spine */
          width: 45%; /* Page width */
          height: 100%;
          background: linear-gradient(to right, #f8fafc 0%, #ffffff 100%);
          transform-origin: 0% 50%; /* Hinge at the spine (left edge of element) */
          border-radius: 0 4px 4px 0;
          animation: flipBook 2s infinite ease-in-out;
          transform-style: preserve-3d;
          border: 1px solid #cbd5e1;
          border-left: 1px solid #94a3b8;
        }
        
        .book-pages li.page:nth-child(1) { animation-delay: 0.0s; z-index: 5; }
        .book-pages li.page:nth-child(2) { animation-delay: 0.4s; z-index: 4; }
        .book-pages li.page:nth-child(3) { animation-delay: 0.8s; z-index: 3; }
        .book-pages li.page:nth-child(4) { animation-delay: 1.2s; z-index: 2; }
        .book-pages li.page:nth-child(5) { animation-delay: 1.6s; z-index: 1; }

        @keyframes flipBook {
          0% { 
            transform: rotateY(0deg); 
          }
          100% { 
            transform: rotateY(-180deg); 
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;