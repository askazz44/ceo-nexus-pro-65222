import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { OfflineIndicator } from "./components/OfflineIndicator";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Subscription from "./pages/Subscription";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCanceled from "./pages/SubscriptionCanceled";
import Settings from "./pages/Settings";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Budgets from "./pages/Budgets";
import ComparativeAnalysis from "./pages/ComparativeAnalysis";
import About from "./pages/About";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return authenticated ? <>{children}</> : <Navigate to="/auth" replace />;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OfflineIndicator />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/install" element={<Install />} />
            
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={
                <RouteErrorBoundary routeName="Dashboard" fallbackPath="/">
                  <Dashboard />
                </RouteErrorBoundary>
              } />
              <Route path="/projects" element={
                <RouteErrorBoundary routeName="Projects" fallbackPath="/dashboard">
                  <Projects />
                </RouteErrorBoundary>
              } />
              <Route path="/project/:id" element={
                <RouteErrorBoundary routeName="Project Detail" fallbackPath="/projects">
                  <ProjectDetail />
                </RouteErrorBoundary>
              } />
              <Route path="/subscription" element={
                <RouteErrorBoundary routeName="Subscription" fallbackPath="/dashboard">
                  <Subscription />
                </RouteErrorBoundary>
              } />
              <Route path="/subscription/success" element={<SubscriptionSuccess />} />
              <Route path="/subscription/canceled" element={<SubscriptionCanceled />} />
              <Route path="/settings" element={
                <RouteErrorBoundary routeName="Settings" fallbackPath="/dashboard">
                  <Settings />
                </RouteErrorBoundary>
              } />
              <Route path="/admin" element={
                <RouteErrorBoundary routeName="Admin" fallbackPath="/dashboard">
                  <Admin />
                </RouteErrorBoundary>
              } />
              <Route path="/budgets" element={
                <RouteErrorBoundary routeName="Budgets" fallbackPath="/dashboard">
                  <Budgets />
                </RouteErrorBoundary>
              } />
              <Route path="/comparison" element={
                <RouteErrorBoundary routeName="Comparison" fallbackPath="/dashboard">
                  <ComparativeAnalysis />
                </RouteErrorBoundary>
              } />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
