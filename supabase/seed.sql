-- ============================================================
-- 커리어스프링 시드 데이터
-- 대상: 로컬 개발 및 E2E 테스트
--
-- 포함 내용:
--   1. pgcrypto 확장
--   2. 테스트 사용자 3명 (auth.users → profiles 트리거 자동 생성)
--   3. 프로필 구독 상태 업데이트 (premium 1명)
--   4. 분석 요청 16건 (전 직무 커버)
--   5. 분석 결과 16건 (직무별 현실적 연봉 데이터)
--   6. 결제 내역 1건 (premium 사용자)
--   7. 피드백 4건
--
-- 테스트 계정:
--   free@career-spring.dev    / Test1234!  (무료)
--   premium@career-spring.dev / Test1234!  (프리미엄)
--   demo@career-spring.dev    / Test1234!  (무료, 다직무 테스트)
-- ============================================================

-- ============================================================
-- 0. 필수 확장
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. 테스트 사용자 (auth.users)
--    → on_auth_user_created 트리거로 profiles 자동 생성
-- ============================================================

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES
-- 무료 사용자
(
  'seed0001-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'free@career-spring.dev',
  crypt('Test1234!', gen_salt('bf', 10)),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"김지원"}',
  now() - interval '30 days',
  now() - interval '30 days',
  '', '', '', ''
),
-- 프리미엄 사용자
(
  'seed0002-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'premium@career-spring.dev',
  crypt('Test1234!', gen_salt('bf', 10)),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"이서연","is_premium":true}',
  now() - interval '60 days',
  now() - interval '60 days',
  '', '', '', ''
),
-- 데모 사용자
(
  'seed0003-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo@career-spring.dev',
  crypt('Test1234!', gen_salt('bf', 10)),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"박민준"}',
  now() - interval '7 days',
  now() - interval '7 days',
  '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. 프로필 구독 상태 업데이트 (premium 사용자)
-- ============================================================

UPDATE public.profiles
SET
  subscription_status      = 'premium',
  subscription_started_at  = now() - interval '30 days',
  subscription_expires_at  = now() + interval '335 days'
WHERE id = 'seed0002-0000-0000-0000-000000000002';

-- ============================================================
-- 3. 분석 요청 (16개 직무 전체)
--    user_id 분배:
--      seed0001 → IT 개발 7개
--      seed0002 → 기획 4개 + UI/UX
--      seed0003 → 그래픽, BX, 퍼포먼스마케팅, 콘텐츠마케팅
-- ============================================================

INSERT INTO public.analysis_requests (
  id, user_id, job_title, years_of_experience, skills, achievements, education, status, created_at
) VALUES

-- ── IT 개발 ──────────────────────────────────────────────────

