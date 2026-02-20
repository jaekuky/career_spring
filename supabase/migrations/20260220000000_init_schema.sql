-- ============================================================
-- 커리어스프링 MVP 초기 스키마
-- Migration: 20260220000000_init_schema
-- ============================================================

-- ============================================================
-- 0. 유틸리티 함수
-- ============================================================

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- auth.users 생성 시 profiles 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- 1. profiles 테이블
-- ============================================================

CREATE TABLE public.profiles (
  id                      uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    text        NOT NULL,
  email                   text        NOT NULL,
  subscription_status     text        NOT NULL DEFAULT 'free'
                            CHECK (subscription_status IN ('free', 'premium', 'cancelled')),
  subscription_started_at timestamptz,
  subscription_expires_at timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- updated_at 트리거
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- auth.users 생성 시 profiles 자동 생성 트리거
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. analysis_requests 테이블
-- ============================================================

CREATE TABLE public.analysis_requests (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_title           text        NOT NULL,
  years_of_experience integer     NOT NULL CHECK (years_of_experience BETWEEN 0 AND 30),
  skills              text[]      NOT NULL,
  achievements        text        CHECK (char_length(achievements) <= 500),
  education           text        NOT NULL,
  status              text        NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_analysis_requests_user_id    ON public.analysis_requests (user_id);
CREATE INDEX idx_analysis_requests_created_at ON public.analysis_requests (created_at DESC);

-- ============================================================
-- 3. analysis_results 테이블
-- ============================================================

CREATE TABLE public.analysis_results (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id       uuid        NOT NULL UNIQUE REFERENCES public.analysis_requests(id) ON DELETE CASCADE,
  user_id          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  salary_min       integer     NOT NULL,
  salary_mid       integer     NOT NULL,
  salary_max       integer     NOT NULL,
  company_types    jsonb       NOT NULL DEFAULT '[]'::jsonb,
                                -- [{type: text, match_level: text}]
  strengths        jsonb       NOT NULL DEFAULT '[]'::jsonb,
                                -- [{title: text, description: text, percentile: integer}]
  sample_size      integer     NOT NULL,
  confidence_score float       NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
  raw_response     jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_analysis_results_user_id    ON public.analysis_results (user_id);
CREATE INDEX idx_analysis_results_created_at ON public.analysis_results (created_at DESC);

-- ============================================================
-- 4. payments 테이블
-- ============================================================

CREATE TABLE public.payments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_key text        UNIQUE,
  order_id    text        NOT NULL UNIQUE,
  amount      integer     NOT NULL,
  status      text        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'confirmed', 'cancelled', 'failed')),
  billing_key text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_payments_user_id  ON public.payments (user_id);
CREATE INDEX idx_payments_order_id ON public.payments (order_id);

-- ============================================================
-- 5. feedback 테이블
-- ============================================================

CREATE TABLE public.feedback (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  result_id uuid        NOT NULL REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  rating    text        NOT NULL CHECK (rating IN ('positive', 'negative')),
  comment   text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. RLS 활성화
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS 정책
-- ============================================================

-- profiles --
CREATE POLICY "profiles: 본인 SELECT"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: 본인 UPDATE"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- analysis_requests --
CREATE POLICY "analysis_requests: 본인 SELECT"
  ON public.analysis_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "analysis_requests: 본인 INSERT"
  ON public.analysis_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- analysis_results --
CREATE POLICY "analysis_results: 본인 SELECT"
  ON public.analysis_results FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT/UPDATE는 service_role만 허용 (정책 없음 = 일반 사용자 차단)

-- payments --
CREATE POLICY "payments: 본인 SELECT"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT/UPDATE는 service_role만 허용 (정책 없음 = 일반 사용자 차단)

-- feedback --
CREATE POLICY "feedback: 본인 SELECT"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "feedback: 본인 INSERT"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
