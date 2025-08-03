import { test } from '@playwright/test';

test('take screenshot of localhost:8081', async ({ page }) => {
  // ページに移動
  await page.goto('http://localhost:8081/');
  
  // ページが完全に読み込まれるまで待機
  await page.waitForLoadState('networkidle');
  
  // スプラッシュスクリーンが消えるまで待機
  await page.waitForTimeout(500);
  
  // スクリーンショットを撮影
  await page.screenshot({ 
    path: 'screenshots/localhost-8081-app.png',
    fullPage: true 
  });
});