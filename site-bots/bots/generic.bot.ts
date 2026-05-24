import { Browser, Page, chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs-extra';
import { PageConfig, PageBotResult, CheckResult } from '../types/types';
import * as checks from '../checks/checks';

export class PageBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private consoleErrors: string[] = [];
  private pageErrors: string[] = [];

  constructor(private config: PageConfig, private baseUrl: string) {}

  async run(headed: boolean = false): Promise<PageBotResult> {
    const startTime = Date.now();
    const result: PageBotResult = {
      key: this.config.key,
      name: this.config.name,
      url: this.baseUrl + this.config.url,
      timestamp: new Date().toISOString(),
      status: 'pass',
      checks: [],
      warnings: [],
      errors: [],
      metrics: {},
      isCritical: this.config.critical
    };

    try {
      this.browser = await chromium.launch({ headless: !headed });
      const context = await this.browser.newContext();
      this.page = await context.newPage();

      // Capture errors
      this.page.on('console', msg => {
        if (msg.type() === 'error') this.consoleErrors.push(msg.text());
      });
      this.page.on('pageerror', err => {
        this.pageErrors.push(err.message);
      });

      // Navigation
      const startNav = Date.now();
      const response = await this.page.goto(result.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      const navDuration = Date.now() - startNav;

      // Run checks
      result.checks.push(await checks.checkAvailability(response));
      result.checks.push(await checks.checkNoBlankPage(this.page));
      
      const selectorResults = await checks.checkSelectors(this.page, this.config.expectedSelectors);
      result.checks.push(...selectorResults);

      const accessibilityResults = await checks.checkAccessibilitySmoke(this.page);
      result.checks.push(...accessibilityResults);

      const responsiveResults = await checks.checkResponsiveMenus(this.page);
      result.checks.push(...responsiveResults);

      // Metrics
      result.metrics = await checks.measureMetrics(this.page);
      
      // Screenshot
      const screenshotDir = path.join(process.cwd(), 'artifacts', 'screenshots');
      await fs.ensureDir(screenshotDir);
      const screenshotPath = path.join(screenshotDir, `${this.config.key}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshotPath = `artifacts/screenshots/${this.config.key}.png`;

      // Aggregate status
      result.errors.push(...this.pageErrors);
      if (this.consoleErrors.length > 0) {
        result.warnings.push(...this.consoleErrors.map(e => `Console Error: ${e}`));
      }

      const hasFailures = result.checks.some(c => c.status === 'fail');
      if (hasFailures || result.errors.length > 0) {
        result.status = 'fail';
      }

    } catch (e: any) {
      result.status = 'fail';
      result.errors.push(`Bot Execution Error: ${e.message}`);
    } finally {
      if (this.browser) await this.browser.close();
    }

    return result;
  }
}


