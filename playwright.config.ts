import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  webServer: {
    command: 'python -m http.server 8390',
    url: 'http://127.0.0.1:8390',
    reuseExistingServer: true,
    timeout: 30000,
  },
  use: { baseURL: 'http://127.0.0.1:8390' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile',  use: { ...devices['Desktop Chrome'], viewport: { width: 390,  height: 844 } } },
  ],
});
