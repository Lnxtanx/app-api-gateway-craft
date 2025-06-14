
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Shield, Zap, Globe, Activity, Eye, Brain, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StealthStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  available_profiles: number;
  proxy_count: number;
  captcha_solver_configured: boolean;
  stealth_features: string[];
}

interface ScrapeJob {
  job_id: string;
  url: string;
  priority: string;
  metadata?: {
    profile_used: string;
    captcha_encountered: boolean;
    content_length: number;
  };
}

export default function StealthScrapingInterface() {
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StealthStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<ScrapeJob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        method: 'GET',
        body: new URLSearchParams({ action: 'stats' })
      });

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDirectScrape = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to scrape",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        method: 'GET',
        body: new URLSearchParams({ 
          action: 'scrape',
          url: url.trim(),
          queue: 'false'
        })
      });

      if (error) throw error;

      const newJob: ScrapeJob = {
        job_id: 'direct-' + Date.now(),
        url: url.trim(),
        priority: 'direct',
        metadata: data.metadata
      };

      setRecentJobs(prev => [newJob, ...prev.slice(0, 4)]);
      
      toast({
        title: "Stealth Scrape Complete",
        description: `Successfully scraped ${url} using ${data.metadata.profile_used} profile`,
      });

      await loadStats();
    } catch (error) {
      console.error('Direct scraping failed:', error);
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to scrape the URL",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnqueueJob = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to enqueue",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        method: 'GET',
        body: new URLSearchParams({ 
          action: 'enqueue',
          url: url.trim(),
          priority: priority
        })
      });

      if (error) throw error;

      const newJob: ScrapeJob = {
        job_id: data.job_id,
        url: data.url,
        priority: data.priority
      };

      setRecentJobs(prev => [newJob, ...prev.slice(0, 4)]);
      
      toast({
        title: "Job Enqueued",
        description: `Job ${data.job_id} added to queue with ${priority} priority`,
      });

      await loadStats();
      setUrl('');
    } catch (error) {
      console.error('Job enqueue failed:', error);
      toast({
        title: "Enqueue Failed",
        description: error.message || "Failed to enqueue the job",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessQueue = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        method: 'GET',
        body: new URLSearchParams({ 
          action: 'scrape',
          queue: 'true'
        })
      });

      if (error) throw error;

      if (data.job_id) {
        const processedJob: ScrapeJob = {
          job_id: data.job_id,
          url: data.url,
          priority: 'processed',
          metadata: data.metadata
        };

        setRecentJobs(prev => [processedJob, ...prev.slice(0, 4)]);
        
        toast({
          title: "Queue Job Processed",
          description: `Job ${data.job_id} completed successfully`,
        });
      } else {
        toast({
          title: "Queue Empty",
          description: "No jobs available in the queue",
        });
      }

      await loadStats();
    } catch (error) {
      console.error('Queue processing failed:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process queue",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      case 'direct': return 'bg-blue-500';
      case 'processed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stealth Profiles</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.available_profiles || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available fingerprints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? Math.round((stats.completed / (stats.total || 1)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Anti-detection success
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAPTCHA Solver</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.captcha_solver_configured ? 'ON' : 'OFF'}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-solving status
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scrape" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scrape">Direct Scrape</TabsTrigger>
          <TabsTrigger value="queue">Job Queue</TabsTrigger>
          <TabsTrigger value="status">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="scrape" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Direct Stealth Scraping
              </CardTitle>
              <CardDescription>
                Immediately scrape a URL using advanced anti-detection techniques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Enter URL to scrape (e.g., https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleDirectScrape} 
                  disabled={isLoading}
                  className="sm:w-auto"
                >
                  {isLoading ? 'Scraping...' : 'Scrape Now'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Browser Fingerprint Rotation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Human Behavior Simulation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Residential Proxy Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">CAPTCHA Auto-Solving</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Distributed Job Queue
              </CardTitle>
              <CardDescription>
                Manage scraping jobs with priority queuing and distributed processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Enter URL to add to queue"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleEnqueueJob} 
                  disabled={isLoading}
                  variant="outline"
                >
                  Enqueue
                </Button>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleProcessQueue} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  Process Next Job
                </Button>
              </div>

              {stats && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Queue Progress</span>
                    <span>{stats.completed}/{stats.total}</span>
                  </div>
                  <Progress 
                    value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} 
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                System Status & Capabilities
              </CardTitle>
              <CardDescription>
                Overview of stealth features and system performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.stealth_features && (
                <div>
                  <h4 className="font-medium mb-2">Active Stealth Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stats.stealth_features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="justify-start">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-500">{stats?.pending || 0}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">{stats?.processing || 0}</div>
                  <div className="text-xs text-muted-foreground">Processing</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{stats?.completed || 0}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{stats?.failed || 0}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Latest scraping activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentJobs.map((job, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getPriorityColor(job.priority)}>
                      {job.priority}
                    </Badge>
                    <span className="text-sm font-medium">{job.job_id}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-xs">
                      {job.url}
                    </span>
                  </div>
                  {job.metadata && (
                    <div className="flex items-center gap-2">
                      {job.metadata.captcha_encountered && (
                        <AlertCircle className="h-4 w-4 text-orange-500" title="CAPTCHA encountered" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {job.metadata.profile_used}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
