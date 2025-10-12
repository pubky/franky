// <reference types="cypress" />

import { backupDownloadFilePath } from './common';
//import { checkPostIsIndexed, waitForFeedToLoad } from './posts';
import { BackupType } from './types/enums';
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add(
  'onboardAsNewUser',
  (
    profileName: string,
    profileBio: string = '',
    backup?: BackupType[],
    //skipOnboardingSlides: SkipOnboardingSlides = SkipOnboardingSlides.Yes,
    pubkyAlias?: string,
  ) => {
    cy.location('pathname').then((pathname) => {
      if (pathname !== '/') cy.visit('/');
    });
    cy.location('pathname').should('eq', '/');

    cy.get('#create-account-btn').click();
    cy.location('pathname').should('eq', '/onboarding/install');

    cy.get('#create-keys-in-browser-btn').click();
    cy.location('pathname').should('eq', '/onboarding/pubky');

    // copy pubky to alias
    if (pubkyAlias) {
      cy.get('#copy-to-clipboard-action-btn').click();
      cy.saveCopiedPubkyToAlias(pubkyAlias);
    }

    cy.get('#public-key-navigation-continue-btn').click();
    cy.location('pathname').should('eq', '/onboarding/backup');

    if (backup?.includes(BackupType.EncryptedFile)) {
      cy.get('#backup-encrypted-file-btn').click();
      cy.get('#password').type('123456');
      cy.get('#confirmPassword').type('123456');
      cy.get('#download-file-btn').click();
      cy.renameFile(backupDownloadFilePath(), backupDownloadFilePath(profileName));
      cy.get('#backup-successful-ok-btn').click();
    }
    if (
      backup?.includes(BackupType.RecoveryPhraseWithoutConfirmation) ||
      backup?.includes(BackupType.RecoveryPhraseWithConfirmation)
    ) {
      cy.get('#backup-recovery-phrase-btn').click();
      cy.get('#backup-recovery-phrase-reveal-btn').click();

      // Store the recovery phrase in a unique alias for later use
      collectRecoveryPhraseWords().then((recoveryPhrase) => {
        cy.wrap(recoveryPhrase).as(`recoveryPhrase-${profileName}`);
      });

      cy.get('#backup-recovery-phrase-confirm-btn').click();

      // either skip phrase confirmation or confirm it
      if (backup?.includes(BackupType.RecoveryPhraseWithoutConfirmation)) {
        cy.get('#dialog-close-btn').click();
      } else if (backup?.includes(BackupType.RecoveryPhraseWithConfirmation)) {
        cy.get(`@recoveryPhrase-${profileName}`).then((recoveryPhrase) => {
          confirmRecoveryPhrase(recoveryPhrase.toString());
        });
      }
    }

    cy.get('#backup-navigation-continue-btn').click();
    cy.location('pathname').should('eq', '/onboarding/homeserver');

    // request invite code from homeserver and input it
    cy.request({
      method: 'GET',
      url: Cypress.env('homeserverAdminUrl'),
      headers: {
        'X-Admin-Password': Cypress.env('homeserverAdminPassword'),
      },
    }).then((response) => {
      const inviteCode = response.body;
      cy.wrap(inviteCode).as('inviteCode');
      cy.get('#invite-code-input').type(inviteCode);
    });

    cy.get('#homeserver-navigation-continue-btn').click();

    cy.location('pathname').should('eq', '/onboarding/profile');

    cy.get('#profile-name-input').type(profileName);
    cy.get('#profile-bio-input').type(profileBio);
    //cy.get('#profile-links-input').type(profileLinks);

    cy.get('#profile-finish-btn').click();

    cy.location('pathname').should('eq', '/home');

    // confirm welcome message is shown and dismiss it
    cy.get('#welcome-title').should('exist');
    cy.get('#welcome-explore-pubky-btn').click();
  },
);

