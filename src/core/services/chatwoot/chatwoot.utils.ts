import * as Libs from '@/libs';
import type { TChatwootContact } from './chatwoot.types';

/**
 * Email domain for Chatwoot contacts
 */
export const CHATWOOT_EMAIL_DOMAIN = 'pubky.app';

/**
 * Build email address from pubky for Chatwoot contact
 *
 * @param pubky - User's public key
 * @returns Email address in format pubky@pubky.app
 */
export function buildChatwootEmail(pubky: string): string {
  return `${pubky}@${CHATWOOT_EMAIL_DOMAIN}`;
}

/**
 * Extract source ID from contact, validating inbox associations exist
 *
 * Validates that the contact has at least one inbox association and
 * returns the source ID from the first inbox.
 *
 * @param contact - Chatwoot contact object
 * @param email - Email used for error context
 * @returns Source ID from the first inbox association
 * @throws AppError if contact has no inbox associations
 */
export function extractSourceId(contact: TChatwootContact, email: string): string {
  if (!contact.contact_inboxes || contact.contact_inboxes.length === 0) {
    throw Libs.createCommonError(Libs.CommonErrorType.UNEXPECTED_ERROR, 'Contact has no inbox associations', 500, {
      contactId: contact.id,
      email,
    });
  }
  return contact.contact_inboxes[0].source_id;
}
