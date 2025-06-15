
export interface ScrapeJob {
  id: string;
  url: string;
  priority: 'low' | 'medium' | 'high';
  retry_count: number;
  max_retries: number;
  worker_region?: string;
  anti_detection_profile: string;
  created_at: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  success?: boolean;
  result_data?: any;
  error_message?: string;
}

export interface StealthProfile {
  name: string;
  userAgent: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  isLandscape: boolean;
  timezone: string;
  locale: string;
  plugins: string[];
  fonts: string[];
  webgl_vendor: string;
  webgl_renderer: string;
}