-- 프론트엔드 (3년)
(
  'req00001-0000-0000-0000-000000000001',
  'seed0001-0000-0000-0000-000000000001',
  'frontend', 3,
  ARRAY['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
  'MAU 50만 이커머스 사이트 성능 개선 (LCP 4.2s → 1.8s), 컴포넌트 라이브러리 구축으로 개발 생산성 40% 향상',
  '컴퓨터공학 학사',
  'completed',
  now() - interval '25 days'
),

-- 백엔드 (5년)
(
  'req00002-0000-0000-0000-000000000002',
  'seed0001-0000-0000-0000-000000000001',
  'backend', 5,
  ARRAY['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Kafka', 'Docker'],
  '일 거래량 100만 건 처리 결제 시스템 설계 및 운영, MSA 전환으로 배포 주기 2주 → 1일로 단축',
  '소프트웨어공학 학사',
  'completed',
  now() - interval '20 days'
),

-- 풀스택 (2년)
(
  'req00003-0000-0000-0000-000000000003',
  'seed0001-0000-0000-0000-000000000001',
  'fullstack', 2,
  ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
  'SaaS 대시보드 신규 기능 3개 독립 개발, CI/CD 파이프라인 구축',
  '정보통신 학사',
  'completed',
  now() - interval '18 days'
),

-- 모바일 (4년)
(
  'req00004-0000-0000-0000-000000000004',
  'seed0001-0000-0000-0000-000000000001',
  'mobile', 4,
  ARRAY['Flutter', 'Dart', 'Swift', 'Kotlin', 'Firebase'],
  '앱스토어 평점 4.8 핀테크 앱 개발, 앱 크래시율 2.1% → 0.3% 개선',
  '컴퓨터공학 학사',
  'completed',
  now() - interval '15 days'
),

-- 데이터/ML (7년)
(
  'req00005-0000-0000-0000-000000000005',
  'seed0001-0000-0000-0000-000000000001',
  'data_ml', 7,
  ARRAY['Python', 'PyTorch', 'Spark', 'Airflow', 'Kubernetes', 'MLflow'],
  '추천 시스템 구축으로 클릭률 35% 향상, 데이터 파이프라인 처리 비용 60% 절감, 논문 2편 게재',
  '통계학 석사',
  'completed',
  now() - interval '12 days'
),

-- DevOps (3년)
(
  'req00006-0000-0000-0000-000000000006',
  'seed0001-0000-0000-0000-000000000001',
  'devops', 3,
  ARRAY['Kubernetes', 'Terraform', 'AWS', 'GitHub Actions', 'Prometheus', 'Grafana'],
  '멀티 리전 EKS 클러스터 운영 (노드 200+), 장애 감지 시간 15분 → 2분으로 단축',
  '컴퓨터공학 학사',
  'completed',
  now() - interval '10 days'
),

-- 보안 (6년)
(
  'req00007-0000-0000-0000-000000000007',
  'seed0001-0000-0000-0000-000000000001',
  'security', 6,
  ARRAY['penetration testing', 'SIEM', 'Zero Trust', 'AWS Security', 'ISO27001'],
  'ISMS-P 인증 획득 주도, 침투 테스트로 Critical 취약점 12건 발굴 및 조치',
  '정보보안 학사, CISSP',
  'completed',
  now() - interval '8 days'
),

-- ── 기획 ─────────────────────────────────────────────────────

-- 서비스기획 (4년)
(
  'req00008-0000-0000-0000-000000000008',
  'seed0002-0000-0000-0000-000000000002',
  'service_planning', 4,
  ARRAY['Figma', 'Jira', '데이터 분석', 'A/B 테스트', 'SQL'],
  '신규 구독 서비스 기획·출시 (출시 6개월 내 MAU 30만 달성), 핵심 기능 A/B 테스트로 전환율 22% 개선',
  '경영학 학사',
  'completed',
  now() - interval '22 days'
),

-- PM (5년)
(
  'req00009-0000-0000-0000-000000000009',
  'seed0002-0000-0000-0000-000000000002',
  'pm', 5,
  ARRAY['로드맵 기획', 'OKR', 'Jira', 'SQL', '사용자 인터뷰', 'GTM'],
  '커머스 앱 PMF 달성 주도 (GMV 분기 150억 달성), 크로스펑셔널 팀 8명 리드',
  '산업공학 학사',
  'completed',
  now() - interval '19 days'
),

-- PO (4년)
(
  'req00010-0000-0000-0000-000000000010',
  'seed0002-0000-0000-0000-000000000002',
  'po', 4,
  ARRAY['Product Discovery', 'OKR', 'Agile', '데이터 분석', 'Amplitude'],
  '핵심 피처 발굴부터 출시까지 전 사이클 주도, NPS 12점 → 38점 개선',
  '경영학 학사',
  'completed',
  now() - interval '16 days'
),

-- 사업기획 (2년)
(
  'req00011-0000-0000-0000-000000000011',
  'seed0002-0000-0000-0000-000000000002',
  'biz_planning', 2,
  ARRAY['재무 모델링', 'Excel', 'PPT', '시장 조사', 'SQL'],
  '신사업 타당성 검토 보고서 3건 작성, 파트너십 협상 2건 성사',
  '경영학 학사',
  'completed',
  now() - interval '14 days'
),

-- UI/UX (3년)
(
  'req00012-0000-0000-0000-000000000012',
  'seed0002-0000-0000-0000-000000000002',
  'ui_ux', 3,
  ARRAY['Figma', 'Prototyping', '사용자 리서치', 'Usability Test', 'Design System'],
  '핀테크 앱 리디자인 (사용자 이탈률 31% 감소), 디자인 시스템 구축으로 개발 협업 효율 50% 향상',
  '시각디자인 학사',
  'completed',
  now() - interval '11 days'
),

-- ── 디자인 ───────────────────────────────────────────────────

-- 그래픽 (5년)
(
  'req00013-0000-0000-0000-000000000013',
  'seed0003-0000-0000-0000-000000000003',
  'graphic', 5,
  ARRAY['Photoshop', 'Illustrator', 'After Effects', '타이포그래피', '인쇄 편집'],
  '연간 캠페인 비주얼 20개 이상 제작, 광고 소재 CTR 업계 평균 2.3배 달성',
  '시각디자인 학사',
  'completed',
  now() - interval '6 days'
),

-- BX (4년)
(
  'req00014-0000-0000-0000-000000000014',
  'seed0003-0000-0000-0000-000000000003',
  'bx', 4,
  ARRAY['Brand Identity', 'Figma', '브랜드 전략', 'Motion Design', '포토그래피'],
  '스타트업 BI 리뉴얼 3건 주도, 리브랜딩 후 브랜드 인지도 조사 41%p 상승',
  '산업디자인 학사',
  'completed',
  now() - interval '5 days'
),

-- ── 마케팅 ───────────────────────────────────────────────────

-- 퍼포먼스마케팅 (3년)
(
  'req00015-0000-0000-0000-000000000015',
  'seed0003-0000-0000-0000-000000000003',
  'performance_marketing', 3,
  ARRAY['Google Ads', 'Meta Ads', 'GA4', 'SQL', 'A/B 테스트', 'CRM'],
  '월 광고비 5억 집행 최적화 (ROAS 340% 달성), 앱 설치 CPI 40% 절감',
  '경영학 학사',
  'completed',
  now() - interval '3 days'
),

-- 콘텐츠마케팅 (2년)
(
  'req00016-0000-0000-0000-000000000016',
  'seed0003-0000-0000-0000-000000000003',
  'content_marketing', 2,
  ARRAY['콘텐츠 기획', 'SEO', 'SNS 운영', 'Copywriting', 'GA4'],
  '브랜드 블로그 월 방문자 500명 → 3만 명 성장, 인스타그램 팔로워 0 → 8만 달성',
  '신문방송학 학사',
  'completed',
  now() - interval '1 days'
);

-- ============================================================
-- 4. 분석 결과 (16건, 직무별 현실적 연봉 데이터)
--    salary 단위: 만원
--    company_types: [{type, match_level, description}]
--    strengths:     [{title, description, percentile}]
-- ============================================================

INSERT INTO public.analysis_results (
  id, request_id, user_id,
  salary_min, salary_mid, salary_max,
  company_types, strengths,
  sample_size, confidence_score, created_at
) VALUES

-- ── 프론트엔드 3년 ───────────────────────────────────────────
(
  'res00001-0000-0000-0000-000000000001',
  'req00001-0000-0000-0000-000000000001',
  'seed0001-0000-0000-0000-000000000001',
  4200, 5500, 7000,
  '[
    {"type":"startup","match_level":"high","description":"빠른 제품 이터레이션과 성능 중시 문화에 잘 맞습니다."},
    {"type":"midsize","match_level":"high","description":"안정적 스택과 코드 품질을 중시하는 환경에 적합합니다."},
    {"type":"enterprise","match_level":"medium","description":"대형 레거시 마이그레이션 경험이 보완되면 더욱 유리합니다."}
  ]'::jsonb,
  '[
    {"title":"React 생태계 전문성","description":"React·Next.js 기반 프로젝트 경험이 상위 15% 수준입니다.","percentile":15},
    {"title":"성능 최적화 역량","description":"LCP 개선 성과가 동일 연차 대비 상위 10%에 해당합니다.","percentile":10},
    {"title":"TypeScript 활용","description":"타입 안전성 확보 경험이 신뢰도 향상에 기여합니다.","percentile":22}
  ]'::jsonb,
  1240, 0.85,
  now() - interval '25 days'
),

