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
    // todo: assert that the user is on the home page
  })
})