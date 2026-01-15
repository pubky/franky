import * as Libs from '@/libs';

/**
 * Copyright input validators
 *
 * Validates and normalizes copyright/DMCA takedown request form inputs.
 * Follows the same pattern as ReportValidators.
 */
export class CopyrightValidators {
  private constructor() {}

  /**
   * Validates email format
   *
   * @param email - Email address to validate
   * @returns Normalized email (trimmed, lowercase)
   * @throws AppError if email is invalid
   */
  private static validateEmailFormat(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'Please enter a valid email address', 400);
    }
    return email.toLowerCase().trim();
  }

  /**
   * Validates and normalizes a required string field.
   *
   * @param value - Field value to validate
   * @param fieldName - Name of the field (for error messages)
   * @returns Normalized value (trimmed)
   * @throws AppError if value is invalid
   */
  private static validateRequiredString(value: string | undefined | null, fieldName: string): string {
    if (!value || value.trim() === '') {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, `${fieldName} is required`, 400);
    }
    return value.trim();
  }

  /**
   * Validates a newline-delimited list of URLs
   *
   * @param value - Raw string containing URLs
   * @returns Normalized value (trimmed)
   * @throws AppError if any URL is invalid
   */
  private static validateUrlList(value: string | undefined | null, fieldName: string): string {
    const trimmed = this.validateRequiredString(value, fieldName);
    const lines = trimmed.split('\n').filter((line) => line.trim());
    const allValid = lines.every((line) => {
      try {
        new URL(line.trim());
        return true;
      } catch {
        return false;
      }
    });

    if (!allValid) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'Please enter valid URLs (one per line)', 400);
    }

    return trimmed;
  }

  /**
   * Validates phone number format
   *
   * @param phoneNumber - Phone number to validate
   * @returns Normalized phone number (trimmed)
   * @throws AppError if phone number is invalid
   */
  private static validatePhoneNumberFormat(phoneNumber: string): string {
    const phoneRegex = /^[\d\s\-+().,#*ext]+$/i;
    if (!phoneRegex.test(phoneNumber)) {
      throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, 'Please enter a valid phone number', 400);
    }
    return phoneNumber.trim();
  }

  /**
   * Validates name of rights owner
   */
  static validateNameOwner(nameOwner: string | undefined | null): string {
    return this.validateRequiredString(nameOwner, 'Name of rights owner');
  }

  /**
   * Validates original content URLs
   */
  static validateOriginalContentUrls(originalContentUrls: string | undefined | null): string {
    return this.validateRequiredString(originalContentUrls, 'Original content URLs');
  }

  /**
   * Validates brief description
   */
  static validateBriefDescription(briefDescription: string | undefined | null): string {
    return this.validateRequiredString(briefDescription, 'Brief description');
  }

  /**
   * Validates infringing content URL
   */
  static validateInfringingContentUrl(infringingContentUrl: string | undefined | null): string {
    return this.validateUrlList(infringingContentUrl, 'Infringing content URL');
  }

  /**
   * Validates first name
   */
  static validateFirstName(firstName: string | undefined | null): string {
    return this.validateRequiredString(firstName, 'First name');
  }

  /**
   * Validates last name
   */
  static validateLastName(lastName: string | undefined | null): string {
    return this.validateRequiredString(lastName, 'Last name');
  }

  /**
   * Validates email address
   */
  static validateEmail(email: string | undefined | null): string {
    const trimmed = this.validateRequiredString(email, 'Email');
    return this.validateEmailFormat(trimmed);
  }

  /**
   * Validates phone number
   */
  static validatePhoneNumber(phoneNumber: string | undefined | null): string {
    const trimmed = this.validateRequiredString(phoneNumber, 'Phone number');
    return this.validatePhoneNumberFormat(trimmed);
  }

  /**
   * Validates street address
   */
  static validateStreetAddress(streetAddress: string | undefined | null): string {
    return this.validateRequiredString(streetAddress, 'Street address');
  }

  /**
   * Validates country
   */
  static validateCountry(country: string | undefined | null): string {
    return this.validateRequiredString(country, 'Country');
  }

  /**
   * Validates city
   */
  static validateCity(city: string | undefined | null): string {
    return this.validateRequiredString(city, 'City');
  }

  /**
   * Validates state/province
   */
  static validateStateProvince(stateProvince: string | undefined | null): string {
    return this.validateRequiredString(stateProvince, 'State/Province');
  }

  /**
   * Validates zip code
   */
  static validateZipCode(zipCode: string | undefined | null): string {
    return this.validateRequiredString(zipCode, 'Zip code');
  }

  /**
   * Validates signature
   */
  static validateSignature(signature: string | undefined | null): string {
    return this.validateRequiredString(signature, 'Signature');
  }

  /**
   * Validates that at least one role checkbox is selected
   */
  static validateRole(
    isRightsOwner: boolean | undefined | null,
    isReportingOnBehalf: boolean | undefined | null,
  ): void {
    if (!isRightsOwner && !isReportingOnBehalf) {
      throw Libs.createCommonError(
        Libs.CommonErrorType.INVALID_INPUT,
        'Please select if you are the rights owner or reporting on behalf',
        400,
      );
    }
  }
}
