
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/components/ui/use-toast";
import { LoaderCircle, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed in successfully!",
        description: "Redirecting you to the dashboard.",
      });
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    });
    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({
          title: "User already exists",
          description: "An account with this email already exists. Please sign in.",
          variant: "destructive",
        });
    } else {
      toast({
        title: "Check your email!",
        description: "We've sent a confirmation link to your email address.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <Link to="/" className="flex items-center gap-2 mb-8">
            <Bot className="text-primary h-8 w-8" />
            <h1 className="text-2xl font-bold text-foreground">API Craft</h1>
        </Link>
        <Tabs defaultValue="signin" className="w-full max-w-sm">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
                <Card>
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>Enter your credentials to access your account.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
            <TabsContent value="signup">
                <Card>
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
                        <CardDescription>Create a new account to start generating APIs.</CardDescription>
                    </CardHeader>
                     <form onSubmit={handleSignUp}>
                        <CardContent className="space-y-4">
                           <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Sign Up
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
};

export default AuthPage;
