
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  api_id: string;
  change_type: string;
  notification_data: any;
  created_at: string;
  processed: boolean;
}

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('api-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'api_notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: "API Content Updated",
            description: `${newNotification.change_type} detected for API ${newNotification.api_id}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchNotifications = async () => {
    try {
      // Use type assertion to work around missing types
      const { data, error } = await (supabase as any)
        .from('api_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsProcessed = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('api_notifications')
        .update({ processed: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, processed: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as processed:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const { error } = await (supabase as any)
        .from('api_notifications')
        .update({ processed: true })
        .eq('processed', false);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, processed: true }))
      );
      
      toast({
        title: "Success",
        description: "All notifications marked as processed",
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive",
      });
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType.toLowerCase()) {
      case 'new': return 'default';
      case 'updated': return 'secondary';
      case 'unchanged': return 'outline';
      default: return 'outline';
    }
  };

  const unprocessedCount = notifications.filter(n => !n.processed).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading notifications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Real-Time Notifications
            {unprocessedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unprocessedCount}
              </Badge>
            )}
          </CardTitle>
          {unprocessedCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllNotifications}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No notifications yet. Content changes will appear here in real-time.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.processed 
                    ? 'bg-muted/50 border-muted' 
                    : 'bg-background border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getChangeTypeColor(notification.change_type)}>
                        {notification.change_type}
                      </Badge>
                      <span className="text-sm font-medium">
                        API {notification.api_id.slice(-8)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    {notification.notification_data && (
                      <div className="text-sm text-muted-foreground">
                        {notification.notification_data.change_summary && (
                          <div>{notification.notification_data.change_summary}</div>
                        )}
                        {notification.notification_data.items_count && (
                          <div>Items: {notification.notification_data.items_count}</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {notification.processed ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsProcessed(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeNotifications;
