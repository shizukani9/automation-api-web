// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// 🔍 Detección automática de CI
const isCI = !!process.env.CI || !!process.env.GITHUB_ACTIONS;

export default defineConfig({
  testDir: './src/tests',
  
  // ⏱️ Timeouts
  timeout: isCI ? 600000 : 900000, // 10 min en CI, 15 min en local
  
  fullyParallel: false,
  
  // 🔄 RETRIES - Reintentos globales
  retries: isCI ? 2 : 1,
  
  workers: isCI ? 1 : 4,
  
  reporter: [
    ['html', { outputFolder: 'reports/playwright-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['list']
  ],
  
  use: {
    // 🎯 HEADLESS DINÁMICO - Se activa automáticamente en CI
    headless: isCI,
    
    // 📦 URLs
    baseURL: process.env.BASE_URL_FRONT || 'https://automationexercise.com',
    
    // 📸 Evidencias
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // ⏱️ Timeouts de acciones
    actionTimeout: isCI ? 60000 : 90000, // 1 min en CI, 1.5 min en local
    navigationTimeout: isCI ? 120000 : 200000, // 2 min en CI, 3 min en local
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});