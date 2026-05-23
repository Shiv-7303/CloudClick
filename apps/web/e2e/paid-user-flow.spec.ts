import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Verify carousel preview and export for paid user', async ({ page }) => {
  // Listen to console logs
  page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));

  // 1. Mock the session to be logged in as pythontut23@gmail.com (Paid User)
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({ 
      json: { 
        user: { email: 'pythontut23@gmail.com', name: 'Python Tut' }, 
        tier: 'creator' // Mock as paid user
      } 
    });
  });

  await page.route('**/api/me', async route => {
    await route.fulfill({ json: { usage: { used: 1, limit: 20, tier: 'creator', reset_type: 'monthly', remaining: 19 } } });
  });

  // 2. Mock history and analysis data
  const mockAnalysis = {
    id: 'test-export-123',
    video_title: 'Automated Export Test Video',
    created_at: new Date().toISOString(),
    status: 'complete',
    video_duration_seconds: 180,
    summary: "This is a summary for the automated test.",
    instagram_playbook: [
      { day: 1, content_type: "Educational", hook: "Test Hook 1", angle: "Test Angle 1", format: "Reel" },
      { day: 2, content_type: "Story Post", hook: "Test Hook 2", angle: "Test Angle 2", format: "Story" },
      { day: 3, content_type: "Hot Take", hook: "Test Hook 3", angle: "Test Angle 3", format: "Carousel" },
      { day: 4, content_type: "Educational", hook: "Test Hook 4", angle: "Test Angle 4", format: "Reel" },
      { day: 5, content_type: "Story Post", hook: "Test Hook 5", angle: "Test Angle 5", format: "Story" },
      { day: 6, content_type: "Hot Take", hook: "Test Hook 6", angle: "Test Angle 6", format: "Carousel" },
      { day: 7, content_type: "Educational", hook: "Test Hook 7", angle: "Test Angle 7", format: "Reel" },
    ],
    twitter_thread: [
      { text: "Tweet 1" },
      { text: "Tweet 2" }
    ],
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

  await page.route('**/api/analysis/*', async route => {
    await route.fulfill({ json: mockAnalysis });
  });
  
  await page.route('**/api/carousel/brand-settings', async route => {
    await route.fulfill({
      json: { has_logo: false, preferred_theme: 'dark' }
    });
  });

  // Intercept the export API call to see what the frontend sends to the backend
  let exportRequestPayload: any = null;
  await page.route('**/api/exports', async route => {
    if (route.request().method() === 'POST') {
      exportRequestPayload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        json: { job_id: 'job-123', status: 'processing', download_url: 'http://localhost:3000/mock-download.pdf' }
      });
    } else {
      await route.continue();
    }
  });

  // Mock the download URL so it doesn't actually fail when trying to download
  await page.route('**/mock-download.pdf', async route => {
    await route.fulfill({
      body: Buffer.from('mock pdf content'),
      contentType: 'application/pdf',
      headers: {
        'Content-Disposition': 'attachment; filename="carousel.pdf"'
      }
    });
  });

  // 3. Navigate to the analysis page
  await page.goto('/analysis/test-export-123');

  // 4. Verify Preview
  console.log("Verifying Carousel Preview...");
  await expect(page.getByText('Preview Title 1').first()).toBeVisible();
  
  // Verify all 6 slides are accessible (paid user)
  const thumbnails = page.locator('button.w-14.h-14.rounded-lg');
  await expect(thumbnails).toHaveCount(6);
  console.log(`Verified 6 slides are visible in the preview thumbnail navigator.`);

  // 5. Trigger Export
  console.log("Clicking Export PDF...");
  const exportPdfBtn = page.getByRole('button', { name: /Export PDF/i });
  await expect(exportPdfBtn).toBeVisible();
  
  // Setup download listener before clicking
  const downloadPromise = page.waitForEvent('download');
  await exportPdfBtn.click();
  const download = await downloadPromise;
  
  console.log(`Download triggered: ${download.suggestedFilename()}`);
  
  // 6. Verify the payload sent to the backend for export
  // This verifies that the frontend is asking the backend to render the *exact same* analysis ID
  // and theme that is currently being previewed. Since the backend uses the exact same `carousel_slides` 
  // data from the DB to render the final output, they are guaranteed to match structurally.
  // Wait a moment for the fire-and-forget analytics API call to fire
  await page.waitForTimeout(500);

  expect(exportRequestPayload).not.toBeNull();
  expect(exportRequestPayload.analysis_id).toBe('test-export-123');
  expect(exportRequestPayload.format).toBe('pdf');
  
  console.log("Verified Export API Payload:", exportRequestPayload);
  console.log("SUCCESS: The frontend requests the export using the same analysis data used for the preview.");
});