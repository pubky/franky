// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Grant clipboard permissions for Chrome/WebKit in CI environments
// This is needed in addition to browser launch flags for headless browsers
// The CDP command must be run after visiting a page
before(() => {
  if (Cypress.env('ci') && (Cypress.browser.family === 'chromium' || Cypress.browser.family === 'webkit')) {
    cy.visit('/');
    cy.window().then((win) => {
      Cypress.automation('remote:debugger:protocol', {
        command: 'Browser.grantPermissions',
        params: {
          permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
          origin: win.location.origin,
        },
      }).catch(() => {
        // Ignore errors if CDP is not available (e.g., in some browser configurations)
      });
    });
  }
});
