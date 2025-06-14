
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create content_snapshots table for change detection
    const { error: snapshotsError } = await supabaseAdmin.rpc('create_table_if_not_exists', {
      table_name: 'content_snapshots',
      table_definition: `
        CREATE TABLE IF NOT EXISTS content_snapshots (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          api_id TEXT NOT NULL,
          content_hash TEXT NOT NULL,
          snapshot_data JSONB,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(api_id)
        )
      `
    });

    // Create api_notifications table for change notifications
    const { error: notificationsError } = await supabaseAdmin.rpc('create_table_if_not_exists', {
      table_name: 'api_notifications',
      table_definition: `
        CREATE TABLE IF NOT EXISTS api_notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          api_id TEXT NOT NULL,
          change_type TEXT NOT NULL,
          notification_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          processed BOOLEAN DEFAULT FALSE
        )
      `
    });

    // Create api_usage_patterns table for predictive caching
    const { error: usageError } = await supabaseAdmin.rpc('create_table_if_not_exists', {
      table_name: 'api_usage_patterns',
      table_definition: `
        CREATE TABLE IF NOT EXISTS api_usage_patterns (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          api_id TEXT NOT NULL,
          endpoint TEXT NOT NULL,
          parameters JSONB,
          user_location TEXT,
          access_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          hour_of_day INTEGER,
          day_of_week INTEGER
        )
      `
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Level 3 tables created successfully',
      errors: {
        snapshots: snapshotsError?.message,
        notifications: notificationsError?.message,
        usage: usageError?.message
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
