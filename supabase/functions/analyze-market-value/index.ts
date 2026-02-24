// ============================================================
// analyze-market-value — Supabase Edge Function
// 한국 IT/기획/디자인 직군 시장 가치 AI 분석
// Runtime: Deno (Supabase Edge Runtime)
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts.ts'

// ============================================================
// 타입 정의 (분석 입출력)
// ============================================================

interface AnalysisInput {
  jobTitle: string
  yearsOfExperience: number
  skills: string[]
  achievements?: string | null
  education: string
}

interface SalaryRange {
  min: number
  mid: number
  max: number
}

interface CompanyTypeMatch {
  type: 'startup' | 'midsize' | 'enterprise'
  matchLevel: 'high' | 'medium' | 'low'
  description: string
}

interface Strength {
  title: string
  description: string
  percentile: number
}

interface AnalysisOutput {
  salaryRange: SalaryRange
  companyTypes: CompanyTypeMatch[]
  strengths: Strength[]
  sampleSize: number
  confidenceScore: number
}

// ============================================================
// 상수
// ============================================================

/** MVP에서 지원하는 직무 ID 목록 (jobs.ts와 동기화) */
const ALLOWED_JOB_IDS = new Set([
  'frontend', 'backend', 'fullstack', 'mobile', 'data_ml', 'devops', 'security',
  'service_planning', 'pm', 'po', 'biz_planning',
  'ui_ux', 'graphic', 'bx',
  'performance_marketing', 'content_marketing',
])

const ALLOWED_EDUCATION = new Set([
  '고졸', '전문대졸', '대졸', '대학원졸(석사)', '대학원졸(박사)', '기타',
])

const OPENAI_TIMEOUT_MS = 30_000
const MAX_SKILLS = 20
const MAX_ACHIEVEMENTS_LEN = 500

// ============================================================
// CORS 헬퍼
// ============================================================

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowedOrigin = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173'

  // 개발 환경(localhost)은 모두 허용
  const origin =
    requestOrigin && (requestOrigin === allowedOrigin || requestOrigin.startsWith('http://localhost'))
      ? requestOrigin
      : allowedOrigin

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function corsResponse(status: number, body: unknown, requestOrigin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(requestOrigin),
    },
  })
}

// ============================================================
// 비식별화 헬퍼
// achievements 필드에서 개인 식별 정보를 마스킹한다.
// 완전한 NLP 기반 비식별화는 아니지만, 명백한 PII 패턴을 제거한다.
// ============================================================

function deidentifyText(text: string): string {
  return text
    // 이메일 주소
    .replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '[이메일]')
    // 한국 전화번호 (010-1234-5678, 02-1234-5678 등)
    .replace(/(\d{2,3})[-.\s]?(\d{3,4})[-.\s]?(\d{4})/g, '[연락처]')
    // URL
    .replace(/https?:\/\/[^\s]+/g, '[URL]')
    // 주민등록번호 패턴 (6자리-7자리)
    .replace(/\d{6}[-]\d{7}/g, '[식별번호]')
}

// ============================================================
// 입력 유효성 검증
// ============================================================

interface ValidationError {
  field: string
  message: string
}

type ValidationResult =
  | { valid: true; input: AnalysisInput }
  | { valid: false; errors: ValidationError[] }

function validateInput(data: unknown): ValidationResult {
  const errors: ValidationError[] = []

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: [{ field: 'body', message: '요청 본문이 올바르지 않습니다.' }] }
  }

  const d = data as Record<string, unknown>

  // jobTitle
  if (typeof d.jobTitle !== 'string' || !ALLOWED_JOB_IDS.has(d.jobTitle)) {
    errors.push({
      field: 'jobTitle',
      message: `유효하지 않은 직무입니다. 허용값: ${[...ALLOWED_JOB_IDS].join(', ')}`,
    })
  }

  // yearsOfExperience
  if (
    typeof d.yearsOfExperience !== 'number' ||
    !Number.isInteger(d.yearsOfExperience) ||
    d.yearsOfExperience < 0 ||
    d.yearsOfExperience > 30
  ) {
    errors.push({ field: 'yearsOfExperience', message: '경력 연수는 0~30 사이의 정수여야 합니다.' })
  }

  // skills
  if (
    !Array.isArray(d.skills) ||
    d.skills.length === 0 ||
    d.skills.length > MAX_SKILLS
  ) {
    errors.push({ field: 'skills', message: `기술 스택은 1~${MAX_SKILLS}개 사이여야 합니다.` })
  } else if (!d.skills.every((s) => typeof s === 'string' && s.trim().length > 0 && s.length <= 50)) {
    errors.push({ field: 'skills', message: '각 기술은 50자 이내의 비어있지 않은 문자열이어야 합니다.' })
  }

  // achievements (선택)
  if (d.achievements != null) {
    if (typeof d.achievements !== 'string' || d.achievements.length > MAX_ACHIEVEMENTS_LEN) {
      errors.push({ field: 'achievements', message: `주요 성과는 ${MAX_ACHIEVEMENTS_LEN}자 이내여야 합니다.` })
    }
  }

  // education
  if (typeof d.education !== 'string' || !ALLOWED_EDUCATION.has(d.education)) {
    errors.push({
      field: 'education',
      message: `유효하지 않은 학력입니다. 허용값: ${[...ALLOWED_EDUCATION].join(', ')}`,
    })
  }

  if (errors.length > 0) return { valid: false, errors }

  return {
    valid: true,
    input: {
      jobTitle: d.jobTitle as string,
      yearsOfExperience: d.yearsOfExperience as number,
      skills: (d.skills as string[]).map((s) => s.trim()),
      achievements: d.achievements != null ? (d.achievements as string) : null,
      education: d.education as string,
    },
  }
}

