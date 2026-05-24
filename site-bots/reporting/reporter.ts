import * as fs from 'fs-extra';
import * as path from 'path';
import { SiteTestReport, PageBotResult } from '../types/types';

export function generateJsonReport(report: SiteTestReport): string {
  return JSON.stringify(report, null, 2);
}

export function generateHtmlReport(report: SiteTestReport): string {
  const { summary, results, baseUrl, timestamp } = report;

  const rows = results.map(res => `
    <div class="card ${res.status}">
      <h3>${res.name} (${res.key})</h3>
      <p>URL: <a href="${res.url}" target="_blank">${res.url}</a></p>
      <p>Status: <span class="badge ${res.status}">${res.status.toUpperCase()}</span></p>
      
      <h4>Checks</h4>
      <ul>
        ${res.checks.map(c => `
          <li class="${c.status}">
            <strong>${c.name}</strong>: ${c.status} ${c.message ? `- ${c.message}` : ''}
          </li>
        `).join('')}
      </ul>

      ${res.errors.length > 0 ? `
        <h4 class="error">Errors</h4>
        <pre>${res.errors.join('\n')}</pre>
      ` : ''}

      ${res.warnings.length > 0 ? `
        <h4 class="warning">Warnings</h4>
        <pre>${res.warnings.join('\n')}</pre>
      ` : ''}

      ${res.screenshotPath ? `
        <p><a href="../../${res.screenshotPath}" target="_blank">View Screenshot</a></p>
      ` : ''}
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Test Report - ${baseUrl}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f4f7f6; }
        h1, h2, h3 { color: #2c3e50; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .stat-card h4 { margin: 0 0 10px 0; font-size: 0.9rem; text-transform: uppercase; color: #7f8c8d; }
        .stat-card div { font-size: 2rem; font-weight: bold; }
        .card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 20px; border-left: 5px solid #ccc; }
        .card.pass { border-left-color: #27ae60; }
        .card.fail { border-left-color: #e74c3c; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
        .badge.pass { background: #d4edda; color: #155724; }
        .badge.fail { background: #f8d7da; color: #721c24; }
        ul { list-style: none; padding: 0; }
        li { padding: 8px; margin-bottom: 4px; border-radius: 4px; }
        li.pass { background: #f0fff4; border-left: 3px solid #38a169; }
        li.fail { background: #fff5f5; border-left: 3px solid #e53e3e; }
        li.warning { background: #fffaf0; border-left: 3px solid #dd6b20; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 0.85rem; overflow-x: auto; white-space: pre-wrap; }
        .error { color: #e53e3e; }
        .warning { color: #dd6b20; }
    </style>
</head>
<body>
    <h1>Site Test Report</h1>
    <p>Base URL: <strong>${baseUrl}</strong></p>
    <p>Run Timestamp: ${new Date(timestamp).toLocaleString()}</p>

    <div class="summary">
        <div class="stat-card"><h4>Total Pages</h4><div>${summary.totals.pages}</div></div>
        <div class="stat-card"><h4>Passed</h4><div style="color: #27ae60">${summary.totals.passed}</div></div>
        <div class="stat-card"><h4>Failed</h4><div style="color: #e74c3c">${summary.totals.failed}</div></div>
        <div class="stat-card"><h4>Critical Failures</h4><div style="color: #e74c3c">${summary.totals.criticalFailures}</div></div>
        <div class="stat-card"><h4>Warnings</h4><div style="color: #f39c12">${summary.totals.warnings}</div></div>
    </div>

    <h2>Results</h2>
    ${rows}
</body>
</html>
  `;
}
















