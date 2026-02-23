import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AnalysisProvider } from "@/contexts/AnalysisContext";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Payment = lazy(() => import("./pages/Payment"));
const PaymentComplete = lazy(() => import("./pages/PaymentComplete"));
const Analysis = lazy(() => import("./pages/Analysis"));
const AnalysisLoading = lazy(() => import("./pages/AnalysisLoading"));
const AnalysisResult = lazy(() => import("./pages/AnalysisResult"));
const MyPage = lazy(() => import("./pages/MyPage"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AnalysisProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/payment" element={
                  <ProtectedRoute><Payment /></ProtectedRoute>
                } />
                <Route path="/payment/complete" element={
                  <ProtectedRoute><PaymentComplete /></ProtectedRoute>
                } />
                <Route path="/analysis" element={
                  <ProtectedRoute><Analysis /></ProtectedRoute>
                } />
                <Route path="/analysis/loading" element={
                  <ProtectedRoute><AnalysisLoading /></ProtectedRoute>
                } />
                <Route path="/analysis/result" element={
                  <ProtectedRoute><AnalysisResult /></ProtectedRoute>
                } />
                <Route path="/mypage" element={
                  <ProtectedRoute><MyPage /></ProtectedRoute>
                } />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AnalysisProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