-- ── 백엔드 5년 ───────────────────────────────────────────────
(
  'res00002-0000-0000-0000-000000000002',
  'req00002-0000-0000-0000-000000000002',
  'seed0001-0000-0000-0000-000000000001',
  6500, 8500, 11000,
  '[
    {"type":"startup","match_level":"medium","description":"스케일업 단계 스타트업에서 시스템 설계 역량을 발휘하기 적합합니다."},
    {"type":"midsize","match_level":"high","description":"MSA 운영 경험이 중견 기업 환경에서 높은 가치를 발휘합니다."},
    {"type":"enterprise","match_level":"high","description":"대용량 트랜잭션 처리 경험이 금융·커머스 대기업에서 경쟁력입니다."}
  ]'::jsonb,
  '[
    {"title":"대용량 시스템 설계","description":"일 100만 건 결제 처리 경험이 동일 연차 상위 8% 수준입니다.","percentile":8},
    {"title":"MSA 아키텍처 전환","description":"모놀리스 → MSA 전환 주도 경험이 차별화 강점입니다.","percentile":12},
    {"title":"Kafka 활용","description":"이벤트 기반 아키텍처 실무 경험자 중 상위 20%입니다.","percentile":20}
  ]'::jsonb,
  1580, 0.91,
  now() - interval '20 days'
),