// Confirm recovery phrase by clicking each word in order
function confirmRecoveryPhrase(recoveryPhrase: string): void {
  const words = recoveryPhrase.split(' ');
  const sortedWords = [...words].sort();

  // Track which indices in sortedWords we've already used
  const usedIndices = new Set<number>();

  words.forEach((word) => {
    // Find the next available index of the current word in the sorted list
    let alphaIndex = -1;
    for (let i = 0; i < sortedWords.length; i++) {
      if (sortedWords[i] === word && !usedIndices.has(i)) {
        alphaIndex = i;
        usedIndices.add(i);
        break;
      }
    }

    if (alphaIndex === -1) {
      throw new Error(`Could not find available index for word: ${word}`);
    }

    cy.get(`#backup-recovery-phrase-word-${word}-${alphaIndex + 1}`).click();
  });
  cy.get('#backup-recovery-phrase-validate-btn').click();
  cy.get('#backup-recovery-phrase-finish-btn').click();
}

// Collect all 12 recovery phrase words
function collectRecoveryPhraseWords(): Cypress.Chainable<string> {
  return cy.get('[id^="backup-recovery-phrase-word-"]').then(($elements) => {
    const words: string[] = [];

    // Extract words from each element in order
    $elements.each((index, element) => {
      const $el = Cypress.$(element);
      const wordText = $el.parent().find('span').text().trim();
      words.push(wordText);
    });

    return words.join(' ');
  });
}

Cypress.Commands.add('signOut', () => {
  // temporary approach to sign out
  cy.get('#home-logout-btn').click();
  cy.location('pathname').should('eq', '/logout');
  // navigate back to homepage
  cy.get('#logout-navigation-back-btn').click();
  cy.location('pathname').should('eq', '/');

  // todo: implement sign out using the following as a reference
  // cy.location('pathname').then((currentPath) => {
  //   if (currentPath !== '/profile') {
  //     goToProfilePageFromHeader();
  //   }
  // });

  // cy.location('pathname').should('eq', '/profile');

  // cy.get('#profile-sign-out-btn').click();

  // // sign out model only shows if user has not backed up recovery file
  // if (hasBackedUp === HasBackedUp.No) cy.get('#logout-modal-sign-out-btn').click();

  // cy.location('pathname').should('eq', '/logout');

  // cy.get('#sign-back-in-btn').click();
  // cy.location('pathname').should('eq', '/sign-in');
});

Cypress.Commands.add('signInWithEncryptedFile', (backupFilepath: string, passcode = '123456') => {
  cy.location('pathname').then((pathname) => {
    if (pathname !== '/') cy.visit('/');
  });
  cy.location('pathname').should('eq', '/');

  cy.get('#sign-in-btn').click();
  cy.location('pathname').should('eq', '/sign-in');

  cy.get('#restore-encrypted-file-btn').click();

  cy.get('#encrypted-file-input').selectFile(
    backupFilepath,
    { force: true }, // force to bypass visibility check of hidden input field
  );

  cy.get('#restore-password').type(passcode);
  cy.get('#encrypted-file-restore-btn').click();

  cy.location('pathname').should('eq', '/home');
});

Cypress.Commands.add('signInWithRecoveryPhrase', (recoveryPhrase: string) => {
  cy.location('pathname').then((pathname) => {
    if (pathname !== '/') cy.visit('/');
  });
  cy.location('pathname').should('eq', '/');

  cy.get('#sign-in-btn').click();
  cy.location('pathname').should('eq', '/sign-in');

  cy.get('#restore-recovery-phrase-btn').click();
  inputRecoveryPhraseWords(recoveryPhrase);
  cy.get('#recovery-phrase-restore-btn').click();

  cy.location('pathname').should('eq', '/home');
});

// Input recovery phrase words into the form
function inputRecoveryPhraseWords(recoveryPhrase: string): void {
  const words = recoveryPhrase.split(' ');
  words.forEach((word, index) => {
    cy.get(`#word-slot-input-${index + 1}`).type(word);
  });
}

Cypress.Commands.add('backupRecoveryFile', (passcode = '123456') => {
  cy.get('#remind-backup-now-btn').click();
  cy.get('#backup-recovery-file-btn').click();
  cy.get('#backup-recovery-file-password-input').type(passcode);
  cy.get('#backup-download-recovery-file-btn').click();
  cy.get('#backup-successful-ok-btn').click();
});

Cypress.Commands.add('deleteDownloadsFolder', () => {
  const downloadsFolder = Cypress.config('downloadsFolder');
  cy.task('deleteFolder', downloadsFolder);
});

