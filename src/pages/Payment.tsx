import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { X, CheckCircle, Lock, CreditCard } from 'lucide-react';

const features = [
  '무제한 시장 가치 분석',
  '적정 연봉 범위 확인',
  '지원 가능 기업 유형 매칭',
  '경력 강점 분석',
  '분석 결과 저장 및 공유',
];

const Payment = () => {
  const navigate = useNavigate();
  const { upgradeToPremium } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    upgradeToPremium();
    navigate('/payment/complete');
  };

  return (
    <AppLayout showNav={false} showHeader={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-lg text-foreground">커리어스프링</span>
            </Link>
            <button 
              onClick={() => navigate('/analysis')} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Product Info */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6 animate-fade-in">
              <div className="mb-6">
                <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4">
                  추천
                </span>
                <h2 className="text-2xl font-bold text-foreground mb-2">프리미엄 플랜</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-primary">29,000</span>
                  <span className="text-lg text-muted-foreground">원/월</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">VAT 포함</p>
              </div>

              <ul className="space-y-3 mb-6">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                <Lock className="w-4 h-4 text-success" />
                <span className="text-sm text-success font-medium">30일 내 환불 보장</span>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <h3 className="text-lg font-semibold text-foreground mb-6">결제 수단</h3>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mb-6">
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5" />
                    신용/체크카드
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors mt-2">
                  <RadioGroupItem value="kakao" id="kakao" />
                  <Label htmlFor="kakao" className="flex items-center gap-2 cursor-pointer flex-1">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E">
                      <path d="M12 3C6.48 3 2 6.48 2 10.5c0 2.52 1.68 4.74 4.2 6.06-.12.42-.78 2.7-.81 2.88 0 0-.02.06-.01.09.02.06.08.08.14.06.08-.02 3.12-2.04 3.6-2.37.9.12 1.83.18 2.88.18 5.52 0 10-3.48 10-7.5S17.52 3 12 3z"/>
                    </svg>
                    카카오페이
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="cardNumber" className="text-foreground">카드 번호</Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-foreground">유효기간</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc" className="text-foreground">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardName" className="text-foreground">카드 소유자 이름</Label>
                    <Input
                      id="cardName"
                      placeholder="홍길동"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={handlePayment} 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? '결제 처리 중...' : '29,000원 결제하기'}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                결제 시 이용약관에 동의하는 것으로 간주됩니다
              </p>

              <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">SSL 보안 결제</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Payment;