-- ── 풀스택 2년 ───────────────────────────────────────────────
(
  'res00003-0000-0000-0000-000000000003',
  'req00003-0000-0000-0000-000000000003',
  'seed0001-0000-0000-0000-000000000001',
  4000, 5200, 6800,
  '[
    {"type":"startup","match_level":"high","description":"소규모 팀에서 풀스택으로 빠르게 제품을 만드는 환경에 최적입니다."},
    {"type":"midsize","match_level":"medium","description":"프론트엔드 또는 백엔드 한 축을 더 심화하면 경쟁력이 높아집니다."},
    {"type":"enterprise","match_level":"low","description":"역할 분리가 명확한 대기업보다는 애자일 조직이 더 맞습니다."}
  ]'::jsonb,
  '[
    {"title":"프론트-백 독립 개발","description":"기능 전체를 혼자 구현한 경험이 소규모 팀에서 강점입니다.","percentile":25},
    {"title":"CI/CD 파이프라인 구축","description":"DevOps 자동화 경험이 동일 연차 대비 상위 30%입니다.","percentile":30},
    {"title":"AWS 클라우드 활용","description":"클라우드 기반 배포 경험이 실무 즉시 투입에 유리합니다.","percentile":28}
  ]'::jsonb,
  870, 0.78,
  now() - interval '18 days'
),

-- ── 모바일 4년 ───────────────────────────────────────────────
(
  'res00004-0000-0000-0000-000000000004',
  'req00004-0000-0000-0000-000000000004',
  'seed0001-0000-0000-0000-000000000001',
  5000, 6800, 8800,
  '[
    {"type":"startup","match_level":"high","description":"Flutter 크로스플랫폼 경험으로 작은 팀에서 iOS/Android 동시 대응 가능합니다."},
    {"type":"midsize","match_level":"high","description":"핀테크 앱 품질 관리 경험이 중견 금융·핀테크 기업에서 높이 평가됩니다."},
    {"type":"enterprise","match_level":"medium","description":"Native 네이티브 경험을 보완하면 대기업 금융·커머스 앱 팀에 적합합니다."}
  ]'::jsonb,
  '[
    {"title":"Flutter 크로스플랫폼","description":"Flutter 실무 경험자 중 상위 18%에 해당하는 수준입니다.","percentile":18},
    {"title":"앱 안정성 개선","description":"크래시율 0.3% 달성이 업계 최상위 10% 품질입니다.","percentile":10},
    {"title":"핀테크 도메인 이해","description":"금융 규제·보안 요건 이해가 핀테크 이직 시 강점입니다.","percentile":20}
  ]'::jsonb,
  960, 0.83,
  now() - interval '15 days'
),

-- ── 데이터/ML 7년 ────────────────────────────────────────────
(
  'res00005-0000-0000-0000-000000000005',
  'req00005-0000-0000-0000-000000000005',
  'seed0001-0000-0000-0000-000000000001',
  8000, 11000, 15000,
  '[
    {"type":"startup","match_level":"medium","description":"시니어 ML 엔지니어로 AI 제품화에 집중하는 Series B 이상 스타트업에 적합합니다."},
    {"type":"midsize","match_level":"high","description":"MLOps 파이프라인 구축 경험이 중견 테크 기업에서 매우 높은 가치입니다."},
    {"type":"enterprise","match_level":"high","description":"논문 게재 이력과 Spark 대규모 데이터 처리 경험이 빅테크·금융권에서 최상급 평가를 받습니다."}
  ]'::jsonb,
  '[
    {"title":"추천 시스템 성과","description":"클릭률 35% 향상 경험이 ML 엔지니어 상위 7%에 해당합니다.","percentile":7},
    {"title":"MLOps 파이프라인","description":"Airflow·MLflow 기반 전체 ML 사이클 관리 경험이 차별화 강점입니다.","percentile":11},
    {"title":"논문 게재 이력","description":"실무와 연구를 병행한 이력이 AI 전문성을 증명합니다.","percentile":14}
  ]'::jsonb,
  720, 0.88,
  now() - interval '12 days'
),

