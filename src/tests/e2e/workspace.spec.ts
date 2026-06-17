import { test, expect } from '@playwright/test';

test.describe('Nexus AI Workspace', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Nexus')).toBeVisible();
    await expect(page.getByText('Launch App')).toBeVisible();
  });

  test('workspace page loads and shows chat', async ({ page }) => {
    await page.goto('/workspace');
    await expect(page.getByText('Nexus AI Workspace')).toBeVisible();
    await expect(page.getByText('Ask Nexus to build')).toBeVisible();
  });

  test('suggestion chips are visible', async ({ page }) => {
    await page.goto('/workspace');
    await expect(page.getByText('Engineering sprint board')).toBeVisible();
  });

  test('command palette opens with keyboard shortcut', async ({ page }) => {
    await page.goto('/workspace');
    await page.keyboard.press('Meta+k');
    await expect(page.getByPlaceholder('Type a command or widget name…')).toBeVisible();
  });
});
