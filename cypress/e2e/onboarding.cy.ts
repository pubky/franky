import { slowCypressDown } from 'cypress-slow-down';
import { BackupType, HasBackedUp } from '../support/types/enums';
import { backupDownloadFilePath } from '../support/common';


describe('Onboarding', () => {
  before(() => {
    slowCypressDown();
  })

  beforeEach(() => {
    cy.deleteDownloadsFolder();
    cy.visit('/');
  })

  it('can onboard as a new user backing up with encrypted file and recovery phrase, sign out, then sign in with both methods', () => {
    // profile name is also used for the backup file name
    const profileName = 'Test User'
    const backupWithFileAndPhrase = [BackupType.EncryptedFile, BackupType.RecoveryPhrase];
    cy.onboardAsNewUser(profileName, 'Test Bio', backupWithFileAndPhrase);
    // todo: check users profile before sign out once implemented

    cy.signOut(HasBackedUp.Yes);

    cy.signInWithEncryptedFile(backupDownloadFilePath(profileName));
    
    cy.signOut(HasBackedUp.Yes);

    // sign in with recovery phrase
    // sign out
  })
})