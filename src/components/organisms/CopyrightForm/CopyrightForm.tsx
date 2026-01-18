'use client';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import { COPYRIGHT_FORM_FIELDS, type CopyrightFormData } from '@/hooks';

export function CopyrightForm() {
  const { form, onSubmit, handleRoleChange } = Hooks.useCopyrightForm();
  const { isSubmitting, errors } = form.formState;
  const roleError = errors.isRightsOwner?.message;
  const currentDate = Libs.formatUSDate();

  return (
    <Atoms.Container>
      <form onSubmit={onSubmit}>
        <Atoms.Card className="rounded-t-lg rounded-b-none border border-border p-8 md:p-12">
          <Atoms.Container className="gap-6">
            <Atoms.Typography as="h1" size="lg">
              Copyright Removal Request
            </Atoms.Typography>

            <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
              Date: {currentDate}
            </Atoms.Typography>

            <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
              Synonym Software, S.A. de C.V. (&quot;Synonym&quot;)
              <br />
              87 avenida norte, calle El Mirador, edificio Torre Futura, oficina 06, nivel 11, colonia Escalón, del
              municipio de San Salvador, departamento de San Salvador. Código postal 01101, República de El Salvador.
            </Atoms.Typography>

            <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

            <Atoms.Container className="gap-6 rounded-lg bg-muted p-4">
              <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
                Dear Synonym:
                <br />
                <br />
                We write on behalf of:
              </Atoms.Typography>
            </Atoms.Container>

            <Atoms.Typography size="md">Rights Owner Information</Atoms.Typography>

            <Atoms.Container className="gap-4 xl:flex-row xl:justify-between">
              <Atoms.Checkbox
                id={COPYRIGHT_FORM_FIELDS.IS_RIGHTS_OWNER}
                name={COPYRIGHT_FORM_FIELDS.IS_RIGHTS_OWNER}
                checked={form.watch(COPYRIGHT_FORM_FIELDS.IS_RIGHTS_OWNER)}
                onCheckedChange={(checked) => handleRoleChange(COPYRIGHT_FORM_FIELDS.IS_RIGHTS_OWNER, Boolean(checked))}
                label="I am the rights owner"
                disabled={isSubmitting}
              />
              <Atoms.Checkbox
                id={COPYRIGHT_FORM_FIELDS.IS_REPORTING_ON_BEHALF}
                name={COPYRIGHT_FORM_FIELDS.IS_REPORTING_ON_BEHALF}
                checked={form.watch(COPYRIGHT_FORM_FIELDS.IS_REPORTING_ON_BEHALF)}
                onCheckedChange={(checked) =>
                  handleRoleChange(COPYRIGHT_FORM_FIELDS.IS_REPORTING_ON_BEHALF, Boolean(checked))
                }
                label="I am reporting on behalf of my organization or client"
                disabled={isSubmitting}
              />
            </Atoms.Container>

            {roleError && (
              <Atoms.Typography size="sm" className="font-normal text-destructive" role="alert">
                {roleError}
              </Atoms.Typography>
            )}

            <Molecules.ControlledInputField<CopyrightFormData>
              name="nameOwner"
              control={form.control}
              label="Name of the rights owner"
              labelHint={
                <Atoms.Typography as="span" overrideDefaults className="text-xs normal-case">
                  {' '}
                  (This may be your full name or the name of the organization)
                </Atoms.Typography>
              }
              placeholder="Name of the rights owner"
              maxLength={50}
              disabled={isSubmitting}
            />

            <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

            <Atoms.Container className="gap-6 rounded-lg bg-muted p-4">
              <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
                We hereby provide notice of copyright infringements pursuant to the terms of the Digital Millennium
                Copyright Act (the &quot;Act&quot;) and the Pubky Terms and Conditions. Copyright Owner is the owner of
                the copyrights in the following work(s) (collectively, the &quot;Work(s)&quot;):
              </Atoms.Typography>
            </Atoms.Container>

            <Atoms.Container className="gap-8 xl:flex-row xl:justify-between">
              <Molecules.ControlledTextareaField<CopyrightFormData>
                name="originalContentUrls"
                control={form.control}
                label="Original Content URLs"
                placeholder="Enter URLs of your original content"
                disabled={isSubmitting}
                className="min-w-0"
                textareaClassName="overflow-y-auto overflow-x-hidden break-words"
              />

              <Molecules.ControlledTextareaField<CopyrightFormData>
                name="briefDescription"
                control={form.control}
                label="Brief description of your original content"
                placeholder="Describe your original content"
                disabled={isSubmitting}
                className="min-w-0"
                textareaClassName="overflow-y-auto overflow-x-hidden break-words"
              />
            </Atoms.Container>

            <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

            <Atoms.Container className="gap-6 rounded-lg bg-muted p-4">
              <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
                It has come to Copyright Owner&apos;s attention that your platform (the &quot;Platform&quot;) displays,
                provides access to or caches materials that infringe Copyright Owner&apos;s copyrights in the Work(s).
                The following is a list of the infringing material(s) and the URL(s), if applicable, at which the
                infringing material(s) are accessible on the Platform:
              </Atoms.Typography>
            </Atoms.Container>

            <Atoms.Typography size="md">Infringing work details</Atoms.Typography>

            <Molecules.ControlledTextareaField<CopyrightFormData>
              name="infringingContentUrl"
              control={form.control}
              label="Infringing Content URLs"
              placeholder="Enter URLs of infringing content"
              disabled={isSubmitting}
              className="min-w-0"
              textareaClassName="overflow-y-auto overflow-x-hidden break-words"
            />

            <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

            <Atoms.Container className="gap-6 rounded-lg bg-muted p-4">
              <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
                We have a good faith belief that the use of the Works described in this letter are not authorized by
                Copyright Owner, any agent of Copyright Owner or any applicable law. The information in this
                notification is accurate. We swear under penalty of perjury that we are authorized to act on behalf of
                Copyright Owner with respect to the subject matter of this letter.
                <br />
                <br />
                We therefore request that you remove or disable access to the infringing materials as set forth in
                Section 512(c)(1)(C), Section 512(d)(3) and/or Section 512(b)(2)(E) of the Act, as applicable, and
                pursuant to the Pubky Terms and Conditions. Please contact the undersigned no later than one week from
                the date of this copyright removal request to confirm that the infringing materials have been removed or
                access disabled. The undersigned may be contacted at the telephone number, address and email address set
                forth below, as follows:
              </Atoms.Typography>
            </Atoms.Container>

            <Atoms.Typography size="md">Contact Information</Atoms.Typography>

            <Atoms.Container className="gap-8 xl:flex-row xl:justify-between">
              <Molecules.ControlledInputField<CopyrightFormData>
                name="firstName"
                control={form.control}
                label="First Name"
                placeholder="Satoshi"
                maxLength={30}
                disabled={isSubmitting}
              />

              <Molecules.ControlledInputField<CopyrightFormData>
                name="lastName"
                control={form.control}
                label="Last Name"
                placeholder="Nakamoto"
                maxLength={30}
                disabled={isSubmitting}
              />
            </Atoms.Container>

            <Atoms.Container className="gap-8 xl:flex-row xl:justify-between">
              <Molecules.ControlledInputField<CopyrightFormData>
                name="email"
                control={form.control}
                label="Email"
                placeholder="email@example.com"
                maxLength={100}
                disabled={isSubmitting}
              />

              <Molecules.ControlledInputField<CopyrightFormData>
                name="phoneNumber"
                control={form.control}
                label="Phone number"
                placeholder="000-000-0000"
                maxLength={30}
                disabled={isSubmitting}
              />
            </Atoms.Container>

            <Atoms.Typography size="md">Address</Atoms.Typography>

            <Atoms.Container className="gap-8 xl:flex-row xl:justify-between">
              <Molecules.ControlledInputField<CopyrightFormData>
                name="streetAddress"
                control={form.control}
                label="Street address"
                placeholder="Street number and name"
                maxLength={100}
                disabled={isSubmitting}
              />

              <Molecules.ControlledInputField<CopyrightFormData>
                name="country"
                control={form.control}
                label="Country"
                placeholder="United States"
                maxLength={50}
                disabled={isSubmitting}
              />
            </Atoms.Container>

            <Atoms.Container className="gap-8 xl:flex-row xl:justify-between">
              <Molecules.ControlledInputField<CopyrightFormData>
                name="city"
                control={form.control}
                label="City"
                placeholder="City name"
                maxLength={50}
                disabled={isSubmitting}
              />

              <Molecules.ControlledInputField<CopyrightFormData>
                name="stateProvince"
                control={form.control}
                label="State/Province"
                placeholder="State name"
                maxLength={50}
                disabled={isSubmitting}
              />
            </Atoms.Container>

            <Molecules.ControlledInputField<CopyrightFormData>
              name="zipCode"
              control={form.control}
              label="Zip code"
              placeholder="000000"
              maxLength={20}
              disabled={isSubmitting}
            />

            <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

            <Atoms.Typography as="h2" size="md">
              Signature
            </Atoms.Typography>

            <Molecules.ControlledInputField<CopyrightFormData>
              name="signature"
              control={form.control}
              label="Full Name as Signature"
              placeholder="Full name"
              maxLength={100}
              disabled={isSubmitting}
            />
          </Atoms.Container>
        </Atoms.Card>

        <Atoms.Card className="rounded-t-none rounded-b-lg border border-t-0 border-border p-8">
          <Atoms.Container className="flex-row justify-end">
            <Atoms.Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-auto"
              aria-label={isSubmitting ? 'Submitting form' : 'Submit form'}
            >
              {isSubmitting ? (
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
      </form>
    </Atoms.Container>
  );
}
