/**
 * Auth E2E Tests (Playwright)
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Nexus AI')).toBeVisible();
    await expect(page.locator('text=Start for Free')).toBeVisible();
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Identity Verification')).toBeVisible();
    await expect(page.locator('input[type=email]')).toBeVisible();
    await expect(page.locator('input[type=password]')).toBeVisible();
  });

  test('register page renders form fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('text=Create your account')).toBeVisible();
    await expect(page.locator('input[type=email]')).toBeVisible();
  });

  test('forgot password page renders', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('text=Reset password')).toBeVisible();
  });

  test('verify OTP page renders 6 inputs', async ({ page }) => {
    await page.goto('/verify-otp');
    const inputs = page.locator('.otp-input');
    await expect(inputs).toHaveCount(6);
  });

  test('login navigates to register', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Register here');
    await expect(page).toHaveURL('/register');
  });
});

test.describe('Dashboard', () => {
  test('dashboard page loads', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Good')).toBeVisible();
  });
});
