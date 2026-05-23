import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({ json: { user: { email: 'pythontut23@gmail.com', name: 'Python Tut' }, tier: 'creator' } });
  });
  await page.route('**/api/me', async route => {
    await route.fulfill({ json: { usage: { used: 1, limit: 20, tier: 'creator', reset_type: 'monthly', remaining: 19 } } });
  });

  const mockAnalysis = {
    id: 'test-export-123',
    video_title: 'Automated Export Test Video',
    created_at: new Date().toISOString(),
    status: 'complete',
    video_duration_seconds: 180,
    summary: "Summary",
    instagram_playbook: [{ day: 1, content_type: "Educational", hook: "Test Hook 1", angle: "Test Angle 1", format: "Reel" }],
    twitter_thread: [{ text: "Tweet 1" }],
    carousel_slides: [
      { title: "Preview Title 1", body: "Preview Body 1", slide_number: 1 },
      { title: "Preview Title 2", body: "Preview Body 2", slide_number: 2 }
    ]
  };

  await page.route('**/api/history?page=1', async route => route.fulfill({ json: { analyses: [mockAnalysis], has_more: false } }));
  await page.route(`**/api/analysis/*`, async route => route.fulfill({ json: mockAnalysis }));
  await page.route('**/api/carousel/brand-settings', async route => route.fulfill({ json: { has_logo: false, preferred_theme: 'v3_lime' } })); // Test v3

  await page.goto('http://localhost:3000/analysis/test-export-123', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'debug_screenshot.png', fullPage: true });
  console.log("Saved debug_screenshot.png");
  await browser.close();
}
run().catch(console.error);