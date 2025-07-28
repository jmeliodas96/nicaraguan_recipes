    import { defineConfig, devices } from '@playwright/test';

    export default defineConfig({
      testDir: './tests', 

      testMatch: /.*\.spec\.ts$/, // O /.*\.test\.ts$/

      projects: [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        
      ],
    });
    