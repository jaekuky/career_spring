import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AnalysisProvider } from "@/contexts/AnalysisContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Payment from "./pages/Payment";
import PaymentComplete from "./pages/PaymentComplete";
import Analysis from "./pages/Analysis";
import AnalysisLoading from "./pages/AnalysisLoading";
import AnalysisResult from "./pages/AnalysisResult";
import MyPage from "./pages/MyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AnalysisProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
