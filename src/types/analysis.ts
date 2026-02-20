// ============================================================
// AI 분석 관련 타입 정의
// GPT-4.1-mini Structured Outputs 기반
// ============================================================

/** AI에게 보낼 분석 요청 입력값 */
export interface AnalysisInput {
  jobTitle: string;
  yearsOfExperience: number;
  skills: string[];
  achievements?: string;
  education: string;
}

// ============================================================
// AI 응답 JSON 스키마 (Structured Outputs)
// ============================================================

export interface SalaryRange {
  min: number; // 만원 단위
  mid: number;
  max: number;
}

export interface CompanyTypeMatch {
  type: 'startup' | 'midsize' | 'enterprise';
  matchLevel: 'high' | 'medium' | 'low';
  description: string;
}

export interface Strength {
  title: string;
  description: string;
  percentile: number; // 상위 몇 % (0~100, 낮을수록 상위)
}

/** AI 분석 결과 전체 출력 */
export interface AnalysisOutput {
  salaryRange: SalaryRange;
  companyTypes: CompanyTypeMatch[];
  strengths: Strength[];
  sampleSize: number;
  confidenceScore: number; // 0.0 ~ 1.0
}

// ============================================================
// GPT Structured Outputs JSON Schema
// (OpenAI API response_format: { type: 'json_schema' } 용)
// ============================================================

export const ANALYSIS_OUTPUT_SCHEMA = {
  name: 'analysis_output',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      salaryRange: {
        type: 'object',
        properties: {
          min: { type: 'number', description: '연봉 최솟값 (만원)' },
          mid: { type: 'number', description: '연봉 중간값 (만원)' },
          max: { type: 'number', description: '연봉 최댓값 (만원)' },
        },
        required: ['min', 'mid', 'max'],
        additionalProperties: false,
      },
      companyTypes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['startup', 'midsize', 'enterprise'] },
            matchLevel: { type: 'string', enum: ['high', 'medium', 'low'] },
            description: { type: 'string' },
          },
          required: ['type', 'matchLevel', 'description'],
          additionalProperties: false,
        },
      },
      strengths: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            percentile: { type: 'number', description: '상위 몇 % (0~100)' },
          },
          required: ['title', 'description', 'percentile'],
          additionalProperties: false,
        },
      },
      sampleSize: { type: 'number', description: '분석에 사용된 데이터 샘플 수' },
      confidenceScore: { type: 'number', description: '분석 신뢰도 (0.0~1.0)' },
    },
    required: ['salaryRange', 'companyTypes', 'strengths', 'sampleSize', 'confidenceScore'],
    additionalProperties: false,
  },
} as const;

// ============================================================
// 분석 요청 상태
// ============================================================

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
