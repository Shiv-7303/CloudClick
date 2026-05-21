import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  test('3 tier columns render', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText('Free')).toBeVisible();
    await expect(page.getByText('Creator')).toBeVisible();
    await expect(page.getByText('Pro')).toBeVisible();
  });

  test('Razorpay modal opens on upgrade click (mock Razorpay in test)', async ({ page }) => {
    // Mock the session so user is logged in
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({ json: { user: { email: 'test@test.com', name: 'Test User' }, tier: 'free' } });
    });
    
    // Mock the create-subscription API
    await page.route('**/api/payments/create-subscription', async route => {
      await route.fulfill({ 
        json: { 
          subscription_id: 'sub_test123',
          razorpay_key: 'rzp_test_123',
          name: 'Test User',
          email: 'test@test.com'
        } 
      });
    });

    await page.goto('/pricing');
    
    // Inject a mock Razorpay object to intercept the open call
    await page.addInitScript(() => {
      let openCalled = false;
      window.Razorpay = function(options: any) {
        this.open = () => {
          openCalled = true;
          // Emit a custom event we can check
          window.dispatchEvent(new CustomEvent('razorpay_opened', { detail: options }));
        };
      };
    });

    const upgradeBtn = page.getByRole('button', { name: 'Upgrade to Creator' });
    await upgradeBtn.click();
    
    // Wait for the custom event to be fired
    const options = await page.evaluate(() => {
      return new Promise(resolve => {
        window.addEventListener('razorpay_opened', (e: any) => {
          resolve(e.detail);
        });
      });
    });

    expect(options).toHaveProperty('subscription_id', 'sub_test123');
  });

  test('Free limit modal shows on 402 error', async ({ page }) => {
    await page.goto('/');
    
    // Trigger a 402 event directly to test the UpgradeModal globally
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('upgrade_required', { detail: "You've used all 1 analyses on your free plan." }));
    });
    
    await expect(page.getByText('Upgrade Required')).toBeVisible();
    await expect(page.getByText("You've used all 1 analyses on your free plan.")).toBeVisible();
  });
});
