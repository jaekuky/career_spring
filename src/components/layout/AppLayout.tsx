import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  headerVariant?: 'landing' | 'app';
}

export const AppLayout = ({ 
  children, 
  showNav = true, 
  showHeader = true,
  headerVariant = 'app'
}: AppLayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header variant={headerVariant} />}
      <main className={`${showHeader ? 'pt-16' : ''} ${showNav && user ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>
      {showNav && user && <BottomNav />}
    </div>
  );
};
