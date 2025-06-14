
import { Bot, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="py-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Bot className="text-primary h-8 w-8" />
          <h1 className="text-2xl font-bold text-foreground">API Craft</h1>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link to="/api-tester" className="text-muted-foreground hover:text-foreground transition-colors">API Tester</Link>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Docs</a>
          </nav>
          {loading ? null : user ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/auth">Login / Sign Up</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
