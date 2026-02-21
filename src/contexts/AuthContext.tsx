import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isPremium: boolean;
  premiumStartDate?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  upgradeToPremium: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ---------------------------------------------------------------------------
// 헬퍼: Supabase 오류 메시지 한국어 번역
// ---------------------------------------------------------------------------

function translateAuthError(message: string): string {
  if (message.includes('User already registered') || message.includes('already been registered')) {
    return '이미 사용 중인 이메일입니다';
  }
  if (message.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다';
  }
  if (message.includes('Email not confirmed')) {
    return '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요';
  }
  if (message.includes('Password should be at least')) {
    return '비밀번호는 8자 이상이어야 합니다';
  }
  if (message.includes('rate limit') || message.includes('after 60 seconds')) {
    return '잠시 후 다시 시도해주세요';
  }
  if (message.includes('signup_disabled')) {
    return '현재 회원가입이 비활성화되어 있습니다';
  }
  return message;
}

// ---------------------------------------------------------------------------
// 헬퍼: Supabase 유저 → 앱 유저 변환
// ---------------------------------------------------------------------------

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  const meta = supabaseUser.user_metadata ?? {};
  return {
    id: supabaseUser.id,
    name: meta.name ?? meta.full_name ?? '',
    email: supabaseUser.email ?? '',
    createdAt: supabaseUser.created_at,
    isPremium: meta.is_premium ?? false,
    premiumStartDate: meta.premium_start_date,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // -----------------------------------------------------------------------
  // 세션 초기화 & onAuthStateChange 리스너
  // -----------------------------------------------------------------------
  useEffect(() => {
    // 1) 현재 세션 가져오기
    const initSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ? mapSupabaseUser(currentSession.user) : null);
      setIsLoading(false);
    };

    initSession();

    // 2) 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ? mapSupabaseUser(newSession.user) : null);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------------------------------------------------------
  // 로그인
  // -----------------------------------------------------------------------
  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: translateAuthError(error.message) };
    }
    return { success: true };
  };

  // -----------------------------------------------------------------------
  // 회원가입
  // -----------------------------------------------------------------------
  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          is_premium: false,
        },
      },
    });

    if (error) {
      return { success: false, error: translateAuthError(error.message) };
    }
    // session이 null이면 이메일 인증 필요, 있으면 즉시 로그인
    return { success: true, requiresEmailConfirmation: !data.session };
  };

  // -----------------------------------------------------------------------
  // 로그아웃
  // -----------------------------------------------------------------------
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // -----------------------------------------------------------------------
  // 프리미엄 업그레이드 (user_metadata 업데이트)
  // -----------------------------------------------------------------------
  const upgradeToPremium = async () => {
    const now = new Date().toISOString();
    const { data, error } = await supabase.auth.updateUser({
      data: {
        is_premium: true,
        premium_start_date: now,
      },
    });

    if (!error && data.user) {
      setUser(mapSupabaseUser(data.user));
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, login, signup, logout, upgradeToPremium }}
    >
      {children}
    </AuthContext.Provider>
  );
};
