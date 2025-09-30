// import { CheckIndexed } from '../support/types/enums';

export const MAX_POST_LENGTH = 2000;

// select an emoji using the emoji picker by its data-full-name attribute
// export const selectEmojis = (emojiName: string[]) => {
//   // open emoji picker
//   cy.get('#emoji-btn').click();
//   // select each emoji
//   emojiName.forEach((emoji) => {
//     cy.get('em-emoji-picker')
//       .shadow()
//       .find(`button[aria-label*="${emoji}"]`)
//       .should('be.visible')
//       .click({ force: true });
//   });

//   // close emoji picker by clicking outside of it
//   cy.get('#emoji-picker').parent().click('left');
// };

// // check if post at index has two green ticks
// export const checkPostIsIndexed = (postIdx: number, t = 50) => {
//   if (t === 0) assert(false, `findPostInFeed: Post not indexed`);
//   cy.log(`findPostInFeed: Checking if post ${postIdx} is indexed`);
//   cy.get('#posts-feed')
//     .find('#timeline')
//     .children()
//     .eq(postIdx)
//     .then(($post) => {
//       // if post has the status checkmarks then wait for it to have two green ticks
//       if ($post.find('#post-status').length > 0) {
//         if ($post.find('#post-status #post-status-indexed').length === 0) {
//           cy.log('findPostInFeed: Post not indexed; waiting 200ms and checking again');
//           cy.wait(200);
//           checkPostIsIndexed(postIdx, t - 1);
//         }
//       } else {
//         cy.log(`findPostInFeed: Post ${postIdx} was already indexed`);
//       }
//     });
//   cy.log(`findPostInFeed: Post ${postIdx} is indexed`);
// };

// export const checkLatestPostIsIndexed = () => {
//   checkPostIsIndexed(0);
// };

// // wait for latest post to be a repost
// export const waitForRepost = (t = 10, text?: string) => {
//   if (t === 0) assert(false, `waitForRepost: Latest post is not a repost. text=${text}`);
//   cy.get('#posts-feed')
//     .find('#timeline')
//     .children()
//     .eq(0)
//     .invoke('text')
//     .then((text) => {
//       if (text.includes('Undo repost')) {
//         cy.log('waitForRepost: Latest post is a repost');
//       } else {
//         cy.log('waitForRepost: Latest post is not a repost; waiting 200ms and checking again');
//         cy.wait(200);
//         waitForRepost(t - 1, text);
//       }
//     });
// };

// // verify that a post in the feed has the expected content, post is located by index
// export const postInFeedContentEq = (postContent: string, idx: number) => {
//   cy.get('#posts-feed')
//     .find('#timeline')
//     .children()
//     .should('have.length.gte', 1)
//     .eq(idx)
//     .within(() => {
//       // This approach is necessary for due to additional space inserted before final word.
//       cy.get('#post-content-text').innerTextShouldEq(postContent);
//     });
// };

// export const latestPostInFeedContentEq = (postContent: string) => {
//   postInFeedContentEq(postContent, 0);
// };

// // check how many images are in a post
// export const checkNumberOfImagesInPost = (expectedNumberOfImages: number, idx: number) => {
//   cy.get('#posts-feed')
//     .find('#timeline')
//     .children()
//     .should('have.length.gte', 1)
//     .eq(idx)
//     .within(() => {
//       cy.get('#post-content-text').find('img').should('have.length', expectedNumberOfImages);
//     });
// };

// export const latestPostHasAnImage = () => {
//   checkNumberOfImagesInPost(1, 0);
// };

// export const latestPostHasImages = (expectedNumberOfImages: number) => {
//   checkNumberOfImagesInPost(expectedNumberOfImages, 0);
// };

// export const createQuickPost = (postContent: string, expectedPostLength?: number) => {
//   cy.get('#quick-post-create-content')
//     .should('be.visible')
//     .within(() => {
//       // input post content within quick post area
//       cy.get('textarea').should('have.value', '').get('textarea').type(postContent);
//       // verify displayed content length
//       cy.log('postContent.length: ', postContent.length);
//       expectedPostLength
//         ? cy.get('#content-length').innerTextShouldEq(`${expectedPostLength} / ${MAX_POST_LENGTH}`)
//         : cy.get('#content-length').innerTextShouldEq(`${postContent.length} / ${MAX_POST_LENGTH}`);
//       // submit
//       cy.get('#post-btn').click();
//     });
// };

