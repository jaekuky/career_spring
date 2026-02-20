// ============================================================
// MVP 지원 직무 목록
// 3개 직군, 16개 세부 직무 (IT 7 + 기획 4 + 디자인 3 + 마케팅 2)
// ============================================================

export type JobCategory = 'it' | 'planning' | 'design' | 'marketing';

export interface JobRole {
  id: string;        // API 요청 시 사용하는 식별자
  label: string;     // 화면에 표시할 이름
  category: JobCategory;
}

// ============================================================
// IT 개발 (7개)
// ============================================================
const IT_ROLES: JobRole[] = [
  { id: 'frontend',   label: '프론트엔드',  category: 'it' },
  { id: 'backend',    label: '백엔드',      category: 'it' },
  { id: 'fullstack',  label: '풀스택',      category: 'it' },
  { id: 'mobile',     label: '모바일',      category: 'it' },
  { id: 'data_ml',    label: '데이터/ML',   category: 'it' },
  { id: 'devops',     label: 'DevOps',      category: 'it' },
  { id: 'security',   label: '보안',        category: 'it' },
];

// ============================================================
// 기획 (4개)
// ============================================================
const PLANNING_ROLES: JobRole[] = [
  { id: 'service_planning', label: '서비스기획', category: 'planning' },
  { id: 'pm',               label: 'PM',         category: 'planning' },
  { id: 'po',               label: 'PO',          category: 'planning' },
  { id: 'biz_planning',     label: '사업기획',   category: 'planning' },
];

// ============================================================
// 디자인 (3개)
// ============================================================
const DESIGN_ROLES: JobRole[] = [
  { id: 'ui_ux',    label: 'UI/UX',  category: 'design' },
  { id: 'graphic',  label: '그래픽', category: 'design' },
  { id: 'bx',       label: 'BX',     category: 'design' },
];

// ============================================================
// 마케팅 (2개) — 추가 확장
// ============================================================
const MARKETING_ROLES: JobRole[] = [
  { id: 'performance_marketing', label: '퍼포먼스 마케팅', category: 'marketing' },
  { id: 'content_marketing',     label: '콘텐츠 마케팅',   category: 'marketing' },
];

// ============================================================
// 전체 직무 목록 (flat)
// ============================================================
export const ALL_JOB_ROLES: JobRole[] = [
  ...IT_ROLES,
  ...PLANNING_ROLES,
  ...DESIGN_ROLES,
  ...MARKETING_ROLES,
];

// ============================================================
// 카테고리별 그룹
// ============================================================
export const JOB_CATEGORIES: Record<JobCategory, { label: string; roles: JobRole[] }> = {
  it: {
    label: 'IT 개발',
    roles: IT_ROLES,
  },
  planning: {
    label: '기획',
    roles: PLANNING_ROLES,
  },
  design: {
    label: '디자인',
    roles: DESIGN_ROLES,
  },
  marketing: {
    label: '마케팅',
    roles: MARKETING_ROLES,
  },
};

// ============================================================
// 유틸
// ============================================================

/** id로 JobRole 조회 */
export function findJobRoleById(id: string): JobRole | undefined {
  return ALL_JOB_ROLES.find((role) => role.id === id);
}

/** label로 JobRole 조회 */
export function findJobRoleByLabel(label: string): JobRole | undefined {
  return ALL_JOB_ROLES.find((role) => role.label === label);
}

/** 카테고리에 속한 직무만 필터 */
export function getJobRolesByCategory(category: JobCategory): JobRole[] {
  return ALL_JOB_ROLES.filter((role) => role.category === category);
}
