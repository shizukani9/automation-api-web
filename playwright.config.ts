// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  
  timeout: 900000, 
  
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
    
    // ⏱️ Timeouts de acciones
    actionTimeout: 90000, 
    navigationTimeout: 200000, 
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});