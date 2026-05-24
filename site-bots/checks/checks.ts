import { Page, Response } from 'playwright';
import { CheckResult, PageMetrics } from '../types/types';

export async function checkAvailability(response: Response | null): Promise<CheckResult> {
  if (!response) {
    return { name: 'Availability', status: 'fail', message: 'No response received' };
  }
  const status = response.status();
  if (status >= 200 && status < 400) {
    return { name: 'Availability', status: 'pass', message: `Status: ${status}` };
  }
  return { name: 'Availability', status: 'fail', message: `Status: ${status}` };
}

export async function checkNoBlankPage(page: Page): Promise<CheckResult> {
  const content = await page.content();
  if (content && content.trim().length > 100) {
    return { name: 'No Blank Page', status: 'pass' };
  }
  return { name: 'No Blank Page', status: 'fail', message: 'Page content is empty or too short' };
}

export async function checkSelectors(page: Page, selectors: string[]): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      const isVisible = element ? await element.isVisible() : false;
      results.push({
        name: `Selector: ${selector}`,
        status: isVisible ? 'pass' : 'fail',
        message: element ? (isVisible ? 'Visible' : 'Found but not visible') : 'Not found'
      });
    } catch (e: any) {
      results.push({ name: `Selector: ${selector}`, status: 'fail', message: e.message });
    }
  }
  return results;
}

export async function checkAccessibilitySmoke(page: Page): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  
  // Title check
  const title = await page.title();
  results.push({
    name: 'Accessibility: Title',
    status: title ? 'pass' : 'fail',
    message: title ? `Title: ${title}` : 'Missing <title>'
  });

  // Meta viewport check
  const viewport = await page.$('meta[name="viewport"]');
  results.push({
    name: 'Accessibility: Viewport',
    status: viewport ? 'pass' : 'fail',
    message: viewport ? 'Meta viewport exists' : 'Missing meta viewport'
  });

  // H1 check
  const h1Count = await page.locator('h1').count();
  results.push({
    name: 'Accessibility: H1',
    status: h1Count > 0 ? 'pass' : 'warning',
    message: h1Count > 0 ? `Found ${h1Count} H1(s)` : 'Missing H1'
  });

  return results;
}

export async function checkResponsiveMenus(page: Page): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  
  // Test Desktop Resolution (1280x800)
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(500); // Wait for CSS transition/media query
  
  const desktopNavVisible = await page.locator('.links.main-nav').first().isVisible();
  const burgerHidden = !(await page.locator('.burger').first().isVisible());
  
  results.push({
    name: 'Menu: Desktop Resolution (1280px)',
    status: (desktopNavVisible && burgerHidden) ? 'pass' : 'fail',
    message: `Nav visible: ${desktopNavVisible}, Burger hidden: ${burgerHidden}`
  });

  // Test Mobile Resolution (375x667 - iPhone SE)
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  
  const desktopNavHidden = !(await page.locator('.links.main-nav').first().isVisible());
  const burgerVisible = await page.locator('.burger').first().isVisible();
  
  results.push({
    name: 'Menu: Mobile Resolution (375px)',
    status: (desktopNavHidden && burgerVisible) ? 'pass' : 'fail',
    message: `Nav hidden: ${desktopNavHidden}, Burger visible: ${burgerVisible}`
  });

  return results;
}

export async function measureMetrics(page: Page): Promise<PageMetrics> {
  return await page.evaluate(() => {
    const timing = window.performance.timing;
    return {
      ttfb: timing.responseStart - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      load: timing.loadEventEnd - timing.navigationStart
    };
  });
}


