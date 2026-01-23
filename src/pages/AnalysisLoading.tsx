import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Loader2 } from 'lucide-react';

const messages = [
  { time: 10, icon: '📊', text: '경력 데이터 수집 중...' },
  { time: 20, icon: '🔍', text: '유사 프로필 비교 분석 중...' },
  { time: 30, icon: '✨', text: '맞춤 결과 생성 중...' },
];

const AnalysisLoading = () => {
  const navigate = useNavigate();
  const { currentInput, generateResult, setCurrentResult } = useAnalysis();
  const [countdown, setCountdown] = useState(30);
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    if (!currentInput) {
      navigate('/analysis');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const result = generateResult(currentInput);
          setCurrentResult(result);
          navigate('/analysis/result');
          return 0;
        }
        
        // Update message based on countdown
        const elapsed = 30 - prev;
        if (elapsed >= 20) setCurrentMessage(2);
        else if (elapsed >= 10) setCurrentMessage(1);
        else setCurrentMessage(0);
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentInput, navigate, generateResult, setCurrentResult]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-foreground/95 to-foreground flex flex-col items-center justify-center p-4">
      {/* Animated circles */}
      <div className="relative mb-12">
        <div className="w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-primary/50 flex items-center justify-center animate-spin-slow">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            </div>
          </div>
        </div>
        
        {/* Countdown */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full font-bold animate-count-down">
          {countdown}초
        </div>
      </div>

      {/* Message */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="text-4xl mb-4">{messages[currentMessage].icon}</div>
        <h2 className="text-xl font-semibold text-primary-foreground mb-2">
          {messages[currentMessage].text}
        </h2>
      </div>

      {/* Tip */}
      <div className="text-center text-primary-foreground/70 text-sm">
        💡 팁: 비슷한 경력의 1,200+ 건 데이터를 분석하고 있어요
      </div>
    </div>
  );
};

export default AnalysisLoading;
