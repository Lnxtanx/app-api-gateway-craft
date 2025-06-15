
import React from 'react';
import Header from '@/components/Header';
import StealthScrapingInterface from '@/components/StealthScrapingInterface';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const StealthScrapingPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Stealth Scraping</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Advanced anti-detection scraping requires authentication
          </p>
          <Link 
            to="/auth" 
            className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign In to Access
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">🛡️ Stealth Scraping Engine</h1>
          <p className="text-xl text-muted-foreground">
            Level 3 Intelligence: Anti-detection scraping with human behavior simulation, 
            CAPTCHA handling, and distributed job processing.
          </p>
        </div>
        
        <StealthScrapingInterface />
      </div>
    </div>
  );
};

export default StealthScrapingPage;
