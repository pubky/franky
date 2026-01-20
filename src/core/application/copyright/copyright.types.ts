/**
 * Copyright submission types
 *
 * Types for copyright/DMCA takedown request submissions.
 */

export interface TCopyrightSubmitInput {
  /** Name of the rights owner */
  nameOwner: string;
  /** URLs of original content */
  originalContentUrls: string;
  /** Brief description of original content */
  briefDescription: string;
  /** URL of infringing content */
  infringingContentUrl: string;
  /** Reporter's first name */
  firstName: string;
  /** Reporter's last name */
  lastName: string;
  /** Reporter's email address */
  email: string;
  /** Reporter's phone number */
  phoneNumber: string;
  /** Reporter's street address */
  streetAddress: string;
  /** Reporter's country */
  country: string;
  /** Reporter's city */
  city: string;
  /** Reporter's state/province */
  stateProvince: string;
  /** Reporter's zip code */
  zipCode: string;
  /** Signature (full name) */
  signature: string;
  /** Whether reporter is the rights owner */
  isRightsOwner: boolean;
  /** Whether reporter is reporting on behalf of organization/client */
  isReportingOnBehalf: boolean;
}
