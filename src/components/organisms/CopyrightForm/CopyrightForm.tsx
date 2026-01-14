'use client';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

const LABEL_CLASSES = 'text-xs font-medium tracking-wide text-muted-foreground uppercase';

/**
 * Copyright/DMCA takedown request form component
 *
 * Comprehensive form for submitting copyright infringement claims.
 * Matches Pubky's implementation with all required DMCA fields.
 */
export function CopyrightForm() {
  const { state, handlers, helpers } = Hooks.useCopyrightForm();
  const { getStatus, getMessageType, currentDate } = helpers;

  return (
    <Atoms.Container className="w-full">
      <Atoms.Card className="rounded-t-lg rounded-b-none border border-border p-8 md:p-12">
        <Atoms.Container className="w-full gap-6">
          <Atoms.Typography as="h1" size="lg" className="font-bold">
            Copyright Removal Request
          </Atoms.Typography>

          <Atoms.Typography size="sm" className="text-muted-foreground">
            Date: {currentDate}
          </Atoms.Typography>

          <Atoms.Typography size="sm" className="text-muted-foreground">
            Synonym Software, S.A. de C.V. (&quot;Synonym&quot;)
            <br />
            87 avenida norte, calle El Mirador, edificio Torre Futura, oficina 06, nivel 11, colonia Escalón, del
            municipio de San Salvador, departamento de San Salvador. Código postal 01101, República de El Salvador.
          </Atoms.Typography>

          <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

          <Atoms.Container className="w-full rounded-lg bg-muted p-4">
            <Atoms.Typography size="sm" className="text-muted-foreground">
              Dear Synonym:
            </Atoms.Typography>
            <Atoms.Typography size="sm" className="text-muted-foreground">
              We write on behalf of:
            </Atoms.Typography>
          </Atoms.Container>

          <Atoms.Typography size="md" className="font-semibold">
            Rights Owner Information
          </Atoms.Typography>

          <Atoms.Container className="w-full flex-col gap-4 xl:flex-row xl:justify-between">
            <Atoms.Checkbox
              checked={state.isRightsOwner}
              onCheckedChange={handlers.handleRightsOwnerChange}
              label="I am the rights owner"
            />
            <Atoms.Checkbox
              checked={state.isReportingOnBehalf}
              onCheckedChange={handlers.handleReportingOnBehalfChange}
              label="I am reporting on behalf of my organization or client"
            />
          </Atoms.Container>

          {state.errors.role && (
            <Atoms.Typography size="sm" className="text-destructive" role="alert">
              {state.errors.role}
            </Atoms.Typography>
          )}

          <Atoms.Container className="gap-2">
            <Atoms.Label htmlFor="nameOwner" className={LABEL_CLASSES}>
              Name of the rights owner{' '}
              <span className="text-xs normal-case">(This may be your full name or the name of the organization)</span>
            </Atoms.Label>
            <Molecules.InputField
              id="nameOwner"
              value={state.nameOwner}
              maxLength={50}
              onChange={(e) => handlers.setNameOwner(e.target.value)}
              placeholder="Name of the rights owner"
              variant="dashed"
              size="lg"
              status={getStatus('nameOwner')}
              message={state.errors.nameOwner}
              messageType={getMessageType('nameOwner')}
            />
          </Atoms.Container>

          <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

          <Atoms.Container className="w-full rounded-lg bg-muted p-4">
            <Atoms.Typography size="sm" className="text-muted-foreground">
              We hereby provide notice of copyright infringements pursuant to the terms of the Digital Millennium
              Copyright Act (the &quot;Act&quot;) and the Pubky Terms and Conditions. Copyright Owner is the owner of
              the copyrights in the following work(s) (collectively, the &quot;Work(s)&quot;):
            </Atoms.Typography>
          </Atoms.Container>

          <Atoms.Container className="w-full flex-col gap-8 xl:flex-row xl:justify-between">
            <Atoms.Container className="w-full gap-2">
              <Atoms.Label htmlFor="originalContentUrls" className={LABEL_CLASSES}>
                Original Content URLs
              </Atoms.Label>
              <Molecules.TextareaField
                id="originalContentUrls"
                value={state.originalContentUrls}
                onChange={(e) => handlers.setOriginalContentUrls(e.target.value)}
                placeholder="Enter URLs of your original content"
                variant="dashed"
                rows={4}
                status={getStatus('originalContentUrls')}
                message={state.errors.originalContentUrls}
                messageType={getMessageType('originalContentUrls')}
              />
            </Atoms.Container>

            <Atoms.Container className="w-full gap-2">
              <Atoms.Label htmlFor="briefDescription" className={LABEL_CLASSES}>
                Brief description of your original content
              </Atoms.Label>
              <Molecules.TextareaField
                id="briefDescription"
                value={state.briefDescription}
                onChange={(e) => handlers.setBriefDescription(e.target.value)}
                placeholder="Describe your original content"
                variant="dashed"
                rows={4}
                status={getStatus('briefDescription')}
                message={state.errors.briefDescription}
                messageType={getMessageType('briefDescription')}
              />
            </Atoms.Container>
          </Atoms.Container>

          <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

          <Atoms.Container className="w-full rounded-lg bg-muted p-4">
            <Atoms.Typography size="sm" className="text-muted-foreground">
              It has come to Copyright Owner&apos;s attention that your platform (the &quot;Platform&quot;) displays,
              provides access to or caches materials that infringe Copyright Owner&apos;s copyrights in the Work(s). The
              following is a list of the infringing material(s) and the URL(s), if applicable, at which the infringing
              material(s) are accessible on the Platform:
            </Atoms.Typography>
          </Atoms.Container>

          <Atoms.Typography size="md" className="font-semibold">
            Infringing work details
          </Atoms.Typography>

          <Atoms.Container className="gap-2">
            <Atoms.Label htmlFor="infringingContentUrl" className={LABEL_CLASSES}>
              Infringing Content URLs
            </Atoms.Label>
            <Molecules.TextareaField
              id="infringingContentUrl"
              value={state.infringingContentUrl}
              onChange={(e) => handlers.setInfringingContentUrl(e.target.value)}
              placeholder="Enter URLs of infringing content"
              variant="dashed"
              rows={4}
              status={getStatus('infringingContentUrl')}
              message={state.errors.infringingContentUrl}
              messageType={getMessageType('infringingContentUrl')}
            />
          </Atoms.Container>

          <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

          <Atoms.Container className="w-full rounded-lg bg-muted p-4">
            <Atoms.Typography size="sm" className="text-muted-foreground">
              We have a good faith belief that the use of the Works described in this letter are not authorized by
              Copyright Owner, any agent of Copyright Owner or any applicable law. The information in this notification
              is accurate. We swear under penalty of perjury that we are authorized to act on behalf of Copyright Owner
              with respect to the subject matter of this letter.
              <br />
              <br />
              We therefore request that you remove or disable access to the infringing materials as set forth in Section
              512(c)(1)(C), Section 512(d)(3) and/or Section 512(b)(2)(E) of the Act, as applicable, and pursuant to the
              Pubky Terms and Conditions. Please contact the undersigned no later than one week from the date of this
              copyright removal request to confirm that the infringing materials have been removed or access disabled.
              The undersigned may be contacted at the telephone number, address and email address set forth below, as
              follows:
            </Atoms.Typography>
          </Atoms.Container>

          <Atoms.Typography size="md" className="font-semibold">
            Contact Information
          </Atoms.Typography>

          <Atoms.Container className="w-full flex-col gap-8 xl:flex-row xl:justify-between">
            <Atoms.Container className="w-full gap-2">
              <Atoms.Label htmlFor="firstName" className={LABEL_CLASSES}>
                First Name
              </Atoms.Label>
              <Molecules.InputField
                id="firstName"
                value={state.firstName}
                maxLength={30}
                onChange={(e) => handlers.setFirstName(e.target.value)}
                placeholder="Satoshi"
                variant="dashed"
                size="lg"
                status={getStatus('firstName')}
                message={state.errors.firstName}
                messageType={getMessageType('firstName')}
              />
            </Atoms.Container>

            <Atoms.Container className="w-full gap-2">
              <Atoms.Label htmlFor="lastName" className={LABEL_CLASSES}>
                Last Name
              </Atoms.Label>
              <Molecules.InputField
                id="lastName"
                value={state.lastName}
                maxLength={30}
                onChange={(e) => handlers.setLastName(e.target.value)}
                placeholder="Nakamoto"
                variant="dashed"
                size="lg"
                status={getStatus('lastName')}
                message={state.errors.lastName}
                messageType={getMessageType('lastName')}
              />
            </Atoms.Container>
          </Atoms.Container>

          <Atoms.Container className="w-full flex-col gap-8 xl:flex-row xl:justify-between">
            <Atoms.Container className="w-full gap-2">
              <Atoms.Label htmlFor="email" className={LABEL_CLASSES}>
                Email
              </Atoms.Label>
              <Molecules.InputField
                id="email"
                value={state.email}
                maxLength={100}
                onChange={(e) => handlers.setEmail(e.target.value)}
                placeholder="email@example.com"
                variant="dashed"
                size="lg"
                status={getStatus('email')}
                message={state.errors.email}
                messageType={getMessageType('email')}
              />
            </Atoms.Container>

            <Atoms.Container className="w-full gap-2">
              <Atoms.Label htmlFor="phoneNumber" className={LABEL_CLASSES}>
                Phone number
              </Atoms.Label>
              <Molecules.InputField
                id="phoneNumber"
                value={state.phoneNumber}
                maxLength={30}
                onChange={(e) => handlers.setPhoneNumber(e.target.value)}
                placeholder="000-000-0000"
                variant="dashed"
                size="lg"
                status={getStatus('phoneNumber')}
                message={state.errors.phoneNumber}
                messageType={getMessageType('phoneNumber')}
              />
            </Atoms.Container>
          </Atoms.Container>

          <Atoms.Typography size="md" className="font-semibold">
            Address
          </Atoms.Typography>

          <Atoms.Container className="w-full flex-col gap-8 xl:flex-row xl:justify-between">
            <Atoms.Container className="w-full gap-2">
              <Atoms.Label htmlFor="streetAddress" className={LABEL_CLASSES}>
                Street address
              </Atoms.Label>
              <Molecules.InputField
                id="streetAddress"
                value={state.streetAddress}
                maxLength={100}
                onChange={(e) => handlers.setStreetAddress(e.target.value)}
                placeholder="Street number and name"
                variant="dashed"
                size="lg"
                status={getStatus('streetAddress')}
                message={state.errors.streetAddress}
                messageType={getMessageType('streetAddress')}
              />
            </Atoms.Container>

            <Atoms.Container className="w-full gap-2">
              <Atoms.Label htmlFor="country" className={LABEL_CLASSES}>
                Country
              </Atoms.Label>
              <Molecules.InputField
                id="country"
                value={state.country}
                maxLength={50}
                onChange={(e) => handlers.setCountry(e.target.value)}
                placeholder="United States"
                variant="dashed"
                size="lg"
                status={getStatus('country')}
                message={state.errors.country}
                messageType={getMessageType('country')}
              />
            </Atoms.Container>
          </Atoms.Container>

          <Atoms.Container className="w-full flex-col gap-8 xl:flex-row xl:justify-between">
            <Atoms.Container className="w-full gap-2">
              <Atoms.Label htmlFor="city" className={LABEL_CLASSES}>
                City
              </Atoms.Label>
              <Molecules.InputField
                id="city"
                value={state.city}
                maxLength={50}
                onChange={(e) => handlers.setCity(e.target.value)}
                placeholder="City name"
                variant="dashed"
                size="lg"
                status={getStatus('city')}
                message={state.errors.city}
                messageType={getMessageType('city')}
              />
            </Atoms.Container>

            <Atoms.Container className="w-full gap-2">
              <Atoms.Label htmlFor="stateProvince" className={LABEL_CLASSES}>
                State/Province
              </Atoms.Label>
              <Molecules.InputField
                id="stateProvince"
                value={state.stateProvince}
                maxLength={50}
                onChange={(e) => handlers.setStateProvince(e.target.value)}
                placeholder="State name"
                variant="dashed"
                size="lg"
                status={getStatus('stateProvince')}
                message={state.errors.stateProvince}
                messageType={getMessageType('stateProvince')}
              />
            </Atoms.Container>
          </Atoms.Container>

          <Atoms.Container className="w-full gap-2">
            <Atoms.Label htmlFor="zipCode" className={LABEL_CLASSES}>
              Zip code
            </Atoms.Label>
            <Molecules.InputField
              id="zipCode"
              value={state.zipCode}
              maxLength={20}
              onChange={(e) => handlers.setZipCode(e.target.value)}
              placeholder="000000"
              variant="dashed"
              size="lg"
              status={getStatus('zipCode')}
              message={state.errors.zipCode}
              messageType={getMessageType('zipCode')}
            />
          </Atoms.Container>

          <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

          <Atoms.Typography as="h2" size="md" className="font-semibold">
            Signature
          </Atoms.Typography>

          <Atoms.Container className="w-full gap-2">
            <Atoms.Label htmlFor="signature" className={LABEL_CLASSES}>
              Full Name as Signature
            </Atoms.Label>
            <Molecules.InputField
              id="signature"
              value={state.signature}
              maxLength={100}
              onChange={(e) => handlers.setSignature(e.target.value)}
              placeholder="Full name"
              variant="dashed"
              size="lg"
              status={getStatus('signature')}
              message={state.errors.signature}
              messageType={getMessageType('signature')}
            />
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Card>

      <Atoms.Card className="w-full rounded-t-none rounded-b-lg border border-t-0 border-border p-8">
        <Atoms.Container className="w-full flex-row justify-end">
          <Atoms.Button
            disabled={state.loading}
            onClick={handlers.handleSubmit}
            size="lg"
            className="w-auto"
            aria-label={state.loading ? 'Submitting form' : 'Submit form'}
          >
            {state.loading ? (
              <>
                <Libs.Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </Atoms.Button>
        </Atoms.Container>
      </Atoms.Card>
    </Atoms.Container>
  );
}
