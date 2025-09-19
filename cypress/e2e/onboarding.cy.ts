import { slowCypressDown } from 'cypress-slow-down';


describe('Onboarding', () => {
  before(() => {
    slowCypressDown();
  })

  beforeEach(() => {
    cy.deleteDownloadsFolder();
  })

  it('can onboard as a new user', () => {
    cy.onboardAsNewUser('Test User', 'Test Bio');
    // todo: check users profile before sign out once implemented

    // temporary approach to sign out
    cy.get('#feed-logout-btn').click();
    cy.location('pathname').should('eq', '/logout');
    // navigate back to homepage
    cy.get('#logout-navigation-back-btn').click();
    cy.location('pathname').should('eq', '/');
  })
})