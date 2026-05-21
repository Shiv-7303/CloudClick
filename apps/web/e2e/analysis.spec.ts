import { test, expect } from '@playwright/test';

test.describe('Analysis Page', () => {
  // To properly test this, we would mock the API response.
  // For the purpose of providing the spec files:
  test('Status page shows progress steps', async ({ page }) => {
    await page.route('**/api/analysis/*', async route => {
      await route.fulfill({ json: { status: 'processing' } });
    });
    
    await page.goto('/analysis/123');
    await expect(page.getByText('Analyzing Video')).toBeVisible();
    await expect(page.getByText('Processing transcript and generating content')).toBeVisible();
  });

  test('Results appear after completion', async ({ page }) => {
    await page.route('**/api/analysis/*', async route => {
      await route.fulfill({ 
        json: { 
          status: 'complete',
          summary: 'Complete summary',
          linkedin_post_v1: 'L1',
          twitter_thread: [{text: 'T1', position: 1}]
        } 
      });
    });
    
    await page.goto('/analysis/123');
    await expect(page.getByText('Complete summary')).toBeVisible();
  });

  test('Free user sees only V1 LinkedIn post', async ({ page }) => {
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({ json: { user: { email: 'free@test.com' }, tier: 'free' } });
    });
    
    await page.route('**/api/analysis/*', async route => {
      await route.fulfill({ 
        json: { 
          status: 'complete',
          linkedin_post_v1: 'L1',
          linkedin_post_v2: 'L2',
        } 
      });
    });
    
    await page.goto('/analysis/123');
    
    const v1Tab = page.getByTestId('tab-v1');
    const v2Tab = page.getByTestId('tab-v2');
    
    await expect(v1Tab).toBeVisible();
    await expect(v2Tab).toBeVisible();
    await expect(v2Tab).toHaveClass(/opacity-50/); // Gated
  });

  test('Creator user sees V1/V2/V3 tabs', async ({ page }) => {
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({ json: { user: { email: 'creator@test.com' }, tier: 'creator' } });
    });
    
    await page.route('**/api/analysis/*', async route => {
      await route.fulfill({ 
        json: { 
          status: 'complete',
          linkedin_post_v1: 'L1',
          linkedin_post_v2: 'L2',
          linkedin_post_v3: 'L3',
        } 
      });
    });
    
    await page.goto('/analysis/123');
    
    await expect(page.getByTestId('tab-v1')).toBeVisible();
    await expect(page.getByTestId('tab-v2')).not.toHaveClass(/opacity-50/);
    await expect(page.getByTestId('tab-v3')).not.toHaveClass(/opacity-50/);
  });
});
