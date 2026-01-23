import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AnalysisInput {
  currentRole: string;
  yearsOfExperience: number;
  skills: string[];
  achievements: string;
  education: string;
  currentSalary?: number;
}

export interface AnalysisResult {
  id: string;
  date: string;
  input: AnalysisInput;
  salaryMin: number;
  salaryMid: number;
  salaryMax: number;
  companyTypes: { name: string; match: 'high' | 'medium' | 'low' }[];
  strengths: { icon: string; title: string; description: string }[];
  sampleSize: number;
}

interface AnalysisContextType {
  currentInput: AnalysisInput | null;
  setCurrentInput: (input: AnalysisInput) => void;
  currentResult: AnalysisResult | null;
  setCurrentResult: (result: AnalysisResult) => void;
  savedResults: AnalysisResult[];
  saveResult: (result: AnalysisResult) => void;
  generateResult: (input: AnalysisInput) => AnalysisResult;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

const roleBaseSalary: Record<string, number> = {
  '프론트엔드 개발': 4500,
  '백엔드 개발': 4800,
  '풀스택 개발': 5000,
  '모바일 개발': 4700,
  '데이터/ML': 5500,
  'DevOps': 5200,
  '서비스 기획': 4200,
  'PM/PO': 4800,
  '사업 기획': 4500,
  'UI/UX 디자인': 4300,
  '그래픽 디자인': 3800,
  '퍼포먼스 마케팅': 4000,
  '콘텐츠 마케팅': 3700,
  '기타': 4000,
};

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentInput, setCurrentInput] = useState<AnalysisInput | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [savedResults, setSavedResults] = useState<AnalysisResult[]>(() => {
    const stored = localStorage.getItem('careerspring_results');
    return stored ? JSON.parse(stored) : [];
  });

  const generateResult = (input: AnalysisInput): AnalysisResult => {
    const baseSalary = roleBaseSalary[input.currentRole] || 4000;
    const experienceMultiplier = 1 + (input.yearsOfExperience * 0.08);
    const skillsBonus = input.skills.length * 50;
    const achievementsBonus = input.achievements.length > 100 ? 300 : input.achievements.length > 50 ? 150 : 0;
    const educationBonus = input.education === '석사' ? 400 : input.education === '박사' ? 700 : 0;

    const midSalary = Math.round((baseSalary * experienceMultiplier + skillsBonus + achievementsBonus + educationBonus) / 100) * 100;
    const minSalary = Math.round((midSalary * 0.9) / 100) * 100;
    const maxSalary = Math.round((midSalary * 1.15) / 100) * 100;

    const companyTypes: { name: string; match: 'high' | 'medium' | 'low' }[] = [
      { name: 'IT 스타트업', match: input.yearsOfExperience <= 4 ? 'high' : 'medium' },
      { name: '중견 IT 기업', match: input.yearsOfExperience >= 3 ? 'high' : 'medium' },
      { name: '대기업 IT', match: input.yearsOfExperience >= 4 && input.education !== '고졸' ? 'medium' : 'low' },
    ];

    const strengths = [
      { icon: '🎯', title: `${input.skills[0] || input.currentRole} 전문성`, description: '상위 20% 희소 기술 보유' },
      { icon: '📈', title: '성과 기반 경력', description: '구체적 수치 기반 성과 보유' },
      { icon: '🔥', title: `${input.currentRole} 경력 ${input.yearsOfExperience}년`, description: '업계 평균 대비 경쟁력 있음' },
    ];

    return {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      input,
      salaryMin: minSalary,
      salaryMid: midSalary,
      salaryMax: maxSalary,
      companyTypes,
      strengths,
      sampleSize: Math.floor(Math.random() * 500) + 500,
    };
  };

  const saveResult = (result: AnalysisResult) => {
    const updated = [result, ...savedResults].slice(0, 10);
    setSavedResults(updated);
    localStorage.setItem('careerspring_results', JSON.stringify(updated));
  };

  return (
    <AnalysisContext.Provider value={{
      currentInput,
      setCurrentInput,
      currentResult,
      setCurrentResult,
      savedResults,
      saveResult,
      generateResult,
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};
