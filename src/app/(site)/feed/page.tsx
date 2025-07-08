'use client';

import { PageHeader } from '@/components/ui';
import { AuthGuard } from '@/components/guards';

export default function FeedPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Feed" subtitle="Welcome to your personalized feed" />

        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>

            <p className="text-gray-600 mb-4">
              This is your feed page. Here you&apos;ll see posts and updates from people you follow.
            </p>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Feed functionality coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
