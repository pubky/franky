import { backupDownloadFilePath } from '../support/auth';
import { slowCypressDown } from 'cypress-slow-down';
// registers the cy.slowDown and cy.slowDownEnd commands
import 'cypress-slow-down/commands';
import { latestPostInFeedContentEq, createQuickPost, waitForFeedToLoad } from '../support/posts';
import { defaultMs, fastMs } from '../support/slow-down';
import { BackupType, CheckIndexed, HasBackedUp, SkipOnboardingSlides } from '../support/types/enums';

const username = 'Poster';

describe('posts', () => {
  before(() => {
    slowCypressDown();
    cy.deleteDownloadsFolder();

    // create profile to post from
    cy.onboardAsNewUser(username, 'Big on posting.', [BackupType.EncryptedFile]);
  });

  beforeEach(() => {
    // in case it gets changed by a test and not reset
    cy.slowDown(defaultMs);

    // sign in if not already
    cy.location('pathname').then((currentPath) => {
      if (currentPath !== '/home') {
        cy.signInWithEncryptedFile(backupDownloadFilePath(username));
        waitForFeedToLoad();
      }
    });
  });

  it('can post from quick post box', () => {
    const postContent = `I can post using the quick post box! ${Date.now()}`;
    createQuickPost(postContent);

    // verify the post is displayed correctly in feed
    latestPostInFeedContentEq(postContent);

    // wait for post to be indexed before reloading page
    // checkLatestPostIsIndexed();
    // todo: remove this once we have a way to check if the post is indexed
    cy.wait(1000);

    // reload and check post is still displayed correctly
    cy.reload();
    //waitForFeedToLoad();
    latestPostInFeedContentEq(postContent);
  });
});
