import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('Unauthenticated redirect to /auth', async ({ page }) => {
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({ json: {} }); // empty session = unauthenticated
    });
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/auth/);
  });

  test('Analysis cards display correctly', async ({ page }) => {
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({ json: { user: { email: 'test@test.com' }, tier: 'free' } });
    });
    
    await page.route('**/api/history?page=1', async route => {
      await route.fulfill({ 
        json: { 
          analyses: [
            { id: '1', video_title: 'Test Video', created_at: new Date().toISOString(), status: 'complete', video_duration_seconds: 120 }
          ],
          has_more: false
        } 
      });
    });
    
    await page.goto('/dashboard');
    await expect(page.getByText('Test Video')).toBeVisible();
    await expect(page.getByText('2:00')).toBeVisible(); // duration
  });

  test('Delete removes card from grid', async ({ page }) => {
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({ json: { user: { email: 'test@test.com' }, tier: 'free' } });
    });
    
    await page.route('**/api/history?page=1', async route => {
      await route.fulfill({ 
        json: { 
          analyses: [
            { id: '1', video_title: 'Video to delete', created_at: new Date().toISOString(), status: 'complete', video_duration_seconds: 120 }
          ],
          has_more: false
        } 
      });
    });
    
    await page.route('**/api/history/1', async route => {
      await route.fulfill({ json: { deleted: true } });
    });
    
    await page.goto('/dashboard');
    
    // Setup confirm dialog handler
    page.on('dialog', dialog => dialog.accept());
    
    // Hover to reveal actions
    const card = page.locator('.group').first();
    await card.hover();
    
    // Click delete (assuming it's the second button in hover actions)
    const deleteBtn = card.locator('button').nth(1);
    await deleteBtn.click();
    
    // Optimistic UI should remove it
    await expect(page.getByText('Video to delete')).not.toBeVisible();
  });

  test('Empty state shown initially', async ({ page }) => {
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({ json: { user: { email: 'test@test.com' }, tier: 'free' } });
    });
    
    await page.route('**/api/history?page=1', async route => {
      await route.fulfill({ 
        json: { 
          analyses: [],
          has_more: false
        } 
      });
    });
    
    await page.goto('/dashboard');
    await expect(page.getByText("You haven't analyzed any videos yet.")).toBeVisible();
  });
});
