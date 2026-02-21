import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Settings, BarChart3, CreditCard, Bell, Phone, 
  FileText, Lock, LogOut, ChevronRight, Crown
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState } from 'react';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { savedResults } = useAnalysis();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    toast({ description: '로그아웃되었습니다' });
    navigate('/');
  };

  const handleComingSoon = () => {
    toast({ description: '준비 중입니다', duration: 2000 });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">마이페이지</h1>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg text-foreground">{user.name}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              <p className="text-muted-foreground text-xs mt-1">
                가입일: {format(new Date(user.createdAt), 'yyyy.MM.dd', { locale: ko })}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleComingSoon}>
            프로필 수정
          </Button>
        </div>

        {/* Subscription Card */}
        {user.isPremium && (
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-primary-foreground mb-6 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">프리미엄 플랜</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-80">구독 상태:</span>
                  <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-full text-xs">활성</span>
                </div>
                {user.premiumStartDate && (
                  <p className="text-sm opacity-80 mt-1">
                    다음 결제일: {format(new Date(new Date(user.premiumStartDate).getTime() + 30 * 24 * 60 * 60 * 1000), 'yyyy.MM.dd', { locale: ko })}
                  </p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handleComingSoon}
              >
                구독 관리
              </Button>
            </div>
          </div>
        )}

        {/* Saved Results */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">내 분석 기록</h3>
          </div>
          {savedResults.length > 0 ? (
            <div className="space-y-3">
              {savedResults.slice(0, 3).map((result) => (
                <div 
                  key={result.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/analysis/result')}
                >
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(result.date), 'yyyy.MM.dd HH:mm', { locale: ko })}
                    </p>
                    <p className="font-medium text-foreground">
                      {(result.salaryMin / 10000).toFixed(0)}만원 ~ {(result.salaryMax / 10000).toFixed(0)}만원
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">아직 분석 기록이 없어요.<br />지금 바로 분석해보세요!</p>
              <Link to="/analysis">
                <Button>분석 시작하기</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Menu List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Link to="/analysis" className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors border-b border-border">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="flex-1 text-foreground">새 분석 시작하기</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <button onClick={handleComingSoon} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors border-b border-border w-full text-left">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-foreground">결제 내역</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-foreground">알림 설정</span>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <a href="mailto:support@careerspring.io" className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors border-b border-border">
            <Phone className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-foreground">고객 지원</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </a>
          <a href="#" className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors border-b border-border">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-foreground">이용약관</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </a>
          <a href="#" className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-foreground">개인정보처리방침</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </a>
        </div>

        {/* Logout & Delete */}
        <div className="space-y-4 text-center pb-8">
          <button 
            onClick={handleLogout}
            className="text-destructive hover:underline font-medium flex items-center gap-2 mx-auto"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
          <button 
            onClick={handleComingSoon}
            className="text-muted-foreground hover:underline text-sm"
          >
            회원 탈퇴
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default MyPage;
