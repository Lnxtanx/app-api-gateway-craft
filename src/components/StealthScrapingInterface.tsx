import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Brain, 
  Zap, 
  Eye, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  LoaderCircle,
  Play,
  Plus,
  BarChart3
} from 'lucide-react';
import CodeBlock from './CodeBlock';

interface StealthJob {
  job_id: string;
  url: string;
  priority: string;
  status: string;
  profile_used?: string;
  captcha_encountered?: boolean;
  created_at: string;
  structured_data?: any;
}

interface SystemStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  available_profiles: number;
  captcha_solver_configured: boolean;
  stealth_features: string[];
}

const StealthScrapingInterface: React.FC = () => {
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<StealthJob[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [selectedJob, setSelectedJob] = useState<StealthJob | null>(null);
  const { toast } = useToast();

  const fetchSystemStats = async () => {
    try {
      console.log('🔍 Fetching system stats...');
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        body: {},
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('📊 System stats response:', { data, error });

      if (error) {
        console.error('❌ Error fetching system stats:', error);
        throw error;
      }
      
      setSystemStats(data);
      console.log('✅ System stats updated successfully');
    } catch (error) {
      console.error('💥 Failed to fetch system stats:', error);
      toast({
        title: "Error",
        description: `Failed to fetch system stats: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const enqueueJob = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('📋 Enqueuing job for URL:', url);
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        body: { action: 'enqueue', url, priority },
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('📋 Enqueue response:', { data, error });

      if (error) {
        console.error('❌ Error enqueuing job:', error);
        throw error;
      }

      const newJob: StealthJob = {
        job_id: data.job_id,
        url: data.url,
        priority: data.priority,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      setJobs(prev => [newJob, ...prev]);
      setUrl('');
      
      toast({
        title: "Job Enqueued",
        description: `Stealth scraping job queued for ${data.url}`,
      });

      // Refresh stats
      await fetchSystemStats();
    } catch (error: any) {
      console.error('💥 Failed to enqueue job:', error);
      toast({
        title: "Error",
        description: `Failed to enqueue job: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runDirectScrape = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Starting direct scrape for URL:', url);
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        body: { action: 'scrape', url },
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('🚀 Direct scrape response:', { data, error });

      if (error) {
        console.error('❌ Error in direct scrape:', error);
        throw error;
      }

      const newJob: StealthJob = {
        job_id: `direct-${Date.now()}`,
        url: data.url,
        priority: 'high',
        status: 'completed',
        profile_used: data.metadata?.profile_used,
        captcha_encountered: data.metadata?.captcha_encountered,
        created_at: new Date().toISOString(),
        structured_data: data.structured_data
      };

      setJobs(prev => [newJob, ...prev]);
      setSelectedJob(newJob);
      setUrl('');
      
      console.log('✅ Direct scrape completed successfully');
      toast({
        title: "Direct Scrape Complete",
        description: `Successfully scraped ${data.url} using ${data.metadata?.profile_used}`,
      });
    } catch (error: any) {
      console.error('💥 Direct scraping failed:', error);
      toast({
        title: "Scraping Failed",
        description: `Scraping failed: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    console.log('🎯 Component mounted, fetching system stats...');
    fetchSystemStats();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'processing': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-semibold">{systemStats.available_profiles}</div>
                  <div className="text-sm text-muted-foreground">Stealth Profiles</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-semibold">{systemStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Jobs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="font-semibold">{systemStats.pending}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-semibold">{systemStats.completed}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stealth Features Overview */}
      {systemStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Level 3 Intelligence Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {systemStats.stealth_features.map((feature, index) => (
                <Badge key={index} variant="outline" className="justify-start">
                  <Zap className="h-3 w-3 mr-1" />
                  {feature}
                </Badge>
              ))}
            </div>
            
            {systemStats.captcha_solver_configured && (
              <Alert className="mt-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  CAPTCHA solver is configured and ready for advanced anti-detection.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="scrape" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scrape">Stealth Scraping</TabsTrigger>
          <TabsTrigger value="jobs">Job Queue</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="scrape" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Anti-Detection Scraping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={runDirectScrape} 
                  disabled={!url || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Direct Scrape
                </Button>
                
                <Button 
                  onClick={enqueueJob} 
                  disabled={!url || isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Queue Job
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Direct Scrape:</strong> Immediate stealth scraping with random profile</p>
                <p><strong>Queue Job:</strong> Add to distributed job queue for processing</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stealth Job Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No jobs yet. Create your first stealth scraping job above.
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job.job_id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{job.url}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(job.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={getPriorityColor(job.priority)}>
                            {job.priority}
                          </Badge>
                          <Badge variant={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                          {job.captcha_encountered && (
                            <Badge variant="outline">
                              <Shield className="h-3 w-3 mr-1" />
                              CAPTCHA
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {job.profile_used && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Profile: {job.profile_used}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {selectedJob ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Scraping Results</span>
                  <Badge variant={getStatusColor(selectedJob.status)}>
                    {selectedJob.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Target URL</h4>
                  <CodeBlock code={selectedJob.url} />
                </div>

                {selectedJob.structured_data && (
                  <div>
                    <h4 className="font-medium mb-2">Extracted Data</h4>
                    <CodeBlock code={JSON.stringify(selectedJob.structured_data, null, 2)} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Job Details</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Priority:</strong> {selectedJob.priority}</p>
                      <p><strong>Created:</strong> {new Date(selectedJob.created_at).toLocaleString()}</p>
                      {selectedJob.profile_used && (
                        <p><strong>Profile:</strong> {selectedJob.profile_used}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Security Features</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Anti-Detection:</strong> ✓ Enabled</p>
                      <p><strong>Human Behavior:</strong> ✓ Simulated</p>
                      <p><strong>CAPTCHA Detection:</strong> {selectedJob.captcha_encountered ? '⚠️ Found' : '✓ None'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a job from the queue to view detailed results
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StealthScrapingInterface;
