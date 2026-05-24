export interface PageConfig {
  key: string;
  url: string;
  name: string;
  expectedSelectors: string[];
  critical: boolean;
  authProfile?: string;
}

export interface SiteConfig {
  pages: PageConfig[];
}

export interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message?: string;
  duration?: number;
}

export interface PageMetrics {
  ttfb?: number;
  domContentLoaded?: number;
  load?: number;
}

export interface PageBotResult {
  key: string;
  name: string;
  url: string;
  timestamp: string;
  status: 'pass' | 'fail';
  checks: CheckResult[];
  warnings: string[];
  errors: string[];
  metrics: PageMetrics;
  screenshotPath?: string;
  isCritical: boolean;
}

export interface ReportSummary {
  totals: {
    pages: number;
    passed: number;
    failed: number;
    warnings: number;
    criticalFailures: number;
  };
  duration: number;
}

export interface SiteTestReport {
  runId: string;
  timestamp: string;
  baseUrl: string;
  environment: string;
  gitSha?: string;
  summary: ReportSummary;
  results: PageBotResult[];
}
















