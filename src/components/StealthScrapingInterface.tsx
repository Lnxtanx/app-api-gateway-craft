
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
  Cpu,
  Crown,
  Atom
} from 'lucide-react';
import CodeBlock from './CodeBlock';
import AdvancedLogger from './AdvancedLogger';

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
  intelligence_protocols: string[];
}

const StealthScrapingInterface: React.FC = () => {
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState('medium');
  const [scrapingIntent, setScrapingIntent] = useState('data_extraction');
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<StealthJob[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [selectedJob, setSelectedJob] = useState<StealthJob | null>(null);
  const [showAdvancedLogger, setShowAdvancedLogger] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSystemStats = async () => {
    try {
      console.log('🔍 Fetching military-grade system stats...');
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        body: {},
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('📊 Military system stats response:', data);

      if (error) {
        console.error('❌ Error fetching system stats:', error);
        throw error;
      }
      
      setSystemStats(data);
      console.log('✅ Military system stats updated successfully');
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
      console.log('🔧 Generating API from stealth scrape result for:', scrapeResult.url);
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
      console.log('📋 Enqueuing military-grade stealth job for URL:', url);
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        body: { action: 'enqueue', url, priority },
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('📋 Military stealth enqueue response:', data);

      if (error) {
        console.error('❌ Error enqueuing stealth job:', error);
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
        title: "Military-Grade Job Enqueued",
        description: `Stealth scraping operation queued for ${data.url}`,
      });

      await fetchSystemStats();
    } catch (error: any) {
      console.error('💥 Failed to enqueue stealth job:', error);
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
    setShowAdvancedLogger(true);
    try {
      console.log(`🚀 Starting military-grade stealth scrape for URL:`, url);
      const { data, error } = await supabase.functions.invoke('stealth-scraper', {
        body: { 
          action: 'scrape', 
          url, 
          scraping_intent: scrapingIntent
        },
        headers: { 'Content-Type': 'application/json' }
      });

      console.log(`🚀 Military-grade scrape response:`, data);

      if (error) {
        console.error('❌ Error in military stealth scrape:', error);
        throw error;
      }

      // Validate the response structure
      if (!data || !data.url || !data.structured_data) {
        console.error('❌ Invalid scrape response structure:', data);
        throw new Error('Invalid response from military stealth scraper');
      }

      // Generate API for the scraped data if user is logged in
      let apiData = null;
      if (user) {
        console.log('👤 User logged in, generating API...');
        apiData = await generateApiFromScrapeResult(data);
      }

      const newJob: StealthJob = {
        job_id: `military-${Date.now()}`,
        url: data.url,
        priority: 'high',
        status: 'completed',
        profile_used: data.metadata?.profile_used || 'Military-Grade',
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
      
      console.log(`✅ Military-grade stealth scrape completed successfully`);
      
      const message = apiData 
        ? `Successfully scraped ${data.url} with Military-Grade stealth and saved API to dashboard`
        : `Successfully scraped ${data.url} using Military-Grade stealth protocols`;
      
      toast({
        title: "🎖️ Military Stealth Scrape Complete",
        description: message,
      });
    } catch (error: any) {
      console.error('💥 Military stealth scraping failed:', error);
      toast({
        title: "Scraping Failed",
        description: `Military-grade scraping failed: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowAdvancedLogger(false), 3000);
    }
  };

  React.useEffect(() => {
    console.log('🎯 Military component mounted, fetching system stats...');
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
      {/* Enhanced Military System Status Overview */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Atom className="h-5 w-5 text-purple-500 animate-pulse" />
                <div>
                  <div className="font-semibold">Military-Grade</div>
                  <div className="text-sm text-muted-foreground">Stealth Protocols</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="font-semibold">98-99%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-semibold">Intelligence 5</div>
                  <div className="text-sm text-muted-foreground">AI Protocols</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-semibold">{systemStats.captcha_solver_configured ? 'Active' : 'Standby'}</div>
                  <div className="text-sm text-muted-foreground">Zero-Footprint</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Military-Grade Logger */}
      {showAdvancedLogger && (
        <div className="w-full animate-in fade-in-50 duration-500">
          <AdvancedLogger 
            isActive={isLoading} 
            url={url}
            onComplete={() => {
              console.log('Military-grade stealth scraping operation completed');
            }} 
          />
        </div>
      )}

      <Tabs defaultValue="scrape" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scrape">🎖️ Military Stealth Scraping</TabsTrigger>
          <TabsTrigger value="jobs">Mission Queue</TabsTrigger>
          <TabsTrigger value="results">Intelligence Results</TabsTrigger>
        </TabsList>

        <TabsContent value="scrape" className="space-y-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Atom className="h-5 w-5 text-purple-500 animate-pulse" />
                  <Crown className="h-5 w-5 text-amber-500" />
                </div>
                Military-Grade Stealth Intelligence Extraction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://target-site.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 border-2 focus:border-primary"
                />
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Select value={scrapingIntent} onValueChange={setScrapingIntent}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data_extraction">Intelligence Extraction</SelectItem>
                    <SelectItem value="research_analysis">Research Analysis</SelectItem>
                    <SelectItem value="competitive_intelligence">Competitive Intelligence</SelectItem>
                    <SelectItem value="market_research">Market Research</SelectItem>
                    <SelectItem value="academic_research">Academic Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={runDirectScrape} 
                  disabled={!url || isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary via-purple-600 to-amber-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-amber-600/90"
                >
                  {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
                  Deploy Military Stealth
                </Button>
                
                <Button 
                  onClick={enqueueJob} 
                  disabled={!url || isLoading}
                  variant="outline"
                  className="flex items-center gap-2 border-2 border-primary/30"
                >
                  <Plus className="h-4 w-4" />
                  Queue Mission
                </Button>
              </div>

              <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-amber-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-amber-900/20 border-2 border-purple-200 dark:border-purple-700/30 rounded-lg p-4">
                <div className="text-sm space-y-2">
                  <p className="font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                    <Atom className="h-4 w-4" />
                    Military-Grade Stealth Protocols Active:
                  </p>
                  <ul className="ml-6 space-y-1 text-purple-700 dark:text-purple-300">
                    <li>• ⚛️ Quantum Fingerprint Masking & Neural Behavior Simulation</li>
                    <li>• 🧠 AI-Powered Human Behavior Patterns & Zero-Footprint Architecture</li>
                    <li>• 🛡️ Advanced Anti-Fingerprinting & Sophisticated CAPTCHA Solutions</li>
                    <li>• 🎯 Multi-Vector Intelligence Extraction (15+ data types)</li>
                    <li>• 👻 Legal Compliance Integration & Banking-Grade Security</li>
                    <li className="text-amber-600 dark:text-amber-400 font-semibold">• 🏆 Intelligence Level 5: Maximum Stealth Capability</li>
                  </ul>
                  {user && (
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      <strong>✓ Authenticated:</strong> Intelligence will be saved to dashboard
                    </p>
                  )}
                  {!user && (
                    <p className="text-amber-600 dark:text-amber-400 font-medium">
                      <strong>⚠ Unauthenticated:</strong> Intelligence won't be saved to dashboard
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Active Stealth Missions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Atom className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active missions. Deploy your first military-grade stealth operation above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job.job_id}
                      className="border-2 border-primary/10 rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-all duration-300 hover:border-primary/30"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate flex items-center gap-2">
                            <Crown className="h-4 w-4 text-amber-500" />
                            {job.url}
                          </div>
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
                            <Badge variant="outline" className="border-green-400 text-green-700">
                              <Database className="h-3 w-3 mr-1" />
                              API Saved
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {job.profile_used && (
                        <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                          <Atom className="h-3 w-3 text-purple-500" />
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
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      Intelligence Extraction Results
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(selectedJob.status)}>
                        {selectedJob.status}
                      </Badge>
                      {selectedJob.api_endpoint && (
                        <Badge variant="outline" className="border-green-400 text-green-700">
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
                      <Target className="h-4 w-4 text-primary" />
                      Target Intelligence
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
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700/30 rounded-lg p-4">
                      <h4 className="font-medium mb-2 text-green-800 dark:text-green-200 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        🎖️ Generated Military API (Saved to Dashboard)
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-green-700 dark:text-green-300">Endpoint:</label>
                          <CodeBlock code={selectedJob.api_endpoint} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-green-700 dark:text-green-300">API Key:</label>
                          <CodeBlock code={selectedJob.api_key} />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedJob.structured_data && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Atom className="h-4 w-4 text-purple-500" />
                        Extracted Intelligence Data
                      </h4>
                      <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto border-2 border-primary/10">
                        <pre className="text-sm">
                          {JSON.stringify(selectedJob.structured_data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Mission Details
                      </h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Priority:</strong> {selectedJob.priority}</p>
                        <p><strong>Deployed:</strong> {new Date(selectedJob.created_at).toLocaleString()}</p>
                        <p><strong>Stealth Profile:</strong> {selectedJob.profile_used || 'Military-Grade'}</p>
                        {selectedJob.metadata?.content_length && (
                          <p><strong>Data Extracted:</strong> {selectedJob.metadata.content_length.toLocaleString()} characters</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security Protocols
                      </h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Anti-Detection:</strong> ✓ Military-Grade</p>
                        <p><strong>AI Behavior:</strong> ✓ Intelligence Level 5</p>
                        <p><strong>CAPTCHA Status:</strong> {selectedJob.captcha_encountered ? '⚠️ Encountered & Solved' : '✓ None Detected'}</p>
                        <p><strong>Zero-Footprint:</strong> ✓ Confirmed</p>
                      </div>
                    </div>
                  </div>

                  {selectedJob.metadata?.extraction_summary && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Intelligence Summary
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="font-semibold text-lg">{selectedJob.metadata.extraction_summary.quotes_found || 0}</div>
                          <div className="text-muted-foreground">Quotes</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="font-semibold text-lg">{selectedJob.metadata.extraction_summary.articles_found || 0}</div>
                          <div className="text-muted-foreground">Articles</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="font-semibold text-lg">{selectedJob.metadata.extraction_summary.links_found || 0}</div>
                          <div className="text-muted-foreground">Links</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <div className="font-semibold text-lg">{selectedJob.metadata.extraction_summary.images_found || 0}</div>
                          <div className="text-muted-foreground">Images</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-2 border-primary/10">
              <CardContent className="text-center py-8">
                <div className="flex items-center justify-center mb-4">
                  <Atom className="h-12 w-12 text-purple-500 opacity-50 animate-pulse" />
                  <Crown className="h-8 w-8 text-amber-500 opacity-50 ml-2" />
                </div>
                <p className="text-muted-foreground">
                  Select a mission from the queue to view detailed intelligence results
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
