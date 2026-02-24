import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { AnalysisInput, SalaryRange, CompanyTypeMatch, Strength } from '@/types/analysis';

// analysis.ts의 AnalysisInput을 재export — 기존 import 경로를 유지하는 파일들에서 계속 사용 가능
export type { AnalysisInput };

// ============================================================
// 컨텍스트 전용 타입
// API 응답(AnalysisOutput)에 메타데이터(id, date, input)를 추가한 결과 레코드
// ============================================================

export interface AnalysisResult {
  id: string;
  date: string;
  input: AnalysisInput;
  salaryRange: SalaryRange;
  companyTypes: CompanyTypeMatch[];
  strengths: Strength[];
  sampleSize: number;
  confidenceScore: number;
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

// ============================================================
// 직무 ID별 기준 연봉 (만원, 3-5년차 중간값 기준)
// Edge Function의 프롬프트 벤치마크와 동기화
// ============================================================

const roleBaseSalary: Record<string, number> = {
  frontend: 5500,
  backend: 5900,
  fullstack: 5700,
  mobile: 6000,
  data_ml: 6500,
  devops: 6600,
  security: 6100,
  service_planning: 5000,
  pm: 5300,
  po: 5700,
  biz_planning: 5100,
  ui_ux: 4600,
  graphic: 4100,
  bx: 4600,
  performance_marketing: 4600,
  content_marketing: 4400,
};

// ============================================================
// Provider
// ============================================================

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentInput, setCurrentInput] = useState<AnalysisInput | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [savedResults, setSavedResults] = useState<AnalysisResult[]>(() => {
    try {
      const stored = localStorage.getItem('careerspring_results');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  /**
   * 로컬 모의 분석 결과 생성 (실제 API 호출 전 임시 구현)
   * 반환 타입이 AnalysisResult와 일치해야 AnalysisResult.tsx가 정상 렌더링됨
   */
  const generateResult = (input: AnalysisInput): AnalysisResult => {
    const baseSalary = roleBaseSalary[input.jobTitle] ?? 5000;
    const experienceMultiplier = 1 + input.yearsOfExperience * 0.08;
    const skillsBonus = input.skills.length * 50;
    const achievementsBonus =
      (input.achievements?.length ?? 0) > 100 ? 300 :
      (input.achievements?.length ?? 0) > 50 ? 150 : 0;
    const educationBonus =
      input.education === '대학원졸(석사)' ? 400 :
      input.education === '대학원졸(박사)' ? 700 : 0;

    const mid = Math.round(
      (baseSalary * experienceMultiplier + skillsBonus + achievementsBonus + educationBonus) / 100,
    ) * 100;
    const min = Math.round((mid * 0.9) / 100) * 100;
    const max = Math.round((mid * 1.15) / 100) * 100;

    const salaryRange: SalaryRange = { min, mid, max };

    const companyTypes: CompanyTypeMatch[] = [
      {
        type: 'startup',
        matchLevel: input.yearsOfExperience <= 4 ? 'high' : 'medium',
        description: '빠른 성장 환경에서 다양한 역할 수행 가능',
      },
      {
        type: 'midsize',
        matchLevel: input.yearsOfExperience >= 3 ? 'high' : 'medium',
        description: '안정성과 성장의 균형을 갖춘 환경',
      },
      {
        type: 'enterprise',
        matchLevel: input.yearsOfExperience >= 4 && input.education !== '고졸' ? 'medium' : 'low',
        description: '체계적인 조직과 안정적인 복지 제공',
      },
    ];

    const strengths: Strength[] = [
      {
        title: `${input.skills[0] ?? '핵심 기술'} 전문성`,
        description: '동일 직군 대비 상위 20% 수준의 기술력 보유',
        percentile: 20,
      },
      {
        title: '성과 기반 경력',
        description: '구체적 수치 기반 성과로 비즈니스 임팩트 입증',
        percentile: 25,
      },
      {
        title: `${input.yearsOfExperience}년 현장 경험`,
        description: '업계 평균 대비 경쟁력 있는 실무 경험 보유',
        percentile: 35,
      },
    ];

    return {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      input,
      salaryRange,
      companyTypes,
      strengths,
      sampleSize: Math.floor(Math.random() * 500) + 500,
      confidenceScore: 0.75,
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
