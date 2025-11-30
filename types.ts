export enum QuestionType {
  MCQ = 'MCQ',
  CREATIVE = 'CREATIVE', // Sikjonshil
}

export interface ExamConfig {
  schoolName: string;
  examName: string;
  className: string;
  subject: string;
  year: string;
  time: string;
  totalMarks: string;
  questionCount: number;
  questionType: QuestionType;
}

export interface GeneratedQuestion {
  id: number;
  questionText?: string; // for MCQ main text
  options?: string[]; // Only for MCQ
  stems?: string[]; // For creative parts (k, kh, g, gh)
  stemContext?: string; // The uddipok for creative
  correctOptionIndex?: number; // 0-3 for MCQ
  correctAnswer?: string; // Text answer or key points
  reference?: string; // Source text/topic used for this question
  diagramSvg?: string; // Optional SVG code for drawing diagrams/charts
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}