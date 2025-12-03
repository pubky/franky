import { goToProfilePageFromHeader } from './header';

interface ProfileField {
  editSelector: string;
  verifySelector: string;
}

const profileFields: { [key: string]: ProfileField } = {
  name: {
    editSelector: '#edit-profile-name-input',
    verifySelector: '#profile-username-header',
  },
  bio: {
    editSelector: '#edit-profile-bio-input',
    verifySelector: '#profile-bio-content',
  },
  linkWebsite: {
    editSelector: '#edit-profile-link-website-input',
    verifySelector: '#profile-link-website',
  },
  linkBluesky: {
    editSelector: '#edit-profile-link-bluesky-input',
    verifySelector: '#profile-link-bluesky',
  },
};

// use on edit profile page
export const addLinks = (links: { label: string; url: string }[]) => {
  links.forEach((link) => {
    cy.get('#edit-profile-add-link-btn').click();
    cy.get('#add-profile-link-header').should('be.visible');
    cy.get('#add-profile-link-label-input').type(link.label);
    cy.get('#add-profile-link-url-input').type(link.url);
    cy.get('#add-profile-link-submit-btn').click();
    cy.get(`#edit-profile-link-${link.label.toLowerCase()}-input`).should('be.visible');
  });
};

// use on edit profile page
// todo: add support for profile picture upload
export const editProfileAndVerify = (profileData: Partial<Record<keyof typeof profileFields, string>>) => {
  // Perform the edit on each field in profileData
  Object.entries(profileData).forEach(([field, value]) => {
    const { editSelector } = profileFields[field];
    cy.get(editSelector).clear();
    cy.get(editSelector).type(value as string);
  });

  // Save the changes
  cy.get('#edit-profile-save-btn').click();

  // Verify redirection to the profile page
  cy.location('pathname').should('eq', '/profile');

  // Verify the changes for each field in profileData
  Object.entries(profileData).forEach(([field, value]) => {
    const { verifySelector } = profileFields[field];
    // if value begins with 'http://' or 'https://' remove it
    const valueWithoutHttp = value?.replace(/^https?:\/\//, '') || '';

    // This approach fails for bio due to additional space inserted before final word.
    // cy.get(verifySelector).should('have.text', value);

    // This is the equivalent of Selenium's getText() method, which returns the innerText of a visible element.
    cy.get(verifySelector).should(($elem) => {
      expect($elem.get(0).innerText).to.eq(valueWithoutHttp);
    });
  });
};

export const clickFollowButton = () => {
  cy.get('[data-cy="profile-follow-toggle-btn"]').should('be.visible').and('have.text', 'Follow').click();
  // Check follow button is now unfollow
  cy.get('[data-cy="profile-follow-toggle-btn"]').should('be.visible').and('have.text', 'Following');
};

export const clickUnfollowButton = () => {
  cy.get('[data-cy="profile-follow-toggle-btn"]').should('be.visible').and('have.text', 'Following').click();
  // Check follow button is now follow
  cy.get('[data-cy="profile-follow-toggle-btn"]').should('be.visible').and('have.text', 'Follow');
};

// wait for notifications to load profile names (prevents 'no longer attached to the DOM' error when checking list of notifications)
export const waitForNotificationsToLoad = (attempts: number = 5) => {
  if (attempts <= 0) assert(false, `waitForNotificationsToLoad: Notifications not loaded`);

  cy.get('#notifications-list').then(($notificationsList) => {
    cy.wrap($notificationsList)
      .invoke('text')
      .then((text) => {
        // if contains 'pk:' then pubky is being used whilst waiting for profile name
        if (text.includes('No notifications yet') || text.includes('Loading') || text.includes('pk:')) {
          cy.wait(1000);
          waitForNotificationsToLoad(attempts - 1);
        }
      });
  });
};

// wait for notification dot to disappear from all listed notifications (useful to prevent 'no longer attached to the DOM' error when checking list of notifications)
export const waitForNotificationDotToDisappear = (t: number = 25) => {
  if (t === 0) assert(false, `waitForNotificationDotToDisappear: Notification dot id not disappear`);
  cy.get('#notifications-list').then(($notifs) => {
    if ($notifs.find('#notification-unread-dot').length > 0) {
      cy.log('waitForNotificationDotToDisappear: Notification dot is still visible; waiting 200ms and checking again');
      cy.wait(200);
      waitForNotificationDotToDisappear(t - 1);
    }
  });
};

export const checkLatestNotification = (expectedContent: string[], profileToNavigateTo?: string) => {
  cy.location('pathname').should('eq', '/profile');
  waitForNotificationsToLoad();
  // assert that each expected string is present in the first notification listed
  cy.get('#notifications-list')
    .should('be.visible')
    .children()
    .should('have.length.at.least', 1)
    .first()
    .should(($firstNotif) => {
      expectedContent.forEach((content) => {
        expect($firstNotif).to.contain(content);
      });
    });
  // if profile name is provided, navigate to it in the notification
  if (profileToNavigateTo) {
    cy.get('#notifications-list')
      .should('be.visible')
      .children()
      .should('have.length.at.least', 1)
      .first()
      .within(($firstNotif) => {
        cy.wrap($firstNotif).get('a').should('have.text', profileToNavigateTo).click();
      });
  }
};

// add tags to a profile using the profile tagged page
export const addProfileTags = (tags: string[]) => {
  // add the tag
  for (const tag of tags) {
    cy.get('#add-tag-input').type(tag);
    cy.get('#add-tag-btn').should('be.visible').click();
  }

  // wait for the tags to be added
  cy.get(`#tag-${tags[0]}`).should('be.visible');
};

export const unfollowUserByUsername = (username: string) => {
  goToProfilePageFromHeader();
  cy.get('#profile-tab-following').click();
  cy.contains('#list-profile-name', username)
    .parentsUntil('#profile-list-root')
    .parent()
    .find('#list-unfollow-button')
    .should('be.visible')
    .click();
  cy.get('#list-follow-button').should('contain.text', 'Follow');
};
