/**
 * Tag support functions for E2E tests
 */

/**
 * Click the add tag button to show the input field
 * Must be used within a post context
 */
export const clickAddTagButton = () => {
  cy.get('[data-cy="post-tag-add-button"]').should('be.visible').click();
};

/**
 * Add a tag to a post by typing in the input and pressing Enter
 * Must be used within a post context where the input is visible
 * @param tag - The tag label to add
 */
export const addTagToPost = (tag: string) => {
  cy.get('[data-cy="post-tag-input-field"]').should('be.visible').type(`${tag}{enter}`);
};

/**
 * Click the add button and add a tag in one step
 * Must be used within a post context
 * @param tag - The tag label to add
 */
export const clickAndAddTag = (tag: string) => {
  clickAddTagButton();
  addTagToPost(tag);
};

/**
 * Get a tag element by its label
 * @param label - The tag label to find
 * @returns Cypress chainable for the tag element
 */
export const getTag = (label: string) => {
  return cy.get(`[data-cy="post-tag"][data-tag-label="${label}"]`);
};

/**
 * Get the count displayed on a tag
 * @param label - The tag label
 * @returns Cypress chainable that yields the count as a number
 */
export const getTagCount = (label: string) => {
  return getTag(label)
    .find('[data-cy="post-tag-count"]')
    .invoke('text')
    .then((text) => parseInt(text, 10));
};

/**
 * Click a tag to toggle it (add or remove current user as tagger)
 * @param label - The tag label to toggle
 */
export const toggleTag = (label: string) => {
  getTag(label).click();
};

/**
 * Assert that a tag exists with a specific count
 * @param label - The tag label
 * @param count - Expected count value
 */
export const assertTagHasCount = (label: string, count: number) => {
  getTag(label).find('[data-cy="post-tag-count"]').should('have.text', String(count));
};

/**
 * Assert that a tag is selected (current user is a tagger)
 * @param label - The tag label
 */
export const assertTagIsSelected = (label: string) => {
  getTag(label).should('have.attr', 'data-state', 'on');
};

/**
 * Assert that a tag is not selected (current user is not a tagger)
 * @param label - The tag label
 */
export const assertTagIsNotSelected = (label: string) => {
  getTag(label).should('have.attr', 'data-state', 'off');
};

/**
 * Wait for a tag to appear with a specific count (with retries)
 * @param label - The tag label
 * @param count - Expected count value
 * @param attempts - Number of retry attempts (default 10)
 */
export const waitForTagWithCount = (label: string, count: number, attempts = 10) => {
  const checkTag = (remaining: number): void => {
    if (remaining <= 0) {
      throw new Error(`Tag "${label}" did not reach count ${count} after multiple attempts`);
    }

    cy.get('body').then(($body) => {
      const tagSelector = `[data-cy="post-tag"][data-tag-label="${label}"]`;
      const $tag = $body.find(tagSelector);

      if ($tag.length === 0) {
        cy.wait(500);
        checkTag(remaining - 1);
        return;
      }

      const $count = $tag.find('[data-cy="post-tag-count"]');
      const currentCount = parseInt($count.text(), 10);

      if (currentCount !== count) {
        cy.wait(500);
        checkTag(remaining - 1);
      }
    });
  };

  checkTag(attempts);
};

/**
 * Find a post in the feed by its content and perform actions within it
 * @param postContent - Text content to find in the post
 * @returns Cypress chainable for the post element
 */
export const findPostByContent = (postContent: string) => {
  return cy
    .get('[data-cy="timeline-posts"]')
    .children()
    .filter((_idx, element) => element.innerText.includes(postContent))
    .first();
};
