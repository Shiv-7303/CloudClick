import { chromium } from 'playwright';

async function run() {
  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to all console logs and print them to the terminal
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  // Also listen for uncaught page errors
  page.on('pageerror', err => {
    console.log(`[PAGE ERROR]: ${err.message}`);
  });

  // Mock authentication so we don't need to manually login
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({ 
      json: { 
        user: { email: 'pythontut23@gmail.com', name: 'Python Tut' }, 
        tier: 'creator' 
      } 
    });
  });

  await page.route('**/api/me', async route => {
    await route.fulfill({ json: { usage: { used: 1, limit: 20, tier: 'creator', reset_type: 'monthly', remaining: 19 } } });
  });

  // Mock an analysis ID
  const analysisId = 'test-export-123';
  const mockAnalysis = {
    id: analysisId,
    video_title: 'Automated Export Test Video',
    created_at: new Date().toISOString(),
    status: 'complete',
    video_duration_seconds: 180,
    summary: "This is a summary for the automated test.",
    instagram_playbook: [
      { day: 1, content_type: "Educational", hook: "Test Hook 1", angle: "Test Angle 1", format: "Reel" }
    ],
    twitter_thread: [{ text: "Tweet 1" }],
    carousel_slides: [
      { title: "Preview Title 1", body: "Preview Body 1", slide_number: 1 },
      { title: "Preview Title 2", body: "Preview Body 2", slide_number: 2 },
      { title: "Preview Title 3", body: "Preview Body 3", slide_number: 3 },
      { title: "Preview Title 4", body: "Preview Body 4", slide_number: 4 },
      { title: "Preview Title 5", body: "Preview Body 5", slide_number: 5 },
      { title: "Preview Title 6", body: "Preview Body 6", slide_number: 6 }
    ]
  };

  await page.route('**/api/history?page=1', async route => {
    await route.fulfill({ json: { analyses: [mockAnalysis], has_more: false } });
  });

  await page.route(`**/api/analysis/*`, async route => {
    await route.fulfill({ json: mockAnalysis });
  });
  
  await page.route('**/api/carousel/brand-settings', async route => {
    await route.fulfill({ json: { has_logo: false, preferred_theme: 'dark' } });
  });

  // Handle the zip download
  page.on('download', download => {
    console.log(`[DOWNLOAD INITIATED]: ${download.suggestedFilename()}`);
  });

  console.log("Navigating to http://localhost:3000/analysis/test-export-123 ...");
  
  try {
    await page.goto('http://localhost:3000/analysis/test-export-123', { waitUntil: 'networkidle' });
  } catch(e: any) {
    console.log("Failed to navigate to localhost:3000. Is the Next.js server running?");
    await browser.close();
    process.exit(1);
  }

  console.log("Waiting for Preview Title 1 to be visible...");
  try {
    await page.waitForSelector('text="Preview Title 1"', { timeout: 10000 });
    console.log("Preview loaded successfully.");
  } catch(e) {
    console.log("Preview failed to load. DOM dump:");
    console.log(await page.content());
    await browser.close();
    process.exit(1);
  }

  console.log("Clicking Export PNG...");
  try {
    // Click the export PNG button
    await page.click('button:has-text("Export PNG")');
    console.log("Clicked! Waiting 15 seconds to see what happens in the console...");
    
    // Wait a bit to let any async processes run and log to console
    await page.waitForTimeout(15000);
    
  } catch(e: any) {
    console.log("Failed to click Export PNG button: " + e.message);
  }

  console.log("Closing browser.");
  await browser.close();
}

run().catch(console.error);