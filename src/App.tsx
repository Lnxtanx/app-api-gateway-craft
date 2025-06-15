import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster as Sonner } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';
import ApiTesterPage from './pages/ApiTesterPage';
import BusinessIntelligencePage from './pages/BusinessIntelligencePage';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/api-tester" element={<ApiTesterPage />} />
              <Route path="/business-intelligence" element={<BusinessIntelligencePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
