import { test } from '@playwright/test';

test('take screenshot of production app', async ({ page }) => {
  // ページに移動
  await page.goto('https://shift-scheduler-app-vu6i.onrender.com/');

  // ページが完全に読み込まれるまで待機
  await page.waitForLoadState('networkidle');

  // スプラッシュスクリーンが消えるまで待機
  await page.waitForTimeout(500);

  // スクリーンショットを撮影
  await page.screenshot({
    path: 'screenshots/production-app.png',
    fullPage: true
  });
});