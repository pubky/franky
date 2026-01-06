import { backupDownloadFilePath } from '../support/auth';
import { createQuickPost, fastTagPost, replyToPost, repostPost } from '../support/posts';
import { slowCypressDown } from 'cypress-slow-down';
import 'cypress-slow-down/commands';
import { searchAndFollowProfile, searchForProfileByPubky } from '../support/contacts';
import {
  clickFollowButton,
  unfollowUserByUsername,
  waitForNotificationDotToDisappear,
  checkLatestNotification,
  addProfileTags,
  waitForPutLastRead,
} from '../support/profile';
import { BackupType, HasBackedUp } from '../support/types/enums';
import { verifyNotificationCounter } from '../support/common';
import { goToProfilePageFromHeader } from '../support/header';

const profile1 = { username: 'Notif #1', pubkyAlias: 'pubky_1' };
const profile2 = { username: 'Notif #2', pubkyAlias: 'pubky_2' };

describe('notifications', () => {
  before(() => {
    slowCypressDown();
    cy.deleteDownloadsFolder();

    // * create profile 1
    cy.onboardAsNewUser(profile1.username, '', [BackupType.EncryptedFile], profile1.pubkyAlias);
    cy.signOut(HasBackedUp.Yes);

    // * create profile 2
    cy.onboardAsNewUser(profile2.username, '', [BackupType.EncryptedFile], profile2.pubkyAlias);
    cy.signOut(HasBackedUp.Yes);
  });

  beforeEach(() => {
    // Re-create the aliases in beforeEach
    cy.log('Re-creating aliases in beforeEach');
    cy.wrap(Cypress.env(profile1.pubkyAlias)).as(profile1.pubkyAlias);
    cy.wrap(Cypress.env(profile2.pubkyAlias)).as(profile2.pubkyAlias);

    // sign in if not already
    cy.location('pathname').then((currentPath) => {
      if (currentPath !== '/home') {
        cy.signInWithEncryptedFile(backupDownloadFilePath(profile1.username));
      }
    });
  });

  // todo: skip due to bug, see https://github.com/pubky/franky/issues/695
  it.skip('can be notified for new follower, friend, lost friend', () => {
    // * profile 1 follows profile 2
    cy.get(`@${profile2.pubkyAlias}`).then((pubky) => {
      searchAndFollowProfile(`${pubky}`, profile2.username);
    });

    // * profile 2 checks notification for new follower
    cy.signOut(HasBackedUp.Yes);

    cy.signInWithEncryptedFile(backupDownloadFilePath(profile2.username));
    verifyNotificationCounter(1);
    goToProfilePageFromHeader();
    waitForPutLastRead();
    verifyNotificationCounter(0);
    // check latest notification on profile page and navigate to profile 1 profile page
    checkLatestNotification([profile1.username, 'followed you'], profile1.username);

    // * profile 2 follows profile 1
    clickFollowButton();

    // * profile 1 checks notification for new follower and friend
    cy.signOut(HasBackedUp.Yes);

    cy.signInWithEncryptedFile(backupDownloadFilePath(profile1.username));
    verifyNotificationCounter(1);
    goToProfilePageFromHeader();
    waitForPutLastRead();
    verifyNotificationCounter(0);
    // check latest notification on profile page
    checkLatestNotification([profile2.username, 'is now your friend']);

    // * check that toggling profile page tabs clears notification counter for new notification
    cy.get('[data-cy="profile-filter-item-posts"]').click();
    // Wait for posts filter item to become active before clicking notifications
    cy.get('[data-cy="profile-filter-item-posts"]').closest('[data-selected="true"]').should('exist');
    cy.get('[data-cy="profile-filter-item-notifications"]').click();
    waitForNotificationDotToDisappear();

    // * profile 1 unfollows profile 2
    // todo: fails here due to bug, button shows 'Follow' text bug, see https://github.com/pubky/franky/issues/695
    unfollowUserByUsername(profile2.username);
    cy.signOut(HasBackedUp.Yes);

    // * profile 2 checks notification for lost friend
    cy.signInWithEncryptedFile(backupDownloadFilePath(profile2.username));
    verifyNotificationCounter(1);
    goToProfilePageFromHeader();
    waitForPutLastRead();
    verifyNotificationCounter(0);
    // check latest notification on profile page
    checkLatestNotification([profile1.username, 'is not your friend anymore']);

    // * profile 2 unfollows profile 1
    unfollowUserByUsername(profile1.username);
    cy.signOut(HasBackedUp.Yes);

    // * profile 1 checks absence of notifications
    cy.signInWithEncryptedFile(backupDownloadFilePath(profile1.username));
    cy.assertElementDoesNotExist('[data-cy="header-notification-counter"]');

    // TODO: add checks for disabled notifications
    // * profile 1 disables follow notifications
    // * profile 2 disables friend notifications
    // * profile 2 follows profile 1
    // * profile 1 checks absence of notifications
    // * profile 1 follows profile 2
    // * profile 2 checks for follow notification? and absence of friend notification
  });

  // todo: skip due to bug, see https://github.com/pubky/franky/issues/716
  it.skip('can be notified for tagged post and profile', () => {
    // * profile 1 creates a post
    createQuickPost(`I will be notified when this post is tagged! ${Date.now()}`);

    // * profile 1 tags profile 2's profile
    cy.get(`@${profile2.pubkyAlias}`).then((pubky) => {
      searchForProfileByPubky(`${pubky}`, profile2.username);
    });

    // add one tag to profile
    cy.get('[data-cy="profile-tag-btn"]').click();
    const profileTag = 'nice';
    addProfileTags([profileTag]);

    // * profile 2 checks for notification for tagged profile
    cy.signOut(HasBackedUp.Yes);

    cy.signInWithEncryptedFile(backupDownloadFilePath(profile2.username));
    verifyNotificationCounter(1);
    goToProfilePageFromHeader();
    waitForPutLastRead();
    verifyNotificationCounter(0);
    // check latest notification on profile page
    checkLatestNotification([profile1.username, 'tagged your profile', profileTag]);

    // * check that toggling profile page tabs clears notification counter for new notification
    cy.get('[data-cy="profile-filter-item-posts"]').click();
    cy.get('[data-cy="profile-filter-item-posts"]').closest('[data-selected="true"]').should('exist');
    cy.get('[data-cy="profile-filter-item-notifications"]').click();
    waitForNotificationDotToDisappear();

    // * profile 2 tags profile 1's post (from their profile page)
    cy.get(`@${profile1.pubkyAlias}`).then((pubky) => {
      searchForProfileByPubky(`${pubky}`, profile1.username);
    });
    // click Posts tab to show profile 1's posts
    cy.get('[data-cy="profile-filter-item-posts"]').click();
    cy.get('[data-cy="profile-filter-item-posts"]').closest('[data-selected="true"]').should('exist');
    const postTag = 'ilike';
    // check profile 1 has at least 1 post and tag the first post
    cy.get('[data-cy="timeline-posts"]')
      .children()
      .should('have.length.at.least', 1)
      .first()
      .within(() => {
        // Click the add tag button to show the input, then type and submit
        // todo: fails here due to bug, see https://github.com/pubky/franky/issues/716
        cy.get('[data-cy="post-tag-add-button"]').click();
        cy.get('[data-cy="add-tag-input"]').type(`${postTag}{enter}`);
      });

    // * profile 1 checks for notification for tagged post
    cy.signOut(HasBackedUp.Yes);

    cy.signInWithEncryptedFile(backupDownloadFilePath(profile1.username));
    verifyNotificationCounter(1);
    goToProfilePageFromHeader();
    waitForPutLastRead();
    verifyNotificationCounter(0);
    checkLatestNotification([profile2.username, 'tagged your post', postTag]);

    // TODO: add checks for disabled notifications
    // * profile 1 disables notifications for tagged profile
    // * profile 2 disables notifications for tagged post
    // * profile 2 creates a post
    // * profile 2 tags profile 1's profile
    // * profile 1 checks for absence of notifications
    // * profile 1 tags profile 2's post
    // * profile 2 checks for absence of notifications
  });

  // todo: blocked by bug, see https://github.com/pubky/franky/issues/717
  it('can be notified for profile being mentioned in a post');

  it('can be notified for your post being replied to', () => {
    // * profile 1 creates a post (1)
    const postContent = `I will be notified when this post is replied to! ${Date.now()}`;
    createQuickPost(postContent);

    // * profile 2 replies to profile 1's post (1)
    cy.signOut(HasBackedUp.Yes);
    cy.signInWithEncryptedFile(backupDownloadFilePath(profile2.username));
    replyToPost({ replyContent: 'I replied to your post!', filterText: postContent });

    // * profile 1 checks for notification for being replied to
    cy.signOut(HasBackedUp.Yes);
    cy.signInWithEncryptedFile(backupDownloadFilePath(profile1.username));
    verifyNotificationCounter(1);
    goToProfilePageFromHeader();
    waitForPutLastRead();
    verifyNotificationCounter(0);
    checkLatestNotification([profile2.username, 'replied to your post']);
    //cy.wait(1000);

    // TODO: add checks for disabled notifications
    // * profile 1 disables notifications for being replied to
    // * profile 1 creates a post (2)
    // * profile 2 replies to profile 1's post (2)
    // * profile 1 checks for absence of notifications
  });

  it('can be notified for your post being reposted', () => {
    // * profile 1 creates a post (1)
    createQuickPost(`I will be notified when this post is reposted! ${Date.now()}`);

    // * profile 2 reposts profile 1's post (1)
    cy.signOut(HasBackedUp.Yes);
    cy.signInWithEncryptedFile(backupDownloadFilePath(profile2.username));
    repostPost({ repostContent: 'I reposted your post!' });

    // * profile 1 checks for notification for being reposted
    cy.signOut(HasBackedUp.Yes);
    cy.signInWithEncryptedFile(backupDownloadFilePath(profile1.username));
    verifyNotificationCounter(1);
    goToProfilePageFromHeader();
    waitForPutLastRead();
    verifyNotificationCounter(0);
    checkLatestNotification([profile2.username, 'reposted your post']);

    // TODO: add checks for disabled notifications
    // * profile 1 disables notifications for being reposted
    // * profile 1 creates a post (2)
    // * profile 2 reposts profile 1's post (2)
    // * profile 1 checks for absence of notifications
  });

  it('can be notified for a post being deleted that you replied to');

  it('can be notified for a post being deleted that you reposted');

  it('can be notified for a post being edited that you replied to');

  it('can be notified for a post being edited that you reposted');

  it('can display counter for multiple new notifications');
});
