import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hashPassword, isHashedPassword } from '@/lib/hash';

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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  upgradeToPremium: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('careerspring_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const storedUsers = JSON.parse(localStorage.getItem('careerspring_users') || '[]');
    const foundUser = storedUsers.find((u: User & { password: string }) => u.email === email);
    
    if (!foundUser) {
      return { success: false, error: '등록되지 않은 이메일입니다.' };
    }

    const hashedInput = await hashPassword(password);

    if (isHashedPassword(foundUser.password)) {
      // 이미 해시된 비밀번호와 비교
      if (foundUser.password !== hashedInput) {
        return { success: false, error: '비밀번호가 올바르지 않습니다.' };
      }
    } else {
      // 기존 평문 비밀번호와 비교 (마이그레이션)
      if (foundUser.password !== password) {
        return { success: false, error: '비밀번호가 올바르지 않습니다.' };
      }
      // 평문 비밀번호를 해시로 마이그레이션
      foundUser.password = hashedInput;
      const updatedUsers = storedUsers.map((u: User & { password: string }) =>
        u.email === email ? foundUser : u
      );
      localStorage.setItem('careerspring_users', JSON.stringify(updatedUsers));
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem('careerspring_user', JSON.stringify(userWithoutPassword));
    return { success: true };
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const storedUsers = JSON.parse(localStorage.getItem('careerspring_users') || '[]');
    
    if (storedUsers.some((u: User) => u.email === email)) {
      return { success: false, error: '이미 가입된 이메일입니다.' };
    }

    const hashedPw = await hashPassword(password);
    const newUser: User & { password: string } = {
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPw,
      createdAt: new Date().toISOString(),
      isPremium: false,
    };

    storedUsers.push(newUser);
    localStorage.setItem('careerspring_users', JSON.stringify(storedUsers));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('careerspring_user', JSON.stringify(userWithoutPassword));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('careerspring_user');
  };

  const upgradeToPremium = () => {
    if (user) {
      const updatedUser = { 
        ...user, 
        isPremium: true, 
        premiumStartDate: new Date().toISOString() 
      };
      setUser(updatedUser);
      localStorage.setItem('careerspring_user', JSON.stringify(updatedUser));
      
      const storedUsers = JSON.parse(localStorage.getItem('careerspring_users') || '[]');
      const updatedUsers = storedUsers.map((u: User & { password: string }) => 
        u.id === user.id ? { ...u, isPremium: true, premiumStartDate: new Date().toISOString() } : u
      );
      localStorage.setItem('careerspring_users', JSON.stringify(updatedUsers));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, upgradeToPremium }}>
      {children}
    </AuthContext.Provider>
  );
};