Cypress.Commands.add('deleteFile', (filePath: string) => {
  cy.task('deleteFile', filePath).then(() => {
    cy.log(`${filePath} has been deleted`);
  });
});

Cypress.Commands.add('renameFile', (fromPath: string, toPath: string) => {
  cy.task('renameFile', { fromPath, toPath }).then(() => {
    cy.log(`File has been renamed from ${fromPath} to ${toPath}`);
  });
});

// Useful when 'should.be' doesn't work due to additional space inserted before final word.
Cypress.Commands.add('innerTextShouldEq', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should(($elem) => {
    expect($elem.get(0).innerText).to.eq(text);
  });
});

// Useful when 'should.contain' doesn't work due to additional space inserted before final word.
Cypress.Commands.add('innerTextContains', { prevSubject: 'element' }, (subject, text) => {
  return cy.wrap(subject).then(($elem) => {
    return $elem.get(0).innerText.includes(text);
  });
});

// Useful when 'should.contain' doesn't work due to additional space inserted before final word.
Cypress.Commands.add('innerTextShouldContain', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should(($elem) => {
    expect($elem.get(0).innerText).to.contain(text);
  });
});

// Useful when 'should.not.contain' doesn't work due to additional space inserted before final word.
Cypress.Commands.add('innerTextShouldNotContain', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should(($elem) => {
    expect($elem.get(0).innerText).to.not.contain(text);
  });
});

// Useful when 'should.not.be' doesn't work due to additional space inserted before final word.
Cypress.Commands.add('innerTextShouldNotEq', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should(($elem) => {
    expect($elem.get(0).innerText).to.not.eq(text);
  });
});

// Stores the clipboard contents to an alias for later use
// see https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Sharing-Context
// note: aliases work in the context of as test and only the first test after before
Cypress.Commands.add('saveCopiedPubkyToAlias', (alias: string) => {
  cy.window()
    .then((win) => {
      // ensure focus is on the window before attempting to read clipboard
      win.focus();
      // requires browser to be in focus
      return win.navigator.clipboard.readText().then((text) => {
        // assert that pubky was copied to clipboard in correct format
        expect(text).to.match(/^pk:/);
        return text;
      });
      // previous 'then' is callback of a promise which doesn't guarantee synchronous execution
      // so an additional 'then' is needed to guarantee the alias is stored before the next test step
    })
    .then((text) => {
      // store pubky as alias
      cy.wrap(text).as(alias);
      // also store pubky in Cypress env to be used in beforeEach to re-create aliases because they are cleared at end of each test
      // e.g. cy.wrap(Cypress.env(profile1.pubkyAlias)).as(profile1.pubkyAlias);
      Cypress.env(alias, text);
    });
});

// Stores the clipboard contents to an alias for later use
// see https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Sharing-Context
// note: aliases work in the context of as test and only the first test after before
Cypress.Commands.add('saveCopiedTextToAlias', (alias: string) => {
  cy.window()
    .then((win) => {
      // ensure focus is on the window before attempting to read clipboard
      win.focus();
      // requires browser to be in focus
      return win.navigator.clipboard.readText();
      // previous 'then' is callback of a promise which doesn't guarantee synchronous execution
      // so an additional 'then' is needed to guarantee the alias is stored before the next test step
    })
    .then((text) => {
      // store pubky as alias
      cy.wrap(text).as(alias);
    });
});

Cypress.Commands.add('assertElementDoesNotExist', (selector) => {
  cy.get('body').then(($body) => {
    assert($body.find(selector).length === 0, `${selector} exists. It should not.`);
  });
});

Cypress.Commands.add('waitReload', (time = 2000) => {
  cy.wait(time).reload();
});

