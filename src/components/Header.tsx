
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Globe, User, LogOut } from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-gray-800 bg-black/70 backdrop-blur-md sticky top-0 z-50 shadow-xl shadow-black/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl hover:scale-105 transition-transform duration-200">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 hover-lift">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              WebAPI Generator
            </span>
          </Link>
          
          {user && (
            <nav className="flex items-center gap-6">
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/5 relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[1px] after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-1/2 hover:after:left-1/4"
              >
                Dashboard
              </Link>
              <Link 
                to="/api-tester" 
                className="text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/5 relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[1px] after:bg-purple-400 after:transition-all after:duration-300 hover:after:w-1/2 hover:after:left-1/4"
              >
                API Tester
              </Link>
              <Link 
                to="/business-intelligence" 
                className="text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/5 relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[1px] after:bg-indigo-400 after:transition-all after:duration-300 hover:after:w-1/2 hover:after:left-1/4"
              >
                Analytics
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-gray-700">
                <User className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">
                  {user.email}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
                className="hover:bg-gradient-to-r hover:from-red-900/20 hover:to-pink-900/20 hover:border-red-500/30 hover:text-red-400 transition-all duration-200 bg-gray-900/50 border-gray-700 text-gray-300 hover-lift"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 hover:from-blue-800/30 hover:to-purple-800/30 border-blue-500/30 hover:border-purple-400/50 transition-all duration-200 hover:scale-105 text-gray-300 hover:text-white shimmer-effect hover-lift"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