// ============================================================
// OpenAI Structured Outputs JSON Schema
// (analysis.ts의 ANALYSIS_OUTPUT_SCHEMA와 동기화)
// ============================================================

const ANALYSIS_OUTPUT_SCHEMA = {
  name: 'analysis_output',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      salaryRange: {
        type: 'object',
        properties: {
          min: { type: 'number', description: '연봉 최솟값 (만원, 세전)' },
          mid: { type: 'number', description: '연봉 중간값 (만원, 세전)' },
          max: { type: 'number', description: '연봉 최댓값 (만원, 세전)' },
        },
        required: ['min', 'mid', 'max'],
        additionalProperties: false,
      },
      companyTypes: {
        type: 'array',
        description: '기업 유형별 적합도. 반드시 startup, midsize, enterprise 3개를 모두 포함.',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['startup', 'midsize', 'enterprise'] },
            matchLevel: { type: 'string', enum: ['high', 'medium', 'low'] },
            description: { type: 'string', description: '해당 기업 유형과의 적합도 이유 (50자 이내)' },
          },
          required: ['type', 'matchLevel', 'description'],
          additionalProperties: false,
        },
      },
      strengths: {
        type: 'array',
        description: '핵심 경력 강점 3개',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '강점 제목 (20자 이내)' },
            description: { type: 'string', description: '강점 설명 (100자 이내)' },
            percentile: { type: 'number', description: '동일 직군 내 상위 몇 % (0=상위 1%, 100=하위)' },
          },
          required: ['title', 'description', 'percentile'],
          additionalProperties: false,
        },
      },
      sampleSize: { type: 'number', description: '분석에 사용된 가상 샘플 수 (500~5000 범위)' },
      confidenceScore: { type: 'number', description: '분석 신뢰도 0.0~1.0' },
    },
    required: ['salaryRange', 'companyTypes', 'strengths', 'sampleSize', 'confidenceScore'],
    additionalProperties: false,
  },
}

// ============================================================
// OpenAI API 호출
// ============================================================

async function callOpenAI(input: AnalysisInput, signal: AbortSignal): Promise<AnalysisOutput> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.')

  // achievements 비식별화 후 입력 구성
  const sanitizedInput: AnalysisInput = {
    ...input,
    achievements: input.achievements ? deidentifyText(input.achievements) : null,
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      response_format: {
        type: 'json_schema',
        json_schema: ANALYSIS_OUTPUT_SCHEMA,
      },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: buildUserPrompt(sanitizedInput),
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`OpenAI API 오류 (${response.status}): ${errorBody}`)
  }

  const json = await response.json()
  const content: string = json.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('OpenAI 응답에 content가 없습니다.')
  }

  return JSON.parse(content) as AnalysisOutput
}