-- ── DevOps 3년 ───────────────────────────────────────────────
(
  'res00006-0000-0000-0000-000000000006',
  'req00006-0000-0000-0000-000000000006',
  'seed0001-0000-0000-0000-000000000001',
  5000, 7000, 9200,
  '[
    {"type":"startup","match_level":"medium","description":"멀티 리전 쿠버네티스 경험이 빠른 인프라 확장이 필요한 스타트업에 유용합니다."},
    {"type":"midsize","match_level":"high","description":"Terraform IaC와 모니터링 체계가 안정 운영 중인 중견 기업에 최적입니다."},
    {"type":"enterprise","match_level":"high","description":"200+ 노드 클러스터 운영 경험이 대규모 엔터프라이즈 인프라에서 경쟁력입니다."}
  ]'::jsonb,
  '[
    {"title":"Kubernetes 운영 규모","description":"노드 200+ 클러스터 운영 경험이 DevOps 3년차 중 상위 12%입니다.","percentile":12},
    {"title":"장애 감지 단축","description":"장애 감지 시간 2분 달성이 SRE 역량 상위 15%에 해당합니다.","percentile":15},
    {"title":"IaC 숙련도","description":"Terraform으로 인프라 전체를 코드화한 경험이 표준화 역량을 증명합니다.","percentile":18}
  ]'::jsonb,
  1050, 0.86,
  now() - interval '10 days'
),

-- ── 보안 6년 ─────────────────────────────────────────────────
(
  'res00007-0000-0000-0000-000000000007',
  'req00007-0000-0000-0000-000000000007',
  'seed0001-0000-0000-0000-000000000001',
  6500, 8500, 11500,
  '[
    {"type":"startup","match_level":"low","description":"보안 컴플라이언스 전문성은 스타트업보다 규제 산업 기업에서 더 높은 가치를 인정받습니다."},
    {"type":"midsize","match_level":"high","description":"ISMS-P 인증 주도 경험이 컴플라이언스 요건이 있는 중견 기업에서 핵심 역량입니다."},
    {"type":"enterprise","match_level":"high","description":"CISSP 자격증과 침투 테스트 경험이 금융·공공 대기업에서 최상위 평가를 받습니다."}
  ]'::jsonb,
  '[
    {"title":"침투 테스트 전문성","description":"Critical 취약점 12건 발굴 이력이 보안 6년차 상위 9%입니다.","percentile":9},
    {"title":"ISMS-P 인증 주도","description":"인증 획득 경험이 컴플라이언스 보안 전문가로서 희소성을 증명합니다.","percentile":13},
    {"title":"CISSP 자격증","description":"국제 자격증 보유가 보안 전문가 신뢰도를 크게 높입니다.","percentile":16}
  ]'::jsonb,
  640, 0.82,
  now() - interval '8 days'
),

-- ── 서비스기획 4년 ───────────────────────────────────────────
(
  'res00008-0000-0000-0000-000000000008',
  'req00008-0000-0000-0000-000000000008',
  'seed0002-0000-0000-0000-000000000002',
  4500, 6000, 7800,
  '[
    {"type":"startup","match_level":"high","description":"제품 초기 기획부터 PMF 탐색까지 전 과정을 경험한 역량이 스타트업에 적합합니다."},
    {"type":"midsize","match_level":"high","description":"SQL 분석과 A/B 테스트 기반 의사결정 경험이 데이터 중심 중견 기업에서 강점입니다."},
    {"type":"enterprise","match_level":"medium","description":"대규모 조직의 이해관계자 조율 경험을 쌓으면 대기업 포지션 경쟁력이 높아집니다."}
  ]'::jsonb,
  '[
    {"title":"데이터 기반 기획","description":"SQL·A/B 테스트 활용 기획 경험이 서비스기획자 중 상위 20%입니다.","percentile":20},
    {"title":"구독 서비스 론칭","description":"MAU 30만 신규 서비스 출시 성과가 동일 연차 대비 상위 15%입니다.","percentile":15},
    {"title":"전환율 개선 성과","description":"22% 전환율 개선 경험이 실행력 있는 기획자임을 증명합니다.","percentile":18}
  ]'::jsonb,
  1120, 0.84,
  now() - interval '22 days'
),

