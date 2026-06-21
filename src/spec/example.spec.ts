import { test, expect } from '@playwright/test';

test('test básico', async ({ page }) => {
  await page.goto('https://automationexercise.com');
  console.log('✅ Test ejecutado correctamente');
  test.setTimeout(80000);
});