// export const createQuickPostWithTags = (postContent: string, tags: string[], expectedPostLength?: number) => {
//   cy.get('#quick-post-create-content').within(() => {
//     cy.get('textarea').should('have.value', '');
//     // type the post
//     cy.get('textarea').type(postContent);

//     // add tags to the post
//     fastTagWhilstCreatingPost(tags);

//     // check displayed content length
//     expectedPostLength
//       ? cy.get('#content-length').innerTextShouldEq(`${expectedPostLength} / ${MAX_POST_LENGTH}`)
//       : cy.get('#content-length').innerTextShouldEq(`${postContent.length} / ${MAX_POST_LENGTH}`);

//     // submit the post
//     cy.get('#post-btn').click();
//   });
// };

// // reply to any post in the feed that contains the filterText by index
// export const replyToPost = ({
//   replyContent,
//   postContent,
//   filterText = '',
//   postIdx = 0,
//   waitForIndexed = CheckIndexed.Yes
// }: {
//   replyContent: string;
//   postContent?: string;
//   filterText?: string;
//   postIdx?: number;
//   waitForIndexed?: CheckIndexed;
// }) => {
//   cy.findPostInFeed(postIdx, filterText, waitForIndexed).within(() => {
//     cy.get('#reply-btn').click();
//   });
//   cy.get('#modal-root')
//     .should('be.visible')
//     .within(($modal) => {
//       cy.get('h1').contains('Reply');
//       // check that the post content is displayed in the reply modal
//       if (postContent) cy.wrap($modal).contains(postContent);
//       cy.get('textarea').should('have.value', '');
//       cy.get('textarea').type(replyContent);
//       cy.get('#reply-btn').click();
//     });
// };

// // repost any post in the feed that contains the filterText by index
// // if no arguments or just repostContent is provided then it reposts the latest post in the feed
// // TODO: default filterText value to filter out the quick post area then can change default index to 0
// export const repostPost = ({
//   repostContent,
//   waitForIndexed,
//   postContent,
//   filterText,
//   postIdx
// }: {
//   repostContent?: string;
//   waitForIndexed?: CheckIndexed;
//   postContent?: string;
//   filterText?: string;
//   postIdx?: number;
// }) => {
//   cy.findPostInFeed(postIdx, filterText, waitForIndexed).within(() => {
//     cy.get('#repost-btn').click();
//   });
//   cy.get('#modal-root')
//     .should('be.visible')
//     .within(($modal) => {
//       cy.get('h1').contains('Repost');
//       // optionally check that the post content is displayed in the repost modal
//       if (postContent) cy.wrap($modal).contains(postContent);
//       cy.get('textarea').should('have.value', '');
//       if (repostContent) cy.get('textarea').type(repostContent);
//       cy.get('#repost-btn').click();
//     });
// };

// // find a post first and use within it. Useful for fast tagging posts not in the feed.
// export const fastTagPost = (tags: string[]) => {
//   tags.forEach((tag) => {
//     cy.get('#show-add-tag-input-btn').click();
//     cy.get('input').type(tag);
//     cy.get('#add-tag-btn').click();
//   });
// };

// // tag whilst creating post
// export const fastTagWhilstCreatingPost = (tags: string[]) => {
//   // add the tags
//   cy.get('#add-tag-container').within(() => {
//     cy.get('#show-add-tag-input-btn').click();
//     tags.forEach((tag) => {
//       cy.get('input').type(tag);
//       cy.get('#add-tag-btn').click();
//     });
//   });
//   // verify the tags are displayed in the quick post area
//   cy.get('#tags').children().should('have.length', tags.length);
//   tags.forEach((tag, idx) => {
//     cy.get('#tags').children().eq(idx).contains(tag);
//   });
// };

// // tag a post in feed with any number of tags
// export const fastTagPostInFeed = (tags: string[], postContent: string) => {
//   cy.findFirstPostInFeedFiltered(postContent).within(() => {
//     cy.get('#tags').within(() => {
//       fastTagPost(tags);
//     });
//   });
// };

