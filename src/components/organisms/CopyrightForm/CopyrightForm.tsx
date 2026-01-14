'use client';

import { Controller } from 'react-hook-form';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

const LABEL_CLASSES = 'text-xs font-medium tracking-wide text-muted-foreground uppercase';

export function CopyrightForm() {
  const { form, onSubmit, handleRoleChange } = Hooks.useCopyrightForm();
  const { isSubmitting, errors } = form.formState;
  const roleError = errors.root?.message;

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <Atoms.Container>
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

          <Atoms.Container className="rounded-lg bg-muted p-4">
            <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
              Dear Synonym:
            </Atoms.Typography>
            <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
              We write on behalf of:
            </Atoms.Typography>
          </Atoms.Container>

          <Atoms.Typography size="md">Rights Owner Information</Atoms.Typography>

          <Atoms.Container className="gap-4 xl:flex-row xl:justify-between">
            <Atoms.Checkbox
              checked={form.watch('isRightsOwner')}
              onCheckedChange={(checked) => handleRoleChange('isRightsOwner', Boolean(checked))}
              label="I am the rights owner"
            />
            <Atoms.Checkbox
              checked={form.watch('isReportingOnBehalf')}
              onCheckedChange={(checked) => handleRoleChange('isReportingOnBehalf', Boolean(checked))}
              label="I am reporting on behalf of my organization or client"
            />
          </Atoms.Container>

          {roleError && (
            <Atoms.Typography size="sm" className="font-normal text-destructive" role="alert">
              {roleError}
            </Atoms.Typography>
          )}

          <Atoms.Container className="gap-2">
            <Atoms.Label htmlFor="nameOwner" className={LABEL_CLASSES}>
              Name of the rights owner
              <span className="text-xs normal-case"> (This may be your full name or the name of the organization)</span>
            </Atoms.Label>
            <Controller
              name="nameOwner"
              control={form.control}
              render={({ field, fieldState }) => (
                <Molecules.InputField
                  id="nameOwner"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={50}
                  placeholder="Name of the rights owner"
                  variant="dashed"
                  size="lg"
                  status={fieldState.error ? 'error' : 'default'}
                  message={fieldState.error?.message}
                  messageType={fieldState.error ? 'error' : 'default'}
                />
              )}
            />
          </Atoms.Container>

          <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

          <Atoms.Container className="rounded-lg bg-muted p-4">
            <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
              We hereby provide notice of copyright infringements pursuant to the terms of the Digital Millennium
              Copyright Act (the &quot;Act&quot;) and the Pubky Terms and Conditions. Copyright Owner is the owner of
              the copyrights in the following work(s) (collectively, the &quot;Work(s)&quot;):
            </Atoms.Typography>
          </Atoms.Container>

          <Atoms.Container className="gap-8 xl:flex-row xl:justify-between">
            <Atoms.Container className="gap-2">
              <Atoms.Label htmlFor="originalContentUrls" className={LABEL_CLASSES}>
                Original Content URLs
              </Atoms.Label>
              <Controller
                name="originalContentUrls"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Molecules.TextareaField
                    id="originalContentUrls"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter URLs of your original content"
                    variant="dashed"
                    rows={4}
                    status={fieldState.error ? 'error' : 'default'}
                    message={fieldState.error?.message}
                    messageType={fieldState.error ? 'error' : 'default'}
                  />
                )}
              />
            </Atoms.Container>

            <Atoms.Container className="gap-2">
              <Atoms.Label htmlFor="briefDescription" className={LABEL_CLASSES}>
                Brief description of your original content
              </Atoms.Label>
              <Controller
                name="briefDescription"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Molecules.TextareaField
                    id="briefDescription"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describe your original content"
                    variant="dashed"
                    rows={4}
                    status={fieldState.error ? 'error' : 'default'}
                    message={fieldState.error?.message}
                    messageType={fieldState.error ? 'error' : 'default'}
                  />
                )}
              />
            </Atoms.Container>
          </Atoms.Container>

          <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

          <Atoms.Container className="rounded-lg bg-muted p-4">
            <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
              It has come to Copyright Owner&apos;s attention that your platform (the &quot;Platform&quot;) displays,
              provides access to or caches materials that infringe Copyright Owner&apos;s copyrights in the Work(s). The
              following is a list of the infringing material(s) and the URL(s), if applicable, at which the infringing
              material(s) are accessible on the Platform:
            </Atoms.Typography>
          </Atoms.Container>

          <Atoms.Typography size="md">Infringing work details</Atoms.Typography>

          <Atoms.Container className="gap-2">
            <Atoms.Label htmlFor="infringingContentUrl" className={LABEL_CLASSES}>
              Infringing Content URLs
            </Atoms.Label>
            <Controller
              name="infringingContentUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Molecules.TextareaField
                  id="infringingContentUrl"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter URLs of infringing content"
                  variant="dashed"
                  rows={4}
                  status={fieldState.error ? 'error' : 'default'}
                  message={fieldState.error?.message}
                  messageType={fieldState.error ? 'error' : 'default'}
                />
              )}
            />
          </Atoms.Container>

          <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

          <Atoms.Container className="rounded-lg bg-muted p-4">
            <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
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

          <Atoms.Typography size="md">Contact Information</Atoms.Typography>

          <Atoms.Container className="gap-8 xl:flex-row xl:justify-between">
            <Atoms.Container className="gap-2">
              <Atoms.Label htmlFor="firstName" className={LABEL_CLASSES}>
                First Name
              </Atoms.Label>
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Molecules.InputField
                    id="firstName"
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={30}
                    placeholder="Satoshi"
                    variant="dashed"
                    size="lg"
                    status={fieldState.error ? 'error' : 'default'}
                    message={fieldState.error?.message}
                    messageType={fieldState.error ? 'error' : 'default'}
                  />
                )}
              />
            </Atoms.Container>

            <Atoms.Container className="gap-2">
              <Atoms.Label htmlFor="lastName" className={LABEL_CLASSES}>
                Last Name
              </Atoms.Label>
              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Molecules.InputField
                    id="lastName"
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={30}
                    placeholder="Nakamoto"
                    variant="dashed"
                    size="lg"
                    status={fieldState.error ? 'error' : 'default'}
                    message={fieldState.error?.message}
                    messageType={fieldState.error ? 'error' : 'default'}
                  />
                )}
              />
            </Atoms.Container>
          </Atoms.Container>

          <Atoms.Container className="gap-8 xl:flex-row xl:justify-between">
            <Atoms.Container className="gap-2">
              <Atoms.Label htmlFor="email" className={LABEL_CLASSES}>
                Email
              </Atoms.Label>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Molecules.InputField
                    id="email"
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={100}
                    placeholder="email@example.com"
                    variant="dashed"
                    size="lg"
                    status={fieldState.error ? 'error' : 'default'}
                    message={fieldState.error?.message}
                    messageType={fieldState.error ? 'error' : 'default'}
                  />
                )}
              />
            </Atoms.Container>

            <Atoms.Container className="gap-2">
              <Atoms.Label htmlFor="phoneNumber" className={LABEL_CLASSES}>
                Phone number
              </Atoms.Label>
              <Controller
                name="phoneNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Molecules.InputField
                    id="phoneNumber"
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={30}
                    placeholder="000-000-0000"
                    variant="dashed"
                    size="lg"
                    status={fieldState.error ? 'error' : 'default'}
                    message={fieldState.error?.message}
                    messageType={fieldState.error ? 'error' : 'default'}
                  />
                )}
              />
            </Atoms.Container>
          </Atoms.Container>

          <Atoms.Typography size="md">Address</Atoms.Typography>

          <Atoms.Container className="gap-8 xl:flex-row xl:justify-between">
            <Atoms.Container className="gap-2">
              <Atoms.Label htmlFor="streetAddress" className={LABEL_CLASSES}>
                Street address
              </Atoms.Label>
              <Controller
                name="streetAddress"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Molecules.InputField
                    id="streetAddress"
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={100}
                    placeholder="Street number and name"
                    variant="dashed"
                    size="lg"
                    status={fieldState.error ? 'error' : 'default'}
                    message={fieldState.error?.message}
                    messageType={fieldState.error ? 'error' : 'default'}
                  />
                )}
              />
            </Atoms.Container>

            <Atoms.Container className="gap-2">
              <Atoms.Label htmlFor="country" className={LABEL_CLASSES}>
                Country
              </Atoms.Label>
              <Controller
                name="country"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Molecules.InputField
                    id="country"
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={50}
                    placeholder="United States"
                    variant="dashed"
                    size="lg"
                    status={fieldState.error ? 'error' : 'default'}
                    message={fieldState.error?.message}
                    messageType={fieldState.error ? 'error' : 'default'}
                  />
                )}
              />
            </Atoms.Container>
          </Atoms.Container>

          <Atoms.Container className="gap-8 xl:flex-row xl:justify-between">
            <Atoms.Container className="gap-2">
              <Atoms.Label htmlFor="city" className={LABEL_CLASSES}>
                City
              </Atoms.Label>
              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Molecules.InputField
                    id="city"
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={50}
                    placeholder="City name"
                    variant="dashed"
                    size="lg"
                    status={fieldState.error ? 'error' : 'default'}
                    message={fieldState.error?.message}
                    messageType={fieldState.error ? 'error' : 'default'}
                  />
                )}
              />
            </Atoms.Container>

            <Atoms.Container className="gap-2">
              <Atoms.Label htmlFor="stateProvince" className={LABEL_CLASSES}>
                State/Province
              </Atoms.Label>
              <Controller
                name="stateProvince"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Molecules.InputField
                    id="stateProvince"
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={50}
                    placeholder="State name"
                    variant="dashed"
                    size="lg"
                    status={fieldState.error ? 'error' : 'default'}
                    message={fieldState.error?.message}
                    messageType={fieldState.error ? 'error' : 'default'}
                  />
                )}
              />
            </Atoms.Container>
          </Atoms.Container>

          <Atoms.Container className="gap-2">
            <Atoms.Label htmlFor="zipCode" className={LABEL_CLASSES}>
              Zip code
            </Atoms.Label>
            <Controller
              name="zipCode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Molecules.InputField
                  id="zipCode"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={20}
                  placeholder="000000"
                  variant="dashed"
                  size="lg"
                  status={fieldState.error ? 'error' : 'default'}
                  message={fieldState.error?.message}
                  messageType={fieldState.error ? 'error' : 'default'}
                />
              )}
            />
          </Atoms.Container>

          <Atoms.Container overrideDefaults className="my-3 h-px w-full bg-border" aria-hidden="true" />

          <Atoms.Typography as="h2" size="md">
            Signature
          </Atoms.Typography>

          <Atoms.Container className="gap-2">
            <Atoms.Label htmlFor="signature" className={LABEL_CLASSES}>
              Full Name as Signature
            </Atoms.Label>
            <Controller
              name="signature"
              control={form.control}
              render={({ field, fieldState }) => (
                <Molecules.InputField
                  id="signature"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={100}
                  placeholder="Full name"
                  variant="dashed"
                  size="lg"
                  status={fieldState.error ? 'error' : 'default'}
                  message={fieldState.error?.message}
                  messageType={fieldState.error ? 'error' : 'default'}
                />
              )}
            />
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Card>

      <Atoms.Card className="rounded-t-none rounded-b-lg border border-t-0 border-border p-8">
        <Atoms.Container className="flex-row justify-end">
          <Atoms.Button
            disabled={isSubmitting}
            onClick={onSubmit}
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
    </Atoms.Container>
  );
}
