
import { ScrapeJob } from './types.ts';
import { BrowserFingerprintManager } from './browser-fingerprint-manager.ts';

/**
 * Enhanced Distributed Job Manager
 */
export class DistributedJobManager {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async enqueueJob(url: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<string> {
    const jobId = crypto.randomUUID();
    
    const job: Partial<ScrapeJob> = {
      id: jobId,
      url: url,
      priority: priority,
      retry_count: 0,
      max_retries: 3,
      anti_detection_profile: BrowserFingerprintManager.getRandomProfile().name,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await this.supabase
        .from('scrape_jobs')
        .insert(job);
      
      if (error) throw error;
      
      console.log(`Job enqueued: ${jobId} for URL: ${url}`);
      return jobId;
    } catch (error) {
      console.error('Failed to enqueue job:', error);
      throw error;
    }
  }

  async getJobStats(): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_job_statistics');
      
      if (error) throw error;
      
      return data || { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
    } catch (error) {
      console.error('Failed to get job stats:', error);
      return { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
    }
  }
}
