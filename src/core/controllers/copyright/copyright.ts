import * as Core from '@/core';
import * as Types from './copyright.types';

/**
 * Controller for copyright/DMCA takedown request submission.
 * Entry point for the copyright feature, called from the API route.
 */
export class CopyrightController {
  private constructor() {}

  /**
   * Submit a copyright/DMCA takedown request to Chatwoot.
   *
   * Validates all inputs via pipes layer before delegating to application.
   *
   * @param params - Copyright form data
   * @throws AppError if validation fails or submission fails
   */
  static async submit(params: Types.TCopyrightSubmitParams): Promise<void> {
    // Validate and normalize inputs using pipes layer
    const nameOwner = Core.CopyrightValidators.validateNameOwner(params.nameOwner);
    const originalContentUrls = Core.CopyrightValidators.validateOriginalContentUrls(params.originalContentUrls);
    const briefDescription = Core.CopyrightValidators.validateBriefDescription(params.briefDescription);
    const infringingContentUrl = Core.CopyrightValidators.validateInfringingContentUrl(params.infringingContentUrl);
    const firstName = Core.CopyrightValidators.validateFirstName(params.firstName);
    const lastName = Core.CopyrightValidators.validateLastName(params.lastName);
    const email = Core.CopyrightValidators.validateEmail(params.email);
    const phoneNumber = Core.CopyrightValidators.validatePhoneNumber(params.phoneNumber);
    const streetAddress = Core.CopyrightValidators.validateStreetAddress(params.streetAddress);
    const country = Core.CopyrightValidators.validateCountry(params.country);
    const city = Core.CopyrightValidators.validateCity(params.city);
    const stateProvince = Core.CopyrightValidators.validateStateProvince(params.stateProvince);
    const zipCode = Core.CopyrightValidators.validateZipCode(params.zipCode);
    const signature = Core.CopyrightValidators.validateSignature(params.signature);

    // Validate role selection
    Core.CopyrightValidators.validateRole(params.isRightsOwner, params.isReportingOnBehalf);

    // Delegate to application layer
    await Core.CopyrightApplication.submit({
      nameOwner,
      originalContentUrls,
      briefDescription,
      infringingContentUrl,
      firstName,
      lastName,
      email,
      phoneNumber,
      streetAddress,
      country,
      city,
      stateProvince,
      zipCode,
      signature,
      isRightsOwner: params.isRightsOwner ?? false,
      isReportingOnBehalf: params.isReportingOnBehalf ?? false,
    });
  }
}
