'use client';

import * as Organisms from '@/organisms';

/**
 * Copyright/DMCA takedown request page
 *
 * Public page accessible without authentication for submitting
 * copyright infringement claims.
 */
export default function CopyrightPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Organisms.CopyrightForm />
    </div>
  );
}
