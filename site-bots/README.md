# Site Bots: Automated Website Testing System

An automated website testing system using Node.js, TypeScript, and Playwright.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Install Playwright Browser**:
    ```bash
    npx playwright install chromium
    ```

## Usage

Run tests against a base URL:
```bash
npm run test:site -- --baseUrl=http://localhost:3000
```

Run in headed mode (visible browser):
```bash
npm run test:site:headed -- --baseUrl=http://localhost:3000
```

Open the latest report:
```bash
npm run report:open
```

## Configuration

The pages to be tested are defined in `site-bots/config/pages.json`.

```json
{
  "pages": [
    {
      "key": "home",
      "url": "/",
      "name": "Home Page",
      "expectedSelectors": ["header", "footer"],
      "critical": true
    }
  ]
}
```

-   **key**: Unique identifier for the page.
-   **url**: Relative path from the base URL.
-   **name**: Descriptive name for the page.
-   **expectedSelectors**: Array of CSS selectors that must be visible.
-   **critical**: If `true`, a failure on this page will cause the process to exit with status 1.

## Project Structure

-   `/site-bots/config/`: Configuration files (e.g., `pages.json`).
-   `/site-bots/supervisor/`: Orchestration logic for running bots.
-   `/site-bots/bots/`: Individual page bot logic.
-   `/site-bots/checks/`: Reusable check functions.
-   `/site-bots/reporting/`: Logic for generating JSON and HTML reports.
-   `/site-bots/types/`: Shared TypeScript types.
-   `/artifacts/`: Output directory for reports and screenshots.

## Adding New Page Bots

Most pages can use the `generic.bot.ts`. To add a new page to the test suite, simply add a new entry to `site-bots/config/pages.json`.

If a page requires custom logic (e.g., complex interactions), you can create a new bot file in `/site-bots/bots/` and update the supervisor to use it for that specific key.

## Interpreting Reports

-   **JSON Report**: Located at `artifacts/reports/latest.json`. Machine-readable summary of the entire run.
-   **HTML Report**: Located at `artifacts/reports/latest.html`. Human-friendly visual report with summary and details per page.
-   **Screenshots**: Saved in `artifacts/screenshots/<key>.png`.

A run is considered "Failed" if any check on a **critical** page fails.
















