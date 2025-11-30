import React from 'react';
import { ExamConfig, QuestionType } from '../types';

interface Props {
  config: ExamConfig;
  onChange: (config: ExamConfig) => void;
  onNext: () => void;
}

const ConfigForm: React.FC<Props> = ({ config, onChange, onNext }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...config, [name]: value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as QuestionType;
    let newConfig = { ...config, questionType: newType };
    
    // Auto-set defaults based on type
    if (newType === QuestionType.CREATIVE) {
        newConfig.time = '২ঘন্টা ৩০ মিনিট';
        newConfig.totalMarks = '৭০';
        newConfig.questionCount = 10;
    } else {
        newConfig.time = '৪০ মিনিট';
        newConfig.totalMarks = '২০';
        newConfig.questionCount = 20;
    }
    onChange(newConfig);
  };

  const inputClass = "w-full p-2 border border-emerald-200 bg-emerald-50/30 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-emerald-900 placeholder-emerald-300";
  const labelClass = "block text-sm font-semibold mb-1 text-emerald-800";

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-emerald-100 font-tiro">
      <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b border-emerald-100 pb-2">১. পরীক্ষার তথ্য (Exam Details)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>বিদ্যালয়ের নাম (School Name)</label>
          <input
            type="text"
            name="schoolName"
            value={config.schoolName}
            onChange={handleChange}
            className={inputClass}
            placeholder="উদাহরণ: সরকারি উচ্চ বিদ্যালয়"
          />
        </div>
        <div>
          <label className={labelClass}>পরীক্ষার নাম (Exam Name)</label>
          <input
            type="text"
            name="examName"
            value={config.examName}
            onChange={handleChange}
            className={inputClass}
            placeholder="উদাহরণ: বার্ষিক পরীক্ষা"
          />
        </div>
        
        <div>
          <label className={labelClass}>শ্রেণী (Class)</label>
          <select
            name="className"
            value={config.className}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="ষষ্ঠ">ষষ্ঠ (Sixth)</option>
            <option value="সপ্তম">সপ্তম (Seventh)</option>
            <option value="অষ্টম">অষ্টম (Eighth)</option>
            <option value="নবম">নবম (Ninth)</option>
            <option value="দশম">দশম (Tenth)</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>বিষয় (Subject)</label>
          <input
            type="text"
            name="subject"
            value={config.subject}
            onChange={handleChange}
            className={inputClass}
            placeholder="উদাহরণ: বাংলা"
          />
        </div>
        <div>
          <label className={labelClass}>সাল (Year)</label>
          <input
            type="text"
            name="year"
            value={config.year}
            onChange={handleChange}
            className={inputClass}
            placeholder="২০২৫"
          />
        </div>
        <div>
          <label className={labelClass}>সময় (Time)</label>
          <input
            type="text"
            name="time"
            value={config.time}
            onChange={handleChange}
            className={inputClass}
            placeholder="সময়"
          />
        </div>
        <div>
          <label className={labelClass}>পূর্ণমান (Total Marks)</label>
          <input
            type="text"
            name="totalMarks"
            value={config.totalMarks}
            onChange={handleChange}
            className={inputClass}
            placeholder="নম্বর"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelClass}>প্রশ্নের ধরন (Question Type)</label>
          <select
            name="questionType"
            value={config.questionType}
            onChange={handleTypeChange}
            className={inputClass}
          >
            <option value={QuestionType.MCQ}>বহুনির্বাচনি (MCQ)</option>
            <option value={QuestionType.CREATIVE}>সৃজনশীল (Creative)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>প্রশ্নের সংখ্যা (Count)</label>
          <input
            type="number"
            name="questionCount"
            value={config.questionCount}
            onChange={handleChange}
            min={1}
            max={50}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-semibold transition-colors shadow-emerald-200 shadow-lg"
        >
          পরবর্তী ধাপ (Next) &rarr;
        </button>
      </div>
    </div>
  );
};

export default ConfigForm;