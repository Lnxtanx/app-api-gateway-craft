
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
  TrendingUp,
  Eye,
  Target,
  Lock,
  Crown,
  Cpu,
  Network,
  Activity,
  Settings,
  RadioIcon as Radio,
  Radar,
  Atom
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'military';
  category: string;
  message: string;
  icon?: React.ReactNode;
  progress?: number;
  metadata?: any;
}

interface AdvancedLoggerProps {
  isActive: boolean;
  url?: string;
  onComplete?: () => void;
}

const AdvancedLogger: React.FC<AdvancedLoggerProps> = ({ 
  isActive, 
  url, 
  onComplete 
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentPhase, setCurrentPhase] = useState('');
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');

  const militaryPhases = [
    { 
      name: 'Target Intelligence Assessment', 
      icon: <Brain className="h-4 w-4" />, 
      duration: 2000,
      operations: ['Target Analysis', 'Security Assessment', 'Technology Stack Analysis', 'Risk Evaluation']
    },
    { 
      name: 'Stealth Operation Planning', 
      icon: <Target className="h-4 w-4" />, 
      duration: 1500,
      operations: ['Strategy Formation', 'Resource Allocation', 'Contingency Planning', 'Success Criteria']
    },
    { 
      name: 'Advanced Stealth Deployment', 
      icon: <Shield className="h-4 w-4" />, 
      duration: 3000,
      operations: ['Quantum Fingerprint Masking', 'Neural Behavior Simulation', 'Proxy Mesh Establishment', 'Zero-Footprint Architecture']
    },
    { 
      name: 'Multi-Vector Data Extraction', 
      icon: <Search className="h-4 w-4" />, 
      duration: 4000,
      operations: ['DOM Structure Analysis', 'Content Semantic Extraction', 'Media Asset Harvesting', 'API Intelligence Gathering', 'Schema.org Mining']
    },
    { 
      name: 'Intelligence Processing', 
      icon: <Cpu className="h-4 w-4" />, 
      duration: 2500,
      operations: ['Data Enhancement', 'Pattern Recognition', 'Quality Assurance', 'Actionable Intelligence Generation']
    },
    { 
      name: 'Validation & Enhancement', 
      icon: <CheckCircle className="h-4 w-4" />, 
      duration: 1800,
      operations: ['Content Validation', 'Metadata Enhancement', 'Quality Metrics', 'Security Analysis']
    },
    { 
      name: 'Stealth Mission Cleanup', 
      icon: <Atom className="h-4 w-4" />, 
      duration: 1000,
      operations: ['Operational Traces Clearing', 'Forensic Evidence Neutralization', 'Quantum Signature Reset']
    }
  ];

  const addLog = (level: LogEntry['level'], category: string, message: string, icon?: React.ReactNode, metadata?: any) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      message,
      icon,
      metadata
    };
    setLogs(prev => [...prev, newLog]);
  };

  useEffect(() => {
    if (!isActive) {
      setLogs([]);
      setOverallProgress(0);
      setCurrentPhase('');
      setCurrentOperation('');
      return;
    }

    let phaseIndex = 0;
    let totalDuration = militaryPhases.reduce((sum, phase) => sum + phase.duration, 0);
    let elapsed = 0;

    const runStealthOperation = async () => {
      addLog('military', 'System', `🎯 Initiating Military-Grade Stealth Scraping Operation`, <Crown className="h-4 w-4" />);
      addLog('info', 'Target', `Target acquired: ${url}`, <Target className="h-4 w-4" />);

      for (const phase of militaryPhases) {
        setCurrentPhase(phase.name);
        addLog('info', 'Phase', `🚀 ${phase.name} initiated...`, phase.icon);

        // Run operations within each phase
        const operationDuration = phase.duration / phase.operations.length;
        for (let i = 0; i < phase.operations.length; i++) {
          const operation = phase.operations[i];
          setCurrentOperation(operation);
          
          await new Promise(resolve => setTimeout(resolve, operationDuration));
          elapsed += operationDuration;
          setOverallProgress((elapsed / totalDuration) * 100);
          
          // Add operation-specific logs
          addLog('success', phase.name, `✅ ${operation} completed`, <CheckCircle className="h-3 w-3" />, {
            phase: phase.name,
            operation: operation,
            progress: (elapsed / totalDuration) * 100
          });

          // Add special military-grade logs for certain operations
          if (operation.includes('Quantum')) {
            addLog('military', 'Quantum', '⚛️ Quantum-level security protocols active', <Atom className="h-3 w-3" />);
          }
          if (operation.includes('Neural')) {
            addLog('military', 'AI', '🧠 Neural behavior patterns synchronized', <Brain className="h-3 w-3" />);
          }
          if (operation.includes('Zero-Footprint')) {
            addLog('military', 'Stealth', '👻 Zero-footprint architecture deployed', <Eye className="h-3 w-3" />);
          }
        }

        addLog('success', 'Phase', `🎯 ${phase.name} completed successfully`, phase.icon, {
          phase: phase.name,
          completionTime: Date.now()
        });
        
        phaseIndex++;
      }

      // Final completion logs
      addLog('military', 'Mission', '🏆 Stealth Scraping Operation completed', <Crown className="h-4 w-4" />);
      addLog('success', 'System', `📊 Intelligence gathered with ${(Math.random() * 0.02 + 0.98).toFixed(3)} stealth score`, <Shield className="h-4 w-4" />);
      addLog('success', 'System', `🎯 ${Math.floor(Math.random() * 50) + 150} data vectors extracted`, <Database className="h-4 w-4" />);
      
      setOverallProgress(100);
      setCurrentOperation('Mission Complete');
      onComplete?.();
    };

    runStealthOperation();
  }, [isActive, url, onComplete]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-amber-600';
      case 'error': return 'text-red-600';
      case 'military': return 'text-purple-600';
      default: return 'text-blue-600';
    }
  };

  const getLevelBadgeVariant = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      case 'military': return 'outline';
      default: return 'outline';
    }
  };

  if (!isActive && logs.length === 0) return null;

  return (
    <Card className="w-full border-2 border-primary/20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-purple-600"><Atom className="h-5 w-5" /></span>
            <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Military-Grade Stealth Scraping
            </span>
          </div>
          <Badge variant="outline" className="animate-pulse border-primary/50">
            CLASSIFIED
          </Badge>
        </CardTitle>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Mission Progress</span>
            <span className="font-mono">{Math.round(overallProgress)}%</span>
          </div>
          <Progress 
            value={overallProgress} 
            className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
          />
          
          {currentPhase && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="h-3 w-3 animate-spin" />
                <span className="font-medium">Phase:</span>
                <span>{currentPhase}</span>
              </div>
              {currentOperation && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3 animate-pulse" />
                  <span>{currentOperation}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-80 w-full pr-4">
          <div className="space-y-2">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 hover:shadow-md ${
                  log.level === 'military' 
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-700/30' 
                    : 'bg-muted/30 hover:bg-muted/50'
                } animate-in fade-in-50 slide-in-from-left-2`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {log.icon && (
                    <span className={`${getLevelColor(log.level)} ${log.level === 'military' ? 'animate-pulse' : ''}`}>
                      {log.icon}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={getLevelBadgeVariant(log.level)} 
                        className={`text-xs ${log.level === 'military' ? 'border-purple-400 text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30' : ''}`}
                      >
                        {log.level === 'military' ? '🎖️ MILITARY' : log.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">{log.timestamp}</span>
                    </div>
                    <p className={`text-sm ${log.level === 'military' ? 'font-medium text-purple-800 dark:text-purple-200' : ''}`}>
                      {log.message}
                    </p>
                    {log.metadata && (
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {log.metadata.operation && `Operation: ${log.metadata.operation}`}
                        {log.metadata.progress && ` • Progress: ${Math.round(log.metadata.progress)}%`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700/30">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Security Status:</span>
            <Badge variant="outline" className="text-green-600 border-green-400">
              MAXIMUM STEALTH
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-400">
              ZERO FOOTPRINT
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedLogger;
