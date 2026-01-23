import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User } from 'lucide-react';

interface HeaderProps {
  variant?: 'landing' | 'app';
}

export const Header = ({ variant = 'app' }: HeaderProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const isLanding = variant === 'landing' || location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <span className="font-bold text-lg text-foreground">커리어스프링</span>
        </Link>

        <div className="flex items-center gap-3">
          {isLanding && !user ? (
            <Link to="/login">
              <Button variant="outline" size="sm">로그인</Button>
            </Link>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="w-5 h-5" />
              </Button>
              <Link to="/mypage">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
