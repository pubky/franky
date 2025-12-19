import { clickFollowButton } from './profile';

export const searchForProfileByPubky = (pubky: string, profileName: string) => {
  // type pubkyinto search bar and press enter
  //cy.get('#header-search-input').type(`${pubky}{enter}`);
  // todo: use search once implemented
  cy.visit(`/profile/${pubky}`);

  // check that profile page is displayed
  cy.get('[data-cy="profile-username-header"]').should('have.text', profileName);
};

export const searchForProfileByName = (profileName: string) => {
  // type profile name into  search bar
  cy.get('#header-search-input').type(`${profileName}`);

  // click on profile found in search results
  cy.get('#user-0').should('be.visible').click();

  // check that profile page is displayed
  cy.get('[data-cy="profile-username-header"]').should('have.text', profileName);
};

export const searchAndFollowProfile = (pubky: string, profileName: string, interceptAlias?: string) => {
  // search for profile
  searchForProfileByPubky(pubky, profileName);

  // Check follow button is displayed for account 1
  cy.get('[data-cy="profile-follow-toggle-btn"]').should('be.visible').and('have.text', 'Follow');

  // for waiting for data to index
  if (interceptAlias) {
    cy.intercept('GET', '**/v0/stream/users/ids*').as(interceptAlias);
  }

  // follow profile
  clickFollowButton();
};
