import { slowCypressDown } from 'cypress-slow-down';
import { BackupType, HasBackedUp } from '../support/types/enums';
import { backupDownloadFilePath } from '../support/common';

describe('Onboarding', () => {
  before(() => {
    slowCypressDown();
  });

  beforeEach(() => {
    cy.deleteDownloadsFolder();
    cy.visit('/');
    checkHeaderIsVisible();
  });

  const checkHeaderIsVisible = () => {
    cy.get('header').should('exist').should('be.visible');
    cy.get('#header-sign-in-btn').should('exist').should('be.visible');
  };

  it('can onboard as a new user backing up with encrypted file and recovery phrase, sign out, then sign in with both methods', () => {
    // profile name is also used for the backup file name
    const profileName = 'Test User';
    const backupWithFileAndPhrase = [BackupType.EncryptedFile, BackupType.RecoveryPhraseWithConfirmation];

    cy.onboardAsNewUser(profileName, 'Test Bio', backupWithFileAndPhrase);

    // confirm backup reminder is shown
    cy.get('#backup-btn').should('exist').click();
    // confirm backup dialog can be shown and closed
    cy.get('#backup-dialog-title').should('exist');
    cy.get('[data-testid="dialog-close"]').click();
    // confirm backup done button can be clicked
    cy.get('#backup-done-btn').click();
    // confirm backup confirmation dialog can be shown and dismissed
    cy.get('#backup-done-warning-text').should('exist');
    cy.get('#backup-done-confirm-btn').click();
    // confirm backup reminder is not shown
    cy.get('#backup-btn').should('not.exist');

    cy.signOut(HasBackedUp.Yes);

    cy.signInWithEncryptedFile(backupDownloadFilePath(profileName));

    cy.signOut(HasBackedUp.Yes);

    cy.get(`@recoveryPhrase-${profileName}`).then((recoveryPhrase) => {
      cy.signInWithRecoveryPhrase(recoveryPhrase.toString());
    });

    cy.signOut(HasBackedUp.Yes);
    // todo: check users profile has correctly saved before sign out once implemented
  });

  // todo: reenable once bug is fixed, https://github.com/pubky/franky/issues/496
  // fails at invite code stage due to last_read 401
  it('can sign up, sign out, then sign up again as a new user', () => {
    const firstProfileName = 'First User';
    const secondProfileName = 'Second User';

    // sign up as first user
    cy.onboardAsNewUser(firstProfileName);

    // sign out
    cy.signOut(HasBackedUp.Yes);

    // verify we're back at the home page and can sign up again
    cy.location('pathname').should('eq', '/');
    checkHeaderIsVisible();

    // sign up as second user
    cy.onboardAsNewUser(secondProfileName);
  });
});
