import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('Hero input autofocused on page load', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder('Paste your YouTube link here...');
    await expect(input).toBeFocused();
  });

  test('Invalid URL -> red border + shake', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder('Paste your YouTube link here...');
    await input.fill('invalid url');
    
    // Form should have the negative border and shake animation class
    const form = page.locator('form').first();
    await expect(form).toHaveClass(/border-negative/);
    await expect(form).toHaveClass(/animate-\[shake_0\.5s_ease-in-out\]/);
  });

  test('Valid URL + not logged in -> redirected to /auth and sets sessionStorage', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder('Paste your YouTube link here...');
    await input.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    
    const button = page.getByRole('button', { name: 'Analyze →' });
    await expect(button).toBeEnabled();
    
    await button.click();
    
    // Check if redirected to auth
    await expect(page).toHaveURL(/.*\/auth/);
    
    // Check session storage
    const storedUrl = await page.evaluate(() => sessionStorage.getItem('cloudclick_pending_url'));
    expect(storedUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });
});