-- ── PM 5년 ───────────────────────────────────────────────────
(
  'res00009-0000-0000-0000-000000000009',
  'req00009-0000-0000-0000-000000000009',
  'seed0002-0000-0000-0000-000000000002',
  6000, 8000, 10800,
  '[
    {"type":"startup","match_level":"medium","description":"Series B 이상에서 GTM 전략과 팀 리드 경험이 빛을 발합니다."},
    {"type":"midsize","match_level":"high","description":"OKR·로드맵 체계 경험이 구조화된 중견 테크 기업에서 최적으로 발휘됩니다."},
    {"type":"enterprise","match_level":"high","description":"GMV 150억 달성 성과와 크로스펑셔널 리드 경험이 대형 커머스·플랫폼 기업에서 높이 평가됩니다."}
  ]'::jsonb,
  '[
    {"title":"GMV 달성 성과","description":"분기 GMV 150억 달성 경험이 PM 5년차 중 상위 10%입니다.","percentile":10},
    {"title":"크로스펑셔널 리드","description":"8인 팀 리드 경험이 리더십 역량을 증명합니다.","percentile":17},
    {"title":"GTM 전략 수립","description":"제품 출시부터 시장 확장까지 전 과정 경험이 차별화 강점입니다.","percentile":13}
  ]'::jsonb,
  980, 0.87,
  now() - interval '19 days'
),

-- ── PO 4년 ───────────────────────────────────────────────────
(
  'res00010-0000-0000-0000-000000000010',
  'req00010-0000-0000-0000-000000000010',
  'seed0002-0000-0000-0000-000000000002',
  5500, 7500, 9800,
  '[
    {"type":"startup","match_level":"high","description":"Product Discovery와 Agile 기반 빠른 실험 문화에 완벽하게 맞습니다."},
    {"type":"midsize","match_level":"high","description":"NPS 개선 성과와 Amplitude 활용 역량이 데이터 드리븐 중견 기업에서 강점입니다."},
    {"type":"enterprise","match_level":"medium","description":"대규모 조직의 이해관계자 관리 경험을 보완하면 대기업 PO로도 경쟁력 있습니다."}
  ]'::jsonb,
  '[
    {"title":"NPS 개선 성과","description":"NPS 26점 상승 달성이 PO 4년차 상위 12%에 해당합니다.","percentile":12},
    {"title":"Product Discovery","description":"사용자 인사이트 발굴부터 우선순위화까지 전 과정 역량이 탁월합니다.","percentile":16},
    {"title":"Amplitude 활용","description":"행동 데이터 분석 기반 의사결정 역량이 데이터 PO 상위 22%입니다.","percentile":22}
  ]'::jsonb,
  890, 0.83,
  now() - interval '16 days'
),

-- ── 사업기획 2년 ─────────────────────────────────────────────
(
  'res00011-0000-0000-0000-000000000011',
  'req00011-0000-0000-0000-000000000011',
  'seed0002-0000-0000-0000-000000000002',
  3800, 5200, 6800,
  '[
    {"type":"startup","match_level":"medium","description":"재무 모델링과 파트너십 협상 경험이 성장 스타트업에서 활용 가능합니다."},
    {"type":"midsize","match_level":"high","description":"신사업 타당성 검토 경험이 전략 기능이 중요한 중견 기업에서 강점입니다."},
    {"type":"enterprise","match_level":"high","description":"재무 분석과 보고서 작성 역량이 전략기획·BM 팀에서 높이 평가됩니다."}
  ]'::jsonb,
  '[
    {"title":"재무 모델링","description":"Excel 기반 재무 모델 구축 역량이 사업기획 2년차 상위 25%입니다.","percentile":25},
    {"title":"파트너십 협상","description":"2건 파트너십 성사 이력이 실행력 있는 기획자임을 증명합니다.","percentile":28},
    {"title":"신사업 타당성 분석","description":"3건 보고서 작성 경험이 전략적 사고를 증명합니다.","percentile":30}
  ]'::jsonb,
  760, 0.76,
  now() - interval '14 days'
),

