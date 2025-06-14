
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, User, Zap, Shield, Activity, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out",
      });
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Zap className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              ScrapeMaster Pro
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors hover:text-foreground/80 ${
                isActive('/') ? 'text-foreground' : 'text-foreground/60'
              }`}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`transition-colors hover:text-foreground/80 ${
                    isActive('/dashboard') ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/api-tester"
                  className={`transition-colors hover:text-foreground/80 flex items-center gap-1 ${
                    isActive('/api-tester') ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  <TestTube className="h-4 w-4" />
                  API Tester
                </Link>
                <Link
                  to="/stealth-scraping"
                  className={`transition-colors hover:text-foreground/80 flex items-center gap-1 ${
                    isActive('/stealth-scraping') ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Stealth Engine
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile navigation */}
        <div className="flex md:hidden">
          <Link to="/" className="flex items-center space-x-2">
            <Zap className="h-6 w-6" />
            <span className="font-bold">ScrapeMaster</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
