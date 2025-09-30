export const goToProfilePageFromHeader = () => {
  cy.get('#header-profile-pic').click();
  cy.location('pathname').should('eq', '/profile');
};
