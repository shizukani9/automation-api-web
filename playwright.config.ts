// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  
  // ⏱️ TIMEOUT GLOBAL
  timeout: 120000, // 2 minutos
  
  fullyParallel: false,
  
  // 🔄 RETRIES - Reintentos globales
  retries: process.env.CI ? 2 : 1,
  
  workers: process.env.CI ? 1 : 4,
  
  reporter: [
    ['html', { outputFolder: 'reports/playwright-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['list']
  ],
  
  use: {
    headless: !!process.env.CI,
    baseURL: 'https://automationexercise.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 60000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});