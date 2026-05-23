import { chromium } from 'playwright';

async function run() {
  console.log("🤖 BROWSER AGENT: Starting headless Chrome...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Print all browser console logs to this terminal
  page.on('console', msg => {
    console.log(`🌐 BROWSER SAYS: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`❌ BROWSER ERROR: ${err.message}`);
  });

  // Force login as pythontut23
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({ 
      json: { 
        user: { email: 'pythontut23@gmail.com', name: 'Python Tut' }, 
        tier: 'creator' 
      } 
    });
  });

  // Mock usage just in case
  await page.route('**/api/me', async route => {
    await route.fulfill({ json: { usage: { used: 1, limit: 20, tier: 'creator', reset_type: 'monthly', remaining: 19 } } });
  });

  console.log("🤖 BROWSER AGENT: Going to http://localhost:3000/analysis/955d15d8-e313-4ec9-b9b6-4228eaf42315 ...");
  
  await page.goto('http://localhost:3000/analysis/955d15d8-e313-4ec9-b9b6-4228eaf42315', { waitUntil: 'networkidle' });

  console.log("🤖 BROWSER AGENT: Page loaded. Waiting for Export PNG button...");
  await page.waitForSelector('button:has-text("Export PNG")');

  console.log("🤖 BROWSER AGENT: Clicking 'Export PNG' button...");
  
  // Set up download listener
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(e => {
      console.log("🤖 BROWSER AGENT: Download did not start within 30 seconds.");
      return null;
  });

  await page.click('button:has-text("Export PNG")');

  const download = await downloadPromise;
  if (download) {
      console.log(`✅ BROWSER AGENT: SUCCESS! File downloaded -> ${download.suggestedFilename()}`);
  }

  await browser.close();
  console.log("🤖 BROWSER AGENT: Finished.");
}

run().catch(console.error);