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
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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
      return { success: false, error: error.message };
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
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signUp({
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
      return { success: false, error: error.message };
    }
    return { success: true };
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
