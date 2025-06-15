
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  LoaderCircle, 
  AlertTriangle, 
  Brain, 
  Shield, 
  Database, 
  Zap, 
  Globe,
  Search,
  Code,
  Clock,
  TrendingUp
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  category: string;
  message: string;
  icon?: React.ReactNode;
  progress?: number;
}

interface AdvancedLoggerProps {
  isActive: boolean;
  url?: string;
  onComplete?: () => void;
}

const AdvancedLogger: React.FC<AdvancedLoggerProps> = ({ isActive, url, onComplete }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentPhase, setCurrentPhase] = useState('');
  const [overallProgress, setOverallProgress] = useState(0);

  const phases = [
    { name: 'Initializing', icon: <LoaderCircle className="h-4 w-4" />, duration: 1000 },
    { name: 'Analyzing URL Structure', icon: <Globe className="h-4 w-4" />, duration: 1500 },
    { name: 'AI Content Analysis', icon: <Brain className="h-4 w-4" />, duration: 2500 },
    { name: 'Security Assessment', icon: <Shield className="h-4 w-4" />, duration: 1200 },
    { name: 'Data Extraction', icon: <Search className="h-4 w-4" />, duration: 3000 },
    { name: 'Quality Enhancement', icon: <TrendingUp className="h-4 w-4" />, duration: 1800 },
    { name: 'API Generation', icon: <Code className="h-4 w-4" />, duration: 2000 },
    { name: 'Database Setup', icon: <Database className="h-4 w-4" />, duration: 1500 },
    { name: 'Performance Optimization', icon: <Zap className="h-4 w-4" />, duration: 1000 },
    { name: 'Finalizing', icon: <CheckCircle className="h-4 w-4" />, duration: 800 }
  ];

  const addLog = (level: LogEntry['level'], category: string, message: string, icon?: React.ReactNode) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      message,
      icon
    };
    setLogs(prev => [...prev, newLog]);
  };

  useEffect(() => {
    if (!isActive) {
      setLogs([]);
      setOverallProgress(0);
      setCurrentPhase('');
      return;
    }

    let phaseIndex = 0;
    let totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
    let elapsed = 0;

    const runPhases = async () => {
      addLog('info', 'System', `Starting API generation for ${url}`, <Globe className="h-4 w-4" />);

      for (const phase of phases) {
        setCurrentPhase(phase.name);
        addLog('info', 'Phase', `${phase.name}...`, phase.icon);

        // Simulate realistic sub-steps for each phase
        const subSteps = getSubStepsForPhase(phase.name);
        const stepDuration = phase.duration / subSteps.length;

        for (let i = 0; i < subSteps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          elapsed += stepDuration;
          setOverallProgress((elapsed / totalDuration) * 100);
          
          if (i < subSteps.length - 1) {
            addLog('success', phase.name, subSteps[i], <CheckCircle className="h-3 w-3" />);
          }
        }

        addLog('success', 'Phase', `${phase.name} completed`, <CheckCircle className="h-4 w-4" />);
        phaseIndex++;
      }

      addLog('success', 'System', 'API generation completed successfully!', <CheckCircle className="h-4 w-4" />);
      setOverallProgress(100);
      onComplete?.();
    };

    runPhases();
  }, [isActive, url, onComplete]);

  const getSubStepsForPhase = (phaseName: string): string[] => {
    const subSteps: Record<string, string[]> = {
      'Initializing': ['Loading stealth profiles', 'Setting up browser environment'],
      'Analyzing URL Structure': ['Parsing domain structure', 'Detecting website technology', 'Analyzing robots.txt'],
      'AI Content Analysis': ['Extracting page structure', 'Identifying data patterns', 'Classifying content types', 'Detecting dynamic elements'],
      'Security Assessment': ['Checking anti-bot measures', 'Analyzing rate limits', 'Testing access permissions'],
      'Data Extraction': ['Scraping content', 'Processing HTML structure', 'Extracting metadata', 'Cleaning data'],
      'Quality Enhancement': ['Validating data integrity', 'Enhancing with AI insights', 'Optimizing structure'],
      'API Generation': ['Creating endpoints', 'Generating documentation', 'Setting up authentication'],
      'Database Setup': ['Creating tables', 'Setting up indexes', 'Configuring relationships'],
      'Performance Optimization': ['Caching strategies', 'Query optimization'],
      'Finalizing': ['Running final tests', 'Deployment ready']
    };
    return subSteps[phaseName] || ['Processing...'];
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-amber-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getLevelBadgeVariant = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  if (!isActive && logs.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Level 3 AI Intelligence - Live Processing
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          {currentPhase && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="h-3 w-3 animate-spin" />
              Current: {currentPhase}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full pr-4">
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {log.icon && <span className={getLevelColor(log.level)}>{log.icon}</span>}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                        {log.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-sm">{log.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdvancedLogger;
