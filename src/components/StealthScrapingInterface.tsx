
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
import { useAuth } from '@/contexts/AuthContext';
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
  BarChart3,
  Database,
  ExternalLink,
  Lock,
  Target,
  Cpu
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
  html?: string;
  metadata?: any;
  api_endpoint?: string;
  api_key?: string;
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
  stealth_levels: { level: number, success_rate: number, features: string[] }[];
}

const StealthScrapingInterface: React.FC = () => {
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState('medium');
  const [stealthLevel, setStealthLevel] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<StealthJob[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [selectedJob, setSelectedJob] = useState<StealthJob | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSystemStats = async () => {
    try {
      console.log('🔍 Fetching system stats...');
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        body: {},
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('📊 System stats response:', data);

      if (error) {
        console.error('❌ Error fetching system stats:', error);
        throw error;
      }
      
      setSystemStats(data);
      console.log('✅ System stats updated successfully');
    } catch (error: any) {
      console.error('💥 Failed to fetch system stats:', error);
      toast({
        title: "Error",
        description: `Failed to fetch system stats: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const generateApiFromScrapeResult = async (scrapeResult: any) => {
    if (!user) {
      console.log('⚠️ User not logged in, skipping API generation');
      return null;
    }

    try {
      console.log('🔧 Generating API from scrape result for:', scrapeResult.url);
      const { data: generatedApiData, error } = await supabase.functions.invoke('generate-api', {
        body: { source_url: scrapeResult.url },
      });

      if (error) {
        console.error('❌ Error generating API:', error);
        throw error;
      }

      console.log('✅ API generated successfully:', generatedApiData);
      return generatedApiData;
    } catch (error: any) {
      console.error('💥 Failed to generate API:', error);
      toast({
        title: "API Generation Failed",
        description: `Failed to save to dashboard: ${error.message}`,
        variant: "destructive",
      });
      return null;
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

      console.log('📋 Enqueue response:', data);

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
      console.log(`🚀 Starting Level ${stealthLevel} direct scrape for URL:`, url);
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        body: { action: 'scrape', url, stealth_level: stealthLevel },
        headers: { 'Content-Type': 'application/json' }
      });

      console.log(`🚀 Level ${stealthLevel} scrape response:`, data);

      if (error) {
        console.error('❌ Error in direct scrape:', error);
        throw error;
      }

      // Validate the response structure - check if it's actual scrape data
      if (!data || !data.url || !data.structured_data) {
        console.error('❌ Invalid scrape response structure:', data);
        throw new Error('Invalid response from stealth scraper - expected scrape data but got stats');
      }

      // Generate API for the scraped data if user is logged in
      let apiData = null;
      if (user) {
        console.log('👤 User logged in, generating API...');
        apiData = await generateApiFromScrapeResult(data);
      }

      const newJob: StealthJob = {
        job_id: `direct-${Date.now()}`,
        url: data.url,
        priority: 'high',
        status: 'completed',
        profile_used: data.metadata?.profile_used || 'Unknown',
        captcha_encountered: data.metadata?.captcha_encountered || false,
        created_at: new Date().toISOString(),
        structured_data: data.structured_data,
        html: data.html,
        metadata: data.metadata,
        api_endpoint: apiData?.api_endpoint,
        api_key: apiData?.api_key
      };

      setJobs(prev => [newJob, ...prev]);
      setSelectedJob(newJob);
      setUrl('');
      
      console.log(`✅ Level ${stealthLevel} direct scrape completed successfully`);
      
      const message = apiData 
        ? `Successfully scraped ${data.url} with Level ${stealthLevel} stealth and saved API to dashboard`
        : `Successfully scraped ${data.url} using Level ${stealthLevel} stealth (${data.metadata?.profile_used || 'stealth profile'})`;
      
      toast({
        title: "Stealth Scrape Complete",
        description: message,
      });
    } catch (error: any) {
      console.error('💥 Direct scraping failed:', error);
      toast({
        title: "Scraping Failed",
        description: `Level ${stealthLevel} scraping failed: ${error.message}`,
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

  const getStealthLevelIcon = (level: number) => {
    switch (level) {
      case 1: return <Shield className="h-4 w-4" />;
      case 2: return <Brain className="h-4 w-4" />;
      case 3: return <Lock className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getStealthLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'text-blue-500';
      case 2: return 'text-purple-500';
      case 3: return 'text-red-500';
      default: return 'text-blue-500';
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
                  <div className="font-semibold">Level 1-3</div>
                  <div className="text-sm text-muted-foreground">Stealth Levels</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="font-semibold">60-95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-semibold">{systemStats.captcha_solver_configured ? 'Yes' : 'No'}</div>
                  <div className="text-sm text-muted-foreground">CAPTCHA Solver</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stealth Levels Overview */}
      {systemStats && systemStats.stealth_levels && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Level 1: Basic Stealth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">60-70% Success</div>
                <div className="text-sm text-muted-foreground">
                  User Agent Rotation, Header Normalization, Basic Rate Limiting, Simple Proxy Usage
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Level 2: Intermediate Stealth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">80-85% Success</div>
                <div className="text-sm text-muted-foreground">
                  Fingerprint Masking, Session Management, Residential Proxies, Content-Aware Delays
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" />
                Level 3: Advanced Anti-Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-600">90-95% Success</div>
                <div className="text-sm text-muted-foreground">
                  ML Evasion, CAPTCHA Solving, Traffic Distribution, Advanced Fingerprint Spoofing
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
                <Select value={stealthLevel.toString()} onValueChange={(value) => setStealthLevel(parseInt(value) as 1 | 2 | 3)}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1: Basic (60-70%)</SelectItem>
                    <SelectItem value="2">Level 2: Intermediate (80-85%)</SelectItem>
                    <SelectItem value="3">Level 3: Advanced (90-95%)</SelectItem>
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
                  Direct Scrape (Level {stealthLevel})
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
                <p><strong>Level {stealthLevel} Features:</strong></p>
                {stealthLevel === 1 && (
                  <ul className="ml-4 space-y-1">
                    <li>• User Agent Rotation & Header Normalization</li>
                    <li>• Basic Rate Limiting & Simple Proxy Usage</li>
                    <li>• Human Behavior Simulation</li>
                  </ul>
                )}
                {stealthLevel === 2 && (
                  <ul className="ml-4 space-y-1">
                    <li>• All Level 1 features + Advanced enhancements</li>
                    <li>• Browser Fingerprint Masking & Session Management</li>
                    <li>• Residential Proxy Networks & Content-Aware Delays</li>
                    <li>• Enhanced Human Behavior Patterns</li>
                  </ul>
                )}
                {stealthLevel === 3 && (
                  <ul className="ml-4 space-y-1">
                    <li>• All Level 2 features + Maximum protection</li>
                    <li>• ML-Based Evasion & CAPTCHA Solving</li>
                    <li>• Advanced Fingerprint Spoofing & Traffic Distribution</li>
                    <li>• Browser Automation Stealth & Adaptive Intelligence</li>
                  </ul>
                )}
                {user && (
                  <p className="text-green-600"><strong>✓ Logged in:</strong> Results will be saved to your dashboard</p>
                )}
                {!user && (
                  <p className="text-amber-600"><strong>⚠ Not logged in:</strong> Results won't be saved to dashboard</p>
                )}
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
                          {job.api_endpoint && (
                            <Badge variant="outline">
                              <Database className="h-3 w-3 mr-1" />
                              API Saved
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
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Scraping Results</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(selectedJob.status)}>
                        {selectedJob.status}
                      </Badge>
                      {selectedJob.api_endpoint && (
                        <Badge variant="outline">
                          <Database className="h-3 w-3 mr-1" />
                          API Generated
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Target URL
                    </h4>
                    <div className="flex items-center gap-2">
                      <CodeBlock code={selectedJob.url} />
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedJob.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {selectedJob.api_endpoint && selectedJob.api_key && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2 text-green-800 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Generated API (Saved to Dashboard)
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-green-700">Endpoint:</label>
                          <CodeBlock code={selectedJob.api_endpoint} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-green-700">API Key:</label>
                          <CodeBlock code={selectedJob.api_key} />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedJob.structured_data && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Extracted Structured Data
                      </h4>
                      <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-sm">
                          {JSON.stringify(selectedJob.structured_data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Job Details</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Priority:</strong> {selectedJob.priority}</p>
                        <p><strong>Created:</strong> {new Date(selectedJob.created_at).toLocaleString()}</p>
                        <p><strong>Profile Used:</strong> {selectedJob.profile_used || 'Unknown'}</p>
                        {selectedJob.metadata?.content_length && (
                          <p><strong>Content Length:</strong> {selectedJob.metadata.content_length.toLocaleString()} characters</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Security Features</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Anti-Detection:</strong> ✓ Enabled</p>
                        <p><strong>Human Behavior:</strong> ✓ Simulated</p>
                        <p><strong>CAPTCHA Detection:</strong> {selectedJob.captcha_encountered ? '⚠️ Found' : '✓ None'}</p>
                        <p><strong>Fingerprint Rotation:</strong> ✓ Active</p>
                      </div>
                    </div>
                  </div>

                  {selectedJob.metadata?.extraction_summary && (
                    <div>
                      <h4 className="font-medium mb-2">Extraction Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{selectedJob.metadata.extraction_summary.quotes_found || 0}</div>
                          <div className="text-muted-foreground">Quotes</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{selectedJob.metadata.extraction_summary.articles_found || 0}</div>
                          <div className="text-muted-foreground">Articles</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{selectedJob.metadata.extraction_summary.links_found || 0}</div>
                          <div className="text-muted-foreground">Links</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{selectedJob.metadata.extraction_summary.images_found || 0}</div>
                          <div className="text-muted-foreground">Images</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
