const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './',
    testMatch: '**/*.test.js',
    timeout: 30000,
    retries: 0,
    reporter: [['list']],
    use: {
        browserName: 'chromium',
        headless: true,
        screenshot: 'only-on-failure',
    },
});
