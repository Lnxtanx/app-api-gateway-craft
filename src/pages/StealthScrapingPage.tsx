
import React from 'react';
import Header from '@/components/Header';
import StealthScrapingInterface from '@/components/StealthScrapingInterface';
import EnhancedStatusDashboard from '@/components/EnhancedStatusDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, Crown, Zap, Brain, Atom, Target } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const StealthScrapingPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="flex justify-center items-center gap-3 mb-6">
                <Atom className="h-12 w-12 text-purple-500 animate-pulse" />
                <Crown className="h-10 w-10 text-amber-500" />
                <Brain className="h-12 w-12 text-blue-500" />
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-primary to-amber-500 bg-clip-text text-transparent">
                🛡️ Military-Grade Stealth Engine
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Intelligence Level 5: Advanced military-grade stealth scraping with quantum protocols, 
                AI behavior simulation, and zero-footprint architecture for maximum data extraction.
              </p>
            </div>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-50 via-blue-50 to-amber-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-amber-900/20">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Atom className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Quantum Stealth Protocols</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-amber-500" />
                      <span className="font-medium">Military-Grade Intelligence</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">AI-Powered Behavior Engine</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-green-500" />
                      <span className="font-medium">98-99% Mission Success</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Zero-Footprint Architecture</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">15+ Data Vector Extraction</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-4 flex items-center justify-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    Secure Access Required
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Military-grade stealth operations require authenticated access for security compliance
                  </p>
                  <Link 
                    to="/auth" 
                    className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-primary to-amber-600 text-primary-foreground hover:from-purple-600/90 hover:via-primary/90 hover:to-amber-600/90 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
                  >
                    <Atom className="h-5 w-5 mr-2 animate-pulse" />
                    Access Military Portal
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Atom className="h-8 w-8 text-purple-500 animate-pulse" />
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-primary to-amber-500 bg-clip-text text-transparent">
                🛡️ Military-Grade Stealth Engine
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Intelligence Level 5: Advanced military-grade stealth scraping with quantum protocols, 
                AI behavior simulation, and zero-footprint architecture for maximum data extraction.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Status Dashboard */}
        <div className="mb-8">
          <EnhancedStatusDashboard />
        </div>
        
        <StealthScrapingInterface />
      </div>
    </div>
  );
};

export default StealthScrapingPage;
