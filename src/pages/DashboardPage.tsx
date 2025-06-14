
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { LoaderCircle, AlertCircle, PlusCircle } from 'lucide-react';
import CodeBlock from '@/components/CodeBlock';

const fetchUserApis = async (userId: string) => {
  const { data, error } = await supabase
    .from('generated_apis')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const { data: apis, isLoading, isError, error } = useQuery({
    queryKey: ['userApis', user?.id],
    queryFn: () => fetchUserApis(user!.id),
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // or a redirect, but useEffect handles it
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">My APIs</h2>
          <Button asChild>
            <Link to="/"><PlusCircle className="mr-2 h-4 w-4" /> Generate New API</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Generated APIs</CardTitle>
            <CardDescription>
              Here is a list of all the APIs you've created with API Craft.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isError && (
              <div className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p>Error fetching APIs: {error.message}</p>
              </div>
            )}
            {!isError && apis && apis.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Source URL</TableHead>
                    <TableHead>API Endpoint</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead className="w-[180px]">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apis.map((api) => (
                    <TableRow key={api.id}>
                      <TableCell className="font-medium truncate max-w-xs">
                        <a href={api.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">{api.source_url}</a>
                      </TableCell>
                      <TableCell><CodeBlock code={api.api_endpoint} /></TableCell>
                      <TableCell><CodeBlock code={api.api_key} /></TableCell>
                      <TableCell>{new Date(api.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!isError && apis && apis.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't generated any APIs yet.</p>
                <Button asChild>
                  <Link to="/">Generate your first API</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPage;