// // menuBtnIdx: 0 for original post, 1 for reply
// export const editPost = ({
//   newPostContent,
//   filterText = '',
//   postIdx = 0,
//   menuBtnIdx = 0
// }: {
//   newPostContent: string;
//   filterText?: string;
//   postIdx?: number;
//   menuBtnIdx?: number;
// }) => {
//   // find post and click menu button
//   cy.findPostInFeed(postIdx, filterText).within(() => {
//     // '[id="menu-btn"]' finds all with id
//     cy.get('[id="menu-btn"]').eq(menuBtnIdx).should('be.visible').click();
//     cy.get('#post-tooltip-menu')
//       .should('be.visible')
//       .within(() => {
//         cy.get('#edit-post').should('be.visible').innerTextShouldEq('Edit post').get('#edit-post').click();
//       });
//   });

//   // input edited post content in modal and submit
//   cy.get('#modal-root')
//     .should('be.visible')
//     .within(() => {
//       cy.get('h1').contains('Edit Post');
//       cy.get('textarea').clear().type(newPostContent);
//       cy.get('#post-btn').click();
//     });
// };

// // menuBtnIdx: 0 for original post, 1 for reply
// export const deletePost = ({
//   filterText = '',
//   postIdx = 0,
//   menuBtnIdx = 0
// }: {
//   filterText?: string;
//   postIdx?: number;
//   menuBtnIdx?: number;
// }) => {
//   // find post and click menu button
//   cy.findPostInFeed(postIdx, filterText).within(() => {
//     // '[id="menu-btn"]' finds all with id
//     cy.get('[id="menu-btn"]').eq(menuBtnIdx).should('be.visible').click();
//     cy.get('#post-tooltip-menu')
//       .should('be.visible')
//       .within(() => {
//         cy.get('#delete-post').should('be.visible').innerTextShouldEq('Delete post').get('#delete-post').click();
//       });
//   });

  // confirm delete in modal
//   cy.get('#modal-root')
//     .should('be.visible')
//     .within(() => {
//       cy.get('h1').contains('Delete Post');
//       cy.get('#delete-post-btn').click();
//     });
// };

// reloads the page until the post is no longer displayed in the feed
const waitForPostToBeDeleted = (postContent: string, attempts: number = 5, firstCheck: boolean = true) => {
  if (attempts <= 0) assert(false, 'Post still exists with content: ' + postContent);

  cy.get('#posts-feed')
    .find('#timeline')
    .invoke('text')
    .then((text) => {
      // handle whitespace consistently
      const normalisedText = text.replace(/\s+/g, ' ').trim();
      if (normalisedText.includes(postContent)) {
        firstCheck ? cy.wait(200) : cy.wait(1000);
        cy.reload();
        waitForPostToBeDeleted(postContent, attempts - 1, false);
      }
    });
};

export const checkPostIsNotAtTopOfFeed = ({
  postContent,
  refreshIfPostExists = false
}: {
  postContent: string;
  refreshIfPostExists?: boolean;
}) => {
  if (refreshIfPostExists) waitForPostToBeDeleted(postContent);
  cy.get('#posts-feed')
    .find('#timeline')
    .children()
    .its('length')
    .then((length) => {
      // if at least 1 post still exists, check it doesn't match the text of the deleted post
      if (length > 0) {
        cy.get('#posts-feed')
          .find('#timeline')
          .children()
          .should('have.length.gte', 1)
          .eq(0)
          .within(() => {
            cy.get('#post-content-text').innerTextShouldNotEq(postContent);
          });
      }
    });
};

// export const checkPostIsAtIndexInFeed = (postContent: string, index: number) => {
//   cy.get('#posts-feed')
//     .find('#timeline')
//     .children()
//     .should('have.length.gte', 1)
//     .eq(index)
//     .within(() => {
//       cy.get('#post-content-text').innerTextShouldEq(postContent);
//     });
// };

// TODO: revert to above implementation so we don't miss bugs with "Show n new posts" button appearing when bug is fixed, see https://github.com/pubky/pubky-app/issues/1393
export const checkPostIsAtIndexInFeed = (postContent: string, index: number) => {
  cy.get('#posts-feed')
    .find('#timeline')
    .should('have.descendants', '*')
    .children()
    .then(($posts) => {
      // Filter out "Show new posts" element
      const actualPosts = $posts.filter((_, el) => {
        const text = Cypress.$(el).text();
        // Match "Show n new posts" pattern where n is a number
        return !/Show\s+\d+\s+new posts/i.test(text);
      });

      // Use the filtered collection to get the correct post
      cy.wrap(actualPosts)
        .eq(index)
        .within(() => {
          cy.get('#post-content-text').innerTextShouldEq(postContent);
        });
    });
};

