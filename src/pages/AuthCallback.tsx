import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');

      if (error) {
        toast({
          variant: 'destructive',
          description: errorDescription ?? '로그인 중 오류가 발생했습니다',
        });
        navigate('/login', { replace: true });
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          toast({
            variant: 'destructive',
            description: '로그인 처리 중 오류가 발생했습니다',
          });
          navigate('/login', { replace: true });
          return;
        }
      }

      navigate('/analysis', { replace: true });
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