// ============================================================
// 메인 핸들러
// ============================================================

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')

  // ── CORS preflight ──────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(origin) })
  }

  if (req.method !== 'POST') {
    return corsResponse(405, { error: 'Method Not Allowed' }, origin)
  }

  // ── Supabase 클라이언트 (service_role — RLS 우회하여 DB 쓰기) ──
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  // ── 1. JWT 인증 검증 ─────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return corsResponse(401, { error: '인증이 필요합니다.' }, origin)
  }

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return corsResponse(401, { error: '유효하지 않은 인증 토큰입니다.' }, origin)
  }

  const userId = user.id

  // ── 2. 구독 상태 확인 ────────────────────────────────────────
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_expires_at')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return corsResponse(500, { error: '프로필 조회에 실패했습니다.' }, origin)
  }

  const isPremium =
    profile.subscription_status === 'premium' &&
    (profile.subscription_expires_at === null ||
      new Date(profile.subscription_expires_at) > new Date())

  if (!isPremium) {
    return corsResponse(403, {
      error: '프리미엄 구독이 필요합니다.',
      code: 'SUBSCRIPTION_REQUIRED',
    }, origin)
  }

  // ── 3. 입력 유효성 검증 ──────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return corsResponse(400, { error: '요청 본문을 파싱할 수 없습니다. JSON 형식으로 전송해 주세요.' }, origin)
  }

  const validation = validateInput(body)
  if (!validation.valid) {
    return corsResponse(400, { error: '입력 검증 실패', fieldErrors: validation.errors }, origin)
  }

  const input = validation.input

  // ── 4. analysis_requests 레코드 생성 (processing) ───────────
  const { data: requestRecord, error: insertError } = await supabase
    .from('analysis_requests')
    .insert({
      user_id: userId,
      job_title: input.jobTitle,
      years_of_experience: input.yearsOfExperience,
      skills: input.skills,
      achievements: input.achievements ?? null,
      education: input.education,
      status: 'processing',
    })
    .select('id')
    .single()

  if (insertError || !requestRecord) {
    console.error('[analyze-market-value] analysis_requests insert 실패:', insertError)
    return corsResponse(500, { error: '분석 요청 생성에 실패했습니다.' }, origin)
  }

  const requestId: string = requestRecord.id

  // 요청 상태를 'failed'로 업데이트하는 헬퍼
  const markFailed = async () => {
    await supabase
      .from('analysis_requests')
      .update({ status: 'failed' })
      .eq('id', requestId)
  }

  // ── 5. OpenAI 호출 (30초 타임아웃, 실패 시 1회 재시도) ──────
  let analysisResult: AnalysisOutput | null = null

  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS)

    try {
      analysisResult = await callOpenAI(input, controller.signal)
      clearTimeout(timeoutId)
      break // 성공
    } catch (err) {
      clearTimeout(timeoutId)

      const isAborted = err instanceof Error && err.name === 'AbortError'
      const isLastAttempt = attempt === 2

      if (isAborted) {
        console.error(`[analyze-market-value] OpenAI 타임아웃 (attempt ${attempt})`)
        if (isLastAttempt) {
          await markFailed()
          return corsResponse(504, {
            error: 'AI 분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
            requestId,
          }, origin)
        }
      } else if (err instanceof SyntaxError) {
        // JSON 파싱 실패
        console.error(`[analyze-market-value] JSON 파싱 실패 (attempt ${attempt}):`, err)
        if (isLastAttempt) {
          await markFailed()
          return corsResponse(502, {
            error: 'AI 응답 파싱에 실패했습니다. 잠시 후 다시 시도해 주세요.',
            requestId,
          }, origin)
        }
      } else {
        // 기타 오류 — 재시도 불필요
        console.error(`[analyze-market-value] OpenAI 호출 오류:`, err)
        await markFailed()
        return corsResponse(502, {
          error: 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
          requestId,
        }, origin)
      }
    }
  }

  if (!analysisResult) {
    await markFailed()
    return corsResponse(500, { error: '분석 결과를 가져오지 못했습니다.', requestId }, origin)
  }

  // ── 6. analysis_results 레코드 생성 ─────────────────────────
  const { data: resultRecord, error: resultInsertError } = await supabase
    .from('analysis_results')
    .insert({
      request_id: requestId,
      user_id: userId,
      salary_min: Math.round(analysisResult.salaryRange.min),
      salary_mid: Math.round(analysisResult.salaryRange.mid),
      salary_max: Math.round(analysisResult.salaryRange.max),
      company_types: analysisResult.companyTypes,
      strengths: analysisResult.strengths,
      sample_size: analysisResult.sampleSize,
      confidence_score: analysisResult.confidenceScore,
      raw_response: analysisResult,
    })
    .select('id')
    .single()

  if (resultInsertError || !resultRecord) {
    console.error('[analyze-market-value] analysis_results insert 실패:', resultInsertError)
    await markFailed()
    return corsResponse(500, { error: '분석 결과 저장에 실패했습니다.', requestId }, origin)
  }

  // ── 7. analysis_requests status → 'completed' ───────────────
  const { error: updateError } = await supabase
    .from('analysis_requests')
    .update({ status: 'completed' })
    .eq('id', requestId)

  if (updateError) {
    // 결과는 저장됐으니 에러 로그만 남기고 계속 진행
    console.error('[analyze-market-value] status completed 업데이트 실패:', updateError)
  }

  // ── 8. 결과 반환 ─────────────────────────────────────────────
  return corsResponse(200, {
    requestId,
    resultId: resultRecord.id,
    salaryRange: {
      min: Math.round(analysisResult.salaryRange.min),
      mid: Math.round(analysisResult.salaryRange.mid),
      max: Math.round(analysisResult.salaryRange.max),
    },
    companyTypes: analysisResult.companyTypes,
    strengths: analysisResult.strengths,
    sampleSize: analysisResult.sampleSize,
    confidenceScore: analysisResult.confidenceScore,
  }, origin)
})
