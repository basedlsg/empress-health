import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as path from 'path';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import { SiteConfig, SiteTestReport, PageBotResult } from '../types/types';
import { PageBot } from '../bots/generic.bot';
import { generateJsonReport, generateHtmlReport } from '../reporting/reporter';

async function run() {
  const argv: any = yargs(hideBin(process.argv))
    .option('baseUrl', { type: 'string', demandOption: true })
    .option('config', { type: 'string', default: 'site-bots/config/pages.json' })
    .option('workers', { type: 'number', default: 4 })
    .option('headed', { type: 'boolean', default: false })
    .option('retries', { type: 'number', default: 1 })
    .parseSync();

  const { baseUrl, config, workers, headed, retries } = argv;

  console.log(chalk.blue.bold(`\n🚀 Starting Site Supervisor`));
  console.log(chalk.gray(`Base URL: ${baseUrl}`));
  console.log(chalk.gray(`Config: ${config}`));
  console.log(chalk.gray(`Workers: ${workers}\n`));

  const configPath = path.resolve(process.cwd(), config);
  const siteConfig: SiteConfig = await fs.readJson(configPath);

  const results: PageBotResult[] = [];
  const startTime = Date.now();

  // Simple concurrency management
  const queue = [...siteConfig.pages];
  const activeWorkers = new Array(Math.min(workers, queue.length)).fill(null).map(async () => {
    while (queue.length > 0) {
      const pageConfig = queue.shift();
      if (!pageConfig) break;

      console.log(`${chalk.yellow('RUNNING')} ${pageConfig.name} (${pageConfig.url})`);
      
      const bot = new PageBot(pageConfig, baseUrl);
      let result = await bot.run(headed);
      
      // Retry logic
      let attempt = 1;
      while (result.status === 'fail' && attempt <= retries) {
        console.log(`${chalk.magenta('RETRYING')} ${pageConfig.name} (Attempt ${attempt + 1})`);
        result = await bot.run(headed);
        attempt++;
      }

      results.push(result);
      
      const statusColor = result.status === 'pass' ? chalk.green : chalk.red;
      console.log(`${statusColor(result.status.toUpperCase())} ${pageConfig.name}`);
    }
  });

  await Promise.all(activeWorkers);

  const duration = Date.now() - startTime;
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const criticalFailures = results.filter(r => r.status === 'fail' && r.isCritical).length;
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  const report: SiteTestReport = {
    runId: `run-${Date.now()}`,
    timestamp: new Date().toISOString(),
    baseUrl,
    environment: process.env.NODE_ENV || 'local',
    summary: {
      totals: {
        pages: results.length,
        passed,
        failed,
        warnings: totalWarnings,
        criticalFailures
      },
      duration
    },
    results
  };

  // Generate artifacts
  const reportDir = path.join(process.cwd(), 'artifacts', 'reports');
  await fs.ensureDir(reportDir);
  
  await fs.writeJson(path.join(reportDir, 'latest.json'), report, { spaces: 2 });
  await fs.writeFile(path.join(reportDir, 'latest.html'), generateHtmlReport(report));

  // Console Summary Table
  console.log(`\n${chalk.bold('--- Run Summary ---')}`);
  console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log(`Pages: ${results.length} | Passed: ${chalk.green(passed)} | Failed: ${chalk.red(failed)} (Critical: ${chalk.red(criticalFailures)}) | Warnings: ${chalk.yellow(totalWarnings)}`);
  
  console.log(`\n${chalk.bold('Page Results:')}`);
  results.forEach(r => {
    const status = r.status === 'pass' ? chalk.green('PASS') : chalk.red('FAIL');
    const critical = r.isCritical ? chalk.red(' [CRITICAL]') : '';
    console.log(`${status} - ${r.key.padEnd(12)} | Checks: ${r.checks.length} | Warnings: ${r.warnings.length}${critical}`);
  });

  console.log(`\nReports generated in ${reportDir}`);

  // Exit code
  if (criticalFailures > 0) {
    console.log(chalk.red.bold(`\n❌ Critical failures found. Exiting with status 1.`));
    process.exit(1);
  } else {
    console.log(chalk.green.bold(`\n✅ All critical checks passed. Exiting with status 0.`));
    process.exit(0);
  }
}

run().catch(err => {
  console.error(chalk.red('Supervisor Error:'), err);
  process.exit(1);
});


