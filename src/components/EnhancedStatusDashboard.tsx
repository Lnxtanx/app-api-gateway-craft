
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Brain, 
  Database, 
  Globe, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  Target,
  Cpu,
  Crown
} from 'lucide-react';

interface SystemMetrics {
  successRate: number;
  totalApis: number;
  stealthLevels: {
    level: number;
    name: string;
    requests: number;
    successRate: number;
    icon: React.ReactNode;
    color: string;
  }[];
}

interface EnhancedStatusDashboardProps {
  metrics?: SystemMetrics;
  isLoading?: boolean;
}

const fetchTotalApis = async () => {
  const { count, error } = await supabase
    .from('generated_apis')
    .select('*', { count: 'exact', head: true });
  
  if (error) throw error;
  return count || 0;
};

const EnhancedStatusDashboard: React.FC<EnhancedStatusDashboardProps> = ({ 
  metrics, 
  isLoading = false 
}) => {
  const { data: totalApis, isLoading: isLoadingApis } = useQuery({
    queryKey: ['totalApis'],
    queryFn: fetchTotalApis,
  });

  const defaultMetrics: SystemMetrics = {
    successRate: 94.2,
    totalApis: totalApis || 0,
    stealthLevels: [
      {
        level: 1,
        name: 'Basic',
        requests: 3200,
        successRate: 68,
        icon: <Shield className="h-4 w-4" />,
        color: 'text-blue-500'
      },
      {
        level: 2,
        name: 'Intermediate',
        requests: 5600,
        successRate: 83,
        icon: <Brain className="h-4 w-4" />,
        color: 'text-purple-500'
      },
      {
        level: 3,
        name: 'Advanced',
        requests: 4800,
        successRate: 92,
        icon: <Cpu className="h-4 w-4" />,
        color: 'text-red-500'
      },
      {
        level: 4,
        name: 'Enterprise',
        requests: 2247,
        successRate: 98,
        icon: <Crown className="h-4 w-4" />,
        color: 'text-amber-500'
      }
    ]
  };

  const data = metrics || defaultMetrics;

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-semibold">{data.successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-500" />
              <div>
                <div className="font-semibold">
                  {isLoadingApis ? '...' : data.totalApis.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total APIs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stealth Levels Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Stealth Levels Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.stealthLevels.map((level) => (
              <div key={level.level} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={level.color}>{level.icon}</span>
                  <span className="font-medium">Level {level.level}: {level.name}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span className="font-semibold">{level.successRate}%</span>
                  </div>
                  <Progress value={level.successRate} className="h-2" />
                </div>

                <div className="text-sm text-muted-foreground">
                  {level.requests.toLocaleString()} requests processed
                </div>

                <Badge 
                  variant={level.successRate >= 95 ? "default" : level.successRate >= 85 ? "secondary" : "outline"}
                  className="w-full justify-center"
                >
                  {level.successRate >= 95 ? "Excellent" : level.successRate >= 85 ? "Good" : "Moderate"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">API Gateway</span>
              </div>
              <Badge variant="default">Operational</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Stealth Engine</span>
              </div>
              <Badge variant="default">Operational</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Database</span>
              </div>
              <Badge variant="default">Operational</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm">CAPTCHA Solver</span>
              </div>
              <Badge variant="secondary">Limited</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Global Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>🇺🇸 US East</span>
                <span className="text-green-600">98ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>🇪🇺 Europe</span>
                <span className="text-green-600">76ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>🇯🇵 Asia Pacific</span>
                <span className="text-amber-600">124ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>🇦🇺 Australia</span>
                <span className="text-green-600">89ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedStatusDashboard;