// wait for feed timeline to not show placeholder text, optionally wait for specific post content to be displayed
export const waitForFeedToLoad = (postContent?: string) => {
  const checkTimelineRecursively = (attempts: number, firstCheck: boolean = true) => {
    if (attempts <= 0)
      assert(
        false,
        "Timeline still shows 'Welcome to your feed', 'Loading' after 5 seconds, or 'Checking for new content'"
      );

    cy.get('#posts-feed')
      .find('#timeline')
      .invoke('text')
      .then((text) => {
        // handle whitespace consistently
        const normalisedText = text.replace(/\s+/g, ' ').trim();
        if (normalisedText.includes('Loading') || normalisedText.includes('Checking for new content')) {
          firstCheck ? cy.wait(200) : cy.wait(1000);
          checkTimelineRecursively(attempts - 1, false);
        }
      });
  };

  const checkExistingPostContentRecursively = (postContent: string, attempts: number, firstCheck: boolean = true) => {
    if (attempts <= 0) assert(false, "Timeline doesn't contain expected post with text: " + postContent);

    cy.get('#posts-feed')
      .find('#timeline')
      .invoke('text')
      .then((text) => {
        // trim whitespace and normalise spaces to compare
        const normalisedText = text.replace(/\s+/g, ' ').trim();

        if (!normalisedText.includes(postContent)) {
          firstCheck ? cy.wait(200) : cy.wait(1000);
          checkExistingPostContentRecursively(postContent, attempts - 1, false);
        }
      });
  };

  checkTimelineRecursively(10);
  // optionally check for specific post content (useful for waiting on new post after sign in)
  if (postContent) checkExistingPostContentRecursively(postContent, 10);
};

// wait for bookmarks to not show "Save posts for later" or "Loading"
export const waitForBookmarksToLoad = (seconds: number = 6) => {
  const checkBookmarksRecursively = (attempts: number, firstCheck: boolean = true) => {
    if (attempts <= 0) assert(false, "Bookmarks still show 'Save posts for later' or 'Loading' after 5 seconds");

    cy.get('#bookmarked-posts')
      .invoke('text')
      .then((text) => {
        if (text.includes('Save posts for later') || text.includes('Loading')) {
          firstCheck ? cy.wait(200) : cy.wait(1000);
          checkBookmarksRecursively(attempts - 1, false);
        }
      });
  };
  checkBookmarksRecursively(seconds);
};

// wait for 'show n new posts' button to be visible
// check its counter displayes the correct number of new posts and click it
export const clickShowNewPostsBtn = () => {
  // TODO: uncomment original code once 'show n new posts' button is showing again after creating a new post
  // cy.get('#show-new-posts-button', { timeout: Cypress.env('ci') ? 60_000 : 15_000 })
  //   .scrollIntoView()
  //   .should('be.visible')
  //   .should('contain.text', ` ${expectedCounter} `)
  //   .click();

  // meanwhile, just refresh the page to show new posts
  cy.wait(3_000);
  cy.reload();
  waitForFeedToLoad();
};

const findAndCountPostsInFeed = (filterText: string, expectedCount: number) => {
  cy.get('#posts-feed')
    .find('#timeline')
    .children()
    .then(($posts) => {
      // Filter posts by text and assert none are found
      const matchingPosts = $posts.filter((_idx, element) => element.innerText.includes(filterText));

      // Assert that the correct number of posts are found with the provided text
      expect(matchingPosts).to.have.length(expectedCount);
    });
};

export const cannotFindPostInFeed = (filterText: string) => {
  findAndCountPostsInFeed(filterText, 0);
};

export const countPostsInFeed = (filterText: string, expectedCount: number) => {
  findAndCountPostsInFeed(filterText, expectedCount);
};

// can be used in post or article creation
export const addImage = () => {
  // upload image
  cy.get('#media-upload-btn').within(() => {
    const imagePath = Cypress.config('fixturesFolder') + '/mustache-you.png';
    cy.get('#fileInput').selectFile(
      imagePath,
      { force: true } // force to bypass visibility check of hidden input field
    );
  });
};