-- ── UI/UX 3년 ────────────────────────────────────────────────
(
  'res00012-0000-0000-0000-000000000012',
  'req00012-0000-0000-0000-000000000012',
  'seed0002-0000-0000-0000-000000000002',
  3800, 5200, 6800,
  '[
    {"type":"startup","match_level":"high","description":"리서치 기반 빠른 디자인 결정 능력이 제품 중심 스타트업에 최적입니다."},
    {"type":"midsize","match_level":"high","description":"디자인 시스템 구축 경험이 개발 협업 체계가 중요한 중견 기업에서 강점입니다."},
    {"type":"enterprise","match_level":"medium","description":"대규모 서비스 리디자인 경험을 추가하면 대기업 UX 팀에서도 경쟁력 있습니다."}
  ]'::jsonb,
  '[
    {"title":"이탈률 개선 성과","description":"31% 이탈률 감소 달성이 UX 3년차 상위 13%에 해당합니다.","percentile":13},
    {"title":"디자인 시스템 구축","description":"시스템 구축 경험자가 희소하여 상위 20% 경쟁력을 확보합니다.","percentile":20},
    {"title":"사용자 리서치","description":"정성·정량 리서치를 모두 수행한 경험이 인사이트 도출 역량을 증명합니다.","percentile":24}
  ]'::jsonb,
  1030, 0.81,
  now() - interval '11 days'
),

-- ── 그래픽 5년 ───────────────────────────────────────────────
(
  'res00013-0000-0000-0000-000000000013',
  'req00013-0000-0000-0000-000000000013',
  'seed0003-0000-0000-0000-000000000003',
  4000, 5500, 7200,
  '[
    {"type":"startup","match_level":"medium","description":"브랜드 캠페인 제작 경험이 마케팅 중심 스타트업에서 활용됩니다."},
    {"type":"midsize","match_level":"high","description":"광고 소재 성과(CTR 2.3배)가 마케팅팀이 있는 중견 기업에서 핵심 역량입니다."},
    {"type":"enterprise","match_level":"high","description":"연간 20+ 캠페인 제작 경험과 인쇄 편집 역량이 대기업 콘텐츠팀에서 적합합니다."}
  ]'::jsonb,
  '[
    {"title":"광고 소재 성과","description":"CTR 업계 평균 2.3배 달성이 그래픽 5년차 상위 15%입니다.","percentile":15},
    {"title":"캠페인 볼륨","description":"연간 20+ 캠페인 제작 경험이 높은 생산성을 증명합니다.","percentile":20},
    {"title":"모션 디자인","description":"After Effects 활용 역량이 멀티미디어 역량을 강화합니다.","percentile":23}
  ]'::jsonb,
  580, 0.75,
  now() - interval '6 days'
),

-- ── BX 4년 ───────────────────────────────────────────────────
(
  'res00014-0000-0000-0000-000000000014',
  'req00014-0000-0000-0000-000000000014',
  'seed0003-0000-0000-0000-000000000003',
  4500, 6000, 7800,
  '[
    {"type":"startup","match_level":"high","description":"BI 구축 경험이 브랜드 정체성을 확립하려는 스타트업에서 최고의 가치를 발휘합니다."},
    {"type":"midsize","match_level":"high","description":"리브랜딩 성과(인지도 41%p 상승)가 중견 기업 브랜드팀에서 핵심 역량입니다."},
    {"type":"enterprise","match_level":"medium","description":"대기업 브랜드 가이드라인 운영 경험을 추가하면 대기업 BX팀에서도 경쟁력 있습니다."}
  ]'::jsonb,
  '[
    {"title":"BI 리뉴얼 주도","description":"3건 리브랜딩 경험이 BX 4년차 상위 17%에 해당합니다.","percentile":17},
    {"title":"브랜드 인지도 성과","description":"41%p 인지도 상승 성과가 측정 가능한 BX 임팩트로 차별화됩니다.","percentile":14},
    {"title":"Motion Design","description":"모션 디자인 역량이 디지털 브랜딩에서 경쟁 우위를 제공합니다.","percentile":21}
  ]'::jsonb,
  490, 0.77,
  now() - interval '5 days'
),

-- ── 퍼포먼스마케팅 3년 ───────────────────────────────────────
(
  'res00015-0000-0000-0000-000000000015',
  'req00015-0000-0000-0000-000000000015',
  'seed0003-0000-0000-0000-000000000003',
  4000, 5600, 7500,
  '[
    {"type":"startup","match_level":"high","description":"월 5억 광고비 집행 경험과 ROAS 최적화 역량이 그로스 스타트업에서 최적입니다."},
    {"type":"midsize","match_level":"high","description":"CRM 연동 퍼널 최적화 경험이 중견 커머스·앱 기업에서 강점입니다."},
    {"type":"enterprise","match_level":"medium","description":"대규모 예산 집행 경험을 보완하면 대기업 그로스팀에서도 경쟁력 있습니다."}
  ]'::jsonb,
  '[
    {"title":"ROAS 340% 달성","description":"광고 효율 성과가 퍼포먼스마케터 3년차 상위 11%입니다.","percentile":11},
    {"title":"CPI 40% 절감","description":"앱 설치 비용 최적화 성과가 모바일 마케팅 전문성을 증명합니다.","percentile":16},
    {"title":"대규모 예산 집행","description":"월 5억 집행 경험이 채용 시 신뢰도를 높입니다.","percentile":19}
  ]'::jsonb,
  1180, 0.86,
  now() - interval '3 days'
),

