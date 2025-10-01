import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCanceled from "./pages/SubscriptionCanceled";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            <Route path="/subscription/canceled" element={<SubscriptionCanceled />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
