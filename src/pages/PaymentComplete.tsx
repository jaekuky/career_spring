import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

const PaymentComplete = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const now = new Date();
  const nextPaymentDate = addDays(now, 30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/analysis');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        {/* Success Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-success/20 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle className="w-14 h-14 text-success" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto bg-success/10 rounded-full animate-ping" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">결제가 완료되었습니다! 🎉</h1>
        <p className="text-lg text-muted-foreground mb-8">이제 시장 가치를 확인할 차례예요</p>

        {/* Payment Summary */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-8 text-left">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">결제 금액</span>
              <span className="font-semibold text-foreground">29,000원</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">결제 일시</span>
              <span className="font-semibold text-foreground">
                {format(now, 'yyyy.MM.dd HH:mm', { locale: ko })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">다음 결제일</span>
              <span className="font-semibold text-foreground">
                {format(nextPaymentDate, 'yyyy.MM.dd', { locale: ko })}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <Link to="/analysis">
          <Button variant="hero" size="xl" className="w-full mb-4 animate-pulse-subtle">
            지금 바로 시장 가치 확인하기
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground mb-4">30초면 충분해요</p>

        <button 
          onClick={() => navigate('/analysis')}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          나중에 하기
        </button>

        <div className="mt-8 text-sm text-muted-foreground">
          {countdown}초 후 자동으로 분석 페이지로 이동합니다
        </div>
      </div>
    </div>
  );
};

export default PaymentComplete;
