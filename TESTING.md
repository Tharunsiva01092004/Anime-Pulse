# AnimePulse Testing Guide

This guide explains how to run automated tests for AnimePulse.

## 1. Minimal Smoke Test (Built-in)

We have included a simple health check script to verify the server is responding.

**Run:**
```bash
node scripts/health_check.js
```

**Expected Output:**
```
STATUS: 200
PASS: Body contains "AnimePulse"
```

## 2. End-to-End Testing (Recommended)

For full UI automation (clicking buttons, searching, verifying grids), we recommend installed **Playwright**.

### Setup
```bash
mkdir e2e
npm init playwright@latest
```

### Example Test (`e2e/example.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/AnimePulse/);
});

test('can switch to weekly view', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Weekly Guide');
  await expect(page.locator('text=Monday')).toBeVisible();
});
```

### Run Tests
```bash
npx playwright test
```
