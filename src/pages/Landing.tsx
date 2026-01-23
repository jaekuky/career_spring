import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { CheckCircle, TrendingUp, Target, Sparkles, ArrowRight, Users, Star, Zap } from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: '30초 시장 가치 분석',
    description: '경력 5가지 정보로 AI가 적정 연봉을 분석해요',
  },
  {
    icon: Target,
    title: '4주 맞춤 로드맵',
    description: '이직 준비를 체계적으로 도와드려요 (Coming Soon)',
    comingSoon: true,
  },
  {
    icon: Sparkles,
    title: '연봉 협상 스크립트',
    description: '실전 협상 스크립트와 시뮬레이션 (Coming Soon)',
    comingSoon: true,
  },
];

const stats = [
  { label: '베타 사용자', value: '1,200+', suffix: '명' },
  { label: '평균 만족도', value: '4.8', suffix: '/5.0' },
  { label: '분석 정확도', value: '92', suffix: '%' },
];

const steps = [
  { step: '01', title: '경력 정보 5가지 입력', time: '1분' },
  { step: '02', title: 'AI가 시장 데이터 분석', time: '30초' },
  { step: '03', title: '나의 적정 연봉 확인!', time: '' },
];

const Landing = () => {
  return (
    <AppLayout showNav={false} headerVariant="landing">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">AI 기반 커리어 분석</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              30초 만에 당신의<br />
              <span className="text-primary">시장 가치</span>를 알려드립니다
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              경력 정보 5가지만 입력하면, AI가 적정 연봉과 지원 가능 기업을 분석해드립니다
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  무료로 시작하기
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}<span className="text-lg text-muted-foreground">{stat.suffix}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">핵심 기능</h2>
          <p className="text-center text-muted-foreground mb-12">커리어스프링이 제공하는 서비스</p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
                  {feature.comingSoon && (
                    <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">Soon</span>
                  )}
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">이렇게 쉬워요</h2>
          <p className="text-center text-muted-foreground mb-12">단 3단계로 시장 가치 확인</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="text-5xl font-bold text-primary/20 mb-4">{step.step}</div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                {step.time && (
                  <span className="text-sm text-muted-foreground">({step.time})</span>
                )}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full">
                    <ArrowRight className="w-6 h-6 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2230%22 height=%2230%22 viewBox=%220 0 30 30%22 fill=%22none%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle cx=%222%22 cy=%222%22 r=%221%22 fill=%22rgba(255,255,255,0.1)%22/%3E%3C/svg%3E')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            지금 바로 내 시장 가치 확인하기
          </h2>
          <Link to="/signup">
            <Button variant="hero-white" size="xl">
              무료로 시작하기
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-lg text-foreground">커리어스프링</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">이용약관</a>
              <a href="#" className="hover:text-foreground transition-colors">개인정보처리방침</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 커리어스프링. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </AppLayout>
  );
};

export default Landing;
