const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: false,
  retries: 0,
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js'
  }
});


