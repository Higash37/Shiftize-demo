import { test, expect } from '@playwright/test';

test.describe('Landing Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://shift-scheduler-app-vu6i.onrender.com/(landing)');
  });

  test('should display hero section with side-by-side layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Hero section should be visible
    const heroSection = page.locator('text=シフト作成、もう悩まない。');
    await expect(heroSection).toBeVisible();
    
    // Take screenshot of hero section
    await page.screenshot({ 
      path: 'screenshots/landing-hero-desktop.png',
      fullPage: false
    });
  });

  test('should display features with alternating layout', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Scroll to features section
    await page.locator('text=エンタープライズ級の機能群').scrollIntoViewIfNeeded();
    
    // Take screenshot of features section
    await page.screenshot({ 
      path: 'screenshots/landing-features-desktop.png',
      fullPage: false
    });
  });

  test('should display interactive demo section', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Scroll to demo section
    await page.locator('text=5つの表示形式を体験').scrollIntoViewIfNeeded();
    
    // Click on different view types
    await page.locator('text=タブレット版').click();
    await page.waitForTimeout(500);
    
    // Take screenshot of demo section
    await page.screenshot({ 
      path: 'screenshots/landing-demo-desktop.png',
      fullPage: false
    });
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Hero section should stack vertically on mobile
    const heroSection = page.locator('text=シフト作成、もう悩まない。');
    await expect(heroSection).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'screenshots/landing-mobile.png',
      fullPage: true
    });
  });

  test('should display sidebars on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Check left sidebar (navigation)
    const leftSidebar = page.locator('text=機能一覧');
    await expect(leftSidebar).toBeVisible();
    
    // Check right sidebar (update history)
    const rightSidebar = page.locator('text=更新履歴');
    await expect(rightSidebar).toBeVisible();
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'screenshots/landing-full-desktop.png',
      fullPage: true
    });
  });
});