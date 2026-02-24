import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useToast } from '@/hooks/use-toast';
import { Share2, RotateCcw, Save, Bell, TrendingUp, Building2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const matchColors = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-muted text-muted-foreground border-border',
};

const matchLabels = {
  high: '매칭도 높음',
  medium: '매칭도 중간',
  low: '매칭도 보통',
};

const companyTypeLabels: Record<string, string> = {
  startup: 'IT 스타트업',
  midsize: '중견·중소기업',
  enterprise: '대기업·공기업',
};

const AnalysisResult = () => {
  const navigate = useNavigate();
  const { currentResult, saveResult } = useAnalysis();
  const { toast } = useToast();

  if (!currentResult) {
    return <Navigate to="/analysis" replace />;
  }

  const handleSave = () => {
    saveResult(currentResult);
    toast({ description: '결과가 저장되었습니다!' });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ description: '링크가 복사되었습니다!' });
  };

  const { salaryRange, companyTypes, strengths, sampleSize } = currentResult;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            분석 완료!
          </div>
          <button type="button" aria-label="결과 공유" onClick={handleShare} className="text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Salary Card */}
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-primary-foreground mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">적정 연봉 범위</span>
          </div>

          <div className="text-center mb-6">
            <div className="text-3xl md:text-4xl font-bold mb-2">
              {salaryRange.min.toLocaleString()}만원 ~ {salaryRange.max.toLocaleString()}만원
            </div>
            <div className="text-primary-foreground/80">
              중간값 <span className="font-semibold text-primary-foreground">{salaryRange.mid.toLocaleString()}만원</span>
            </div>
          </div>

          {/* Salary Bar */}
          <div className="relative h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
            <div className="absolute left-0 h-full bg-primary-foreground/40 rounded-full" style={{ width: '100%' }} />
            <div className="absolute h-full w-1 bg-primary-foreground rounded-full" style={{ left: '50%' }} />
          </div>
          <div className="flex justify-between text-xs text-primary-foreground/70 mt-2">
            <span>Min</span>
            <span>Mid</span>
            <span>Max</span>
          </div>
        </div>

        {/* Company Types */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">당신에게 맞는 기업 유형</h3>
          </div>
          <div className="space-y-3">
            {companyTypes.map((item, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  matchColors[item.matchLevel],
                )}
              >
                <div>
                  <span className="font-medium">{companyTypeLabels[item.type] ?? item.type}</span>
                  {item.description && (
                    <p className="text-xs mt-0.5 opacity-80">{item.description}</p>
                  )}
                </div>
                <span className="text-sm shrink-0 ml-3">{matchLabels[item.matchLevel]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="font-semibold text-foreground mb-4">당신의 어필 포인트 💪</h3>
          <div className="space-y-3">
            {strengths.map((strength, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  상위<br />{strength.percentile}%
                </div>
                <div>
                  <div className="font-medium text-foreground">{strength.title}</div>
                  <div className="text-sm text-muted-foreground">{strength.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Size */}
        <p className="text-center text-sm text-muted-foreground mb-6">
          이 분석은 유사 프로필 {sampleSize.toLocaleString()}건의 데이터를 기반으로 합니다
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Button onClick={handleSave} variant="hero" size="lg" className="w-full">
            <Save className="w-5 h-5" />
            결과 저장하기
          </Button>
          <Button onClick={() => navigate('/analysis')} variant="outline" size="lg" className="w-full">
            <RotateCcw className="w-5 h-5" />
            다시 분석하기
          </Button>
          <button
            type="button"
            onClick={handleShare}
            className="w-full text-center text-primary hover:underline text-sm"
          >
            친구에게 공유하기
          </button>
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-accent rounded-2xl p-6 text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <p className="text-foreground font-medium mb-3">
            4주 맞춤 로드맵으로 체계적으로 준비해보세요
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast({ description: '출시 알림이 등록되었습니다!' })}
          >
            <Bell className="w-4 h-4" />
            출시 알림 받기
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AnalysisResult;