// wait for element to appear by default
Cypress.Commands.add('waitReloadWhileElementDoesNotExist', (selector, attempts = 30) => {
  const go = (attempts: number) => {
    if (attempts <= 0) assert(false, `waitReloadWhileElementDoesNotExist: ${selector} not found`);

    cy.get('body').then(($body) => {
      if ($body.find(selector).length === 0) {
        cy.log(`waitReloadWhileElementDoesNotExist: ${selector} not found; waiting and reloading.`);
        cy.wait(1_000);
        cy.reload();
        // wait for page to load before checking again
        // TODO: improve wait by detecting presence of key element on page (e.g. profile picture)
        cy.wait(Cypress.env('ci') ? 3_000 : 1_000);
        go(attempts - 1);
      } else {
        cy.log(`waitReloadWhileElementDoesNotExist: ${selector} found; continuing.`);
        return;
      }
    });
  };
  cy.log(`waitReloadWhileElementDoesNotExist: starting with selector: ${selector} and attempts: ${attempts}.`);
  go(attempts);
});

Cypress.Commands.add('countPostsInBookmarks', (expectedCount: number) => {
  cy.get('#bookmarked-posts').find('[id="post-container"]').should('have.length', expectedCount);
});

Cypress.Commands.add('findPostInBookmarks', (postIdx: number) => {
  return cy.get('#bookmarked-posts').find('[id="post-container"]').eq(postIdx);
});

// const findPostInFeed = (postIdx = 0, filterText?: string, checkIndexed = CheckIndexed.Yes) => {
//   waitForFeedToLoad(filterText);

//   // if 'checkIndexed' then wait for the post to have two green ticks, indicating it is indexed
//   // this is needed because the container element is rerendered when the post is indexed
//   cy.wrap(checkIndexed).then(($checkIndexed) => {
//     if ($checkIndexed === CheckIndexed.Yes) checkPostIsIndexed(postIdx);
//   });

//   // find the post in the timeline
//   cy.get('#posts-feed')
//     .find('#timeline')
//     .children()
//     .should('have.length.gte', 1)
//     .then(($posts) => {
//       // optionally filter posts by contained text
//       return filterText
//         ? // cannot use :contains due to additional space inserted between each word in the post content
//           $posts.filter((_idx, element) => element.innerText.includes(filterText))
//         : $posts;
//     })
//     .eq(postIdx);

// TODO: this implementation is more robust when "Show n new posts" appears unexpectedly, see https://github.com/pubky/pubky-app/issues/1033
// cy.get('#posts-feed')
//   .find('#timeline')
//   .should('have.descendants', '*')
//   .children()
//   .then(($posts) => {
//     // Filter out "Show new posts" element
//     const actualPosts = $posts.filter((_, el) => {
//       const text = Cypress.$(el).text();
//       // Match "Show n new posts" pattern where n is a number
//       return !/Show\s+\d+\s+new posts/i.test(text);
//     });

//     // optionally filter posts by contained text
//     return filterText
//       ? // cannot use :contains due to additional space inserted between each word in the post content
//         actualPosts.filter((_idx, element) => element.innerText.includes(filterText))
//       : actualPosts;
//   })
//   .eq(postIdx);
// };

// useful to find your latest new post
// Cypress.Commands.add('findFirstPostInFeed', (checkIndexed = CheckIndexed.Yes) => {
//   findPostInFeed(0, '', checkIndexed);
// });

// // useful for finding a specific post by text
// Cypress.Commands.add('findFirstPostInFeedFiltered', (filterText, checkIndexed = CheckIndexed.Yes) => {
//   findPostInFeed(0, filterText, checkIndexed);
// });

// // useful for finding a specific post by index with optional filter text
// Cypress.Commands.add('findPostInFeed', (postIdx = 0, filterText?, checkIndexed = CheckIndexed.Yes) => {
//   findPostInFeed(postIdx, filterText, checkIndexed);
// });

// useful for finding a specific post by text in search results
Cypress.Commands.add('findPostInSearchResults', (filterText?: string, postIdx = 0) => {
  cy.get('#post-search-results')
    .children()
    .then(($posts) => {
      return filterText ? $posts.filter((_idx, element) => element.innerText.includes(filterText)) : $posts;
    })
    .eq(postIdx);
});

// To prevent Cypress from failing the test when running pubky-app with dev build:
// `Uncaught SyntaxError: Invalid or unexpected token` on Chrome, and
// `Uncaught SyntaxError: "" literal not terminated before end of script` on firefox.
Cypress.on('uncaught:exception', () => {
  return false;
});