-- ── 콘텐츠마케팅 2년 ─────────────────────────────────────────
(
  'res00016-0000-0000-0000-000000000016',
  'req00016-0000-0000-0000-000000000016',
  'seed0003-0000-0000-0000-000000000003',
  3200, 4500, 6000,
  '[
    {"type":"startup","match_level":"high","description":"단기간 오가닉 채널 성장 이력이 콘텐츠 마케팅 중심 스타트업에 최적입니다."},
    {"type":"midsize","match_level":"high","description":"SEO 기반 블로그 성장 경험이 인바운드 마케팅 전략을 중시하는 중견 기업에 적합합니다."},
    {"type":"enterprise","match_level":"low","description":"대기업 마케팅팀은 전문 채널 운영자를 선호하므로 채널 특화를 추천드립니다."}
  ]'::jsonb,
  '[
    {"title":"오가닉 채널 성장","description":"블로그 60배 성장 달성이 콘텐츠마케터 2년차 상위 8%입니다.","percentile":8},
    {"title":"SNS 팔로워 구축","description":"인스타그램 0 → 8만 달성이 커뮤니티 빌딩 역량을 증명합니다.","percentile":12},
    {"title":"SEO 전략 실행","description":"검색 유입 극대화 경험이 인바운드 마케팅 전문성을 높입니다.","percentile":18}
  ]'::jsonb,
  820, 0.80,
  now() - interval '1 days'
);

-- ============================================================
-- 5. 결제 내역 (premium 사용자의 구독 결제)
-- ============================================================

INSERT INTO public.payments (
  id, user_id, payment_key, order_id, amount, status, billing_key, created_at
) VALUES
(
  'pay00001-0000-0000-0000-000000000001',
  'seed0002-0000-0000-0000-000000000002',
  'tgen_20260120_seed_payment_key_001',
  'order-seed-20260120-000001',
  9900,
  'confirmed',
  'bkey_seed_20260120_billing_001',
  now() - interval '30 days'
),
(
  'pay00002-0000-0000-0000-000000000002',
  'seed0002-0000-0000-0000-000000000002',
  'tgen_20260220_seed_payment_key_002',
  'order-seed-20260220-000002',
  9900,
  'confirmed',
  'bkey_seed_20260120_billing_001',
  now() - interval '0 days'
);

-- ============================================================
-- 6. 피드백 (일부 분석 결과에 대한 사용자 반응)
-- ============================================================

INSERT INTO public.feedback (
  id, user_id, result_id, rating, comment, created_at
) VALUES
(
  'fb000001-0000-0000-0000-000000000001',
  'seed0001-0000-0000-0000-000000000001',
  'res00001-0000-0000-0000-000000000001',
  'positive',
  '제 경력과 연봉 시장 분석이 정확했습니다. 강점 설명도 구체적이어서 면접 준비에 도움이 됐어요.',
  now() - interval '24 days'
),
(
  'fb000002-0000-0000-0000-000000000002',
  'seed0001-0000-0000-0000-000000000001',
  'res00002-0000-0000-0000-000000000002',
  'positive',
  '예상 연봉 범위가 실제 오퍼와 거의 비슷했습니다. 회사 유형 매칭도 유용했어요.',
  now() - interval '19 days'
),
(
  'fb000003-0000-0000-0000-000000000003',
  'seed0002-0000-0000-0000-000000000002',
  'res00008-0000-0000-0000-000000000008',
  'positive',
  '데이터 기반 기획 강점을 짚어줘서 협상 때 자신있게 어필할 수 있었습니다.',
  now() - interval '21 days'
),
(
  'fb000004-0000-0000-0000-000000000004',
  'seed0003-0000-0000-0000-000000000003',
  'res00016-0000-0000-0000-000000000016',
  'negative',
  '2년차 콘텐츠 마케터 기준 연봉이 실제 시장보다 약간 낮게 추정된 것 같습니다.',
  now() - interval '0 days'
);
