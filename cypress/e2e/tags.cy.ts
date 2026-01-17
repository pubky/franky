import { backupDownloadFilePath } from '../support/auth';
import { slowCypressDown } from 'cypress-slow-down';
import 'cypress-slow-down/commands';
import { createQuickPost, waitForFeedToLoad, latestPostInFeedContentEq } from '../support/posts';
import { defaultMs } from '../support/slow-down';
import { BackupType, HasBackedUp } from '../support/types/enums';
import {
  clickAddTagButton,
  addTagToPost,
  getTag,
  assertTagHasCount,
  assertTagIsSelected,
  assertTagIsNotSelected,
  toggleTag,
  findPostByContent,
} from '../support/tags';

const userA = 'TaggerA';
const userB = 'TaggerB';

describe('tags', () => {
  before(() => {
    slowCypressDown();
    cy.deleteDownloadsFolder();

    // Create first user (User A)
    cy.onboardAsNewUser(userA, 'I like to tag posts.', [BackupType.EncryptedFile]);
    cy.signOut(HasBackedUp.Yes);

    // Create second user (User B)
    cy.onboardAsNewUser(userB, 'I also like to tag posts.', [BackupType.EncryptedFile]);
    cy.signOut(HasBackedUp.Yes);
  });

  beforeEach(() => {
    cy.slowDown(defaultMs);
  });

  it('can add a new tag to a post', () => {
    // Sign in as User A
    cy.signInWithEncryptedFile(backupDownloadFilePath(userA));
    waitForFeedToLoad();

    // Create a post
    const postContent = `Testing new tag addition ${Date.now()}`;
    createQuickPost(postContent);
    latestPostInFeedContentEq(postContent);

    // Wait for post to be ready
    cy.wait(1000);

    // Find the post and add a tag
    findPostByContent(postContent).within(() => {
      clickAddTagButton();
      addTagToPost('newtag');

      // Verify tag appears with count 1 and is selected
      getTag('newtag').should('exist');
      assertTagHasCount('newtag', 1);
      assertTagIsSelected('newtag');
    });
  });

  it('can add existing tag to increment counter', () => {
    // Sign in as User A
    cy.signInWithEncryptedFile(backupDownloadFilePath(userA));
    waitForFeedToLoad();

    // Create a post and add a tag
    const postContent = `Testing tag increment ${Date.now()}`;
    createQuickPost(postContent);
    latestPostInFeedContentEq(postContent);

    cy.wait(1000);

    // Add initial tag as User A
    findPostByContent(postContent).within(() => {
      clickAddTagButton();
      addTagToPost('sharedtag');
      assertTagHasCount('sharedtag', 1);
      assertTagIsSelected('sharedtag');
    });

    // Wait for tag to be synced
    cy.wait(2000);

    // Sign out and sign in as User B
    cy.signOut(HasBackedUp.Yes);
    cy.signInWithEncryptedFile(backupDownloadFilePath(userB));
    waitForFeedToLoad();

    // Find the same post and add the same tag
    findPostByContent(postContent).within(() => {
      // Tag should exist but not be selected for User B
      getTag('sharedtag').should('exist');
      assertTagIsNotSelected('sharedtag');

      // Add the same tag - this should increment count to 2
      clickAddTagButton();
      addTagToPost('sharedtag');

      // Verify count incremented and tag is now selected for User B
      assertTagHasCount('sharedtag', 2);
      assertTagIsSelected('sharedtag');
    });
  });

  it('can remove own tag from a post', () => {
    // Sign in as User A
    cy.signInWithEncryptedFile(backupDownloadFilePath(userA));
    waitForFeedToLoad();

    // Create a post and add a tag
    const postContent = `Testing tag removal ${Date.now()}`;
    createQuickPost(postContent);
    latestPostInFeedContentEq(postContent);

    cy.wait(1000);

    // Add a tag
    findPostByContent(postContent).within(() => {
      clickAddTagButton();
      addTagToPost('removabletag');
      assertTagHasCount('removabletag', 1);
      assertTagIsSelected('removabletag');

      // Click the tag to remove it (toggle off)
      toggleTag('removabletag');

      // Tag should disappear since count is now 0
      cy.get('[data-cy="post-tag"][data-tag-label="removabletag"]').should('not.exist');
    });
  });

  it('can toggle tag on and off', () => {
    // Sign in as User A
    cy.signInWithEncryptedFile(backupDownloadFilePath(userA));
    waitForFeedToLoad();

    // Create a post and add a tag
    const postContent = `Testing tag toggle ${Date.now()}`;
    createQuickPost(postContent);
    latestPostInFeedContentEq(postContent);

    cy.wait(1000);

    findPostByContent(postContent).within(() => {
      // Add initial tag
      clickAddTagButton();
      addTagToPost('toggletag');
      assertTagHasCount('toggletag', 1);
      assertTagIsSelected('toggletag');

      // Toggle off (remove)
      toggleTag('toggletag');
      cy.get('[data-cy="post-tag"][data-tag-label="toggletag"]').should('not.exist');

      // Add the tag again
      clickAddTagButton();
      addTagToPost('toggletag');
      assertTagHasCount('toggletag', 1);
      assertTagIsSelected('toggletag');
    });
  });
});
