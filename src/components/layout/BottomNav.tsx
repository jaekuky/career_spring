import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, ClipboardList, Wrench, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: '홈', path: '/analysis', active: true },
  { icon: BarChart3, label: '분석', path: '/analysis', active: true },
  { icon: ClipboardList, label: '로드맵', path: '/roadmap', active: false },
  { icon: Wrench, label: '도구', path: '/tools', active: false },
  { icon: User, label: '마이', path: '/mypage', active: true },
];

export const BottomNav = () => {
  const location = useLocation();
  const { toast } = useToast();

  const handleClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (!item.active) {
      e.preventDefault();
      toast({
        description: "준비 중입니다",
        duration: 2000,
      });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/analysis' && location.pathname.startsWith('/analysis'));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={(e) => handleClick(item, e)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
                !item.active && "opacity-50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
