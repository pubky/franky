'use client';

import * as React from 'react';

import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import type { AvatarSize } from './Avatar.types';

export function AvatarExamples() {
  const sizes: AvatarSize[] = ['sm', 'default', 'lg', 'xl'];

  const users = [
    { name: 'John Doe', initials: 'JD', image: 'https://github.com/shadcn.png' },
    { name: 'Jane Smith', initials: 'JS', image: 'https://github.com/vercel.png' },
    { name: 'Mike Johnson', initials: 'MJ', image: null },
    { name: 'Sarah Wilson', initials: 'SW', image: 'https://github.com/nextjs.png' },
  ];

  return (
    <div className="p-8 space-y-12 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Avatar Examples</h1>
        <p className="text-muted-foreground mb-8">
          Comprehensive showcase of all Avatar component variations and use cases.
        </p>

        {/* All Sizes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Sizes</h2>
          <div className="flex items-center gap-6 flex-wrap">
            {sizes.map((size) => (
              <div key={size} className="space-y-2 text-center">
                <Avatar size={size}>
                  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <code className="text-xs text-muted-foreground block">size=&quot;{size}&quot;</code>
                <span className="text-xs text-muted-foreground block">
                  {size === 'sm' && '24px'}
                  {size === 'default' && '32px'}
                  {size === 'lg' && '48px'}
                  {size === 'xl' && '64px'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* With Images vs Fallbacks */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Image vs Fallback</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">With Images</h3>
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage src="https://github.com/vercel.png" alt="User 2" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage src="https://github.com/nextjs.png" alt="User 3" />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Fallback Only</h3>
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>CD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>EF</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </section>

        {/* Different Fallback Styles */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Fallback Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">Initials</h3>
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Icons</h3>
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>👤</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>🏢</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>🤖</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Custom Styled</h3>
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">JD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-green-100 text-green-600">SM</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-purple-100 text-purple-600">AL</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </section>

        {/* Size Matrix */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Size Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 border border-border">Size</th>
                  <th className="text-center p-4 border border-border">With Image</th>
                  <th className="text-center p-4 border border-border">Fallback</th>
                  <th className="text-left p-4 border border-border">Use Case</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((size, index) => (
                  <tr key={size}>
                    <td className="p-4 border border-border font-mono text-sm">{size}</td>
                    <td className="p-4 border border-border text-center">
                      <div className="flex justify-center">
                        <Avatar size={size}>
                          <AvatarImage src={users[index]?.image || ''} alt="User" />
                          <AvatarFallback>{users[index]?.initials}</AvatarFallback>
                        </Avatar>
                      </div>
                    </td>
                    <td className="p-4 border border-border text-center">
                      <div className="flex justify-center">
                        <Avatar size={size}>
                          <AvatarFallback>{users[index]?.initials}</AvatarFallback>
                        </Avatar>
                      </div>
                    </td>
                    <td className="p-4 border border-border text-sm">
                      {size === 'sm' && 'Compact lists, navigation bars'}
                      {size === 'default' && 'Standard UI, comments, mentions'}
                      {size === 'lg' && 'Profile cards, user headers'}
                      {size === 'xl' && 'Profile pages, detailed views'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Real-world Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">User Profile Card</h3>
              <div className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">John Doe</p>
                    <p className="text-sm text-muted-foreground">Product Designer</p>
                    <p className="text-xs text-muted-foreground">john@company.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Comments Section</h3>
              <div className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex gap-3">
                  <Avatar size="sm">
                    <AvatarImage src="https://github.com/vercel.png" alt="Sarah" />
                    <AvatarFallback>SW</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Sarah Wilson</p>
                    <p className="text-sm text-muted-foreground">Great work on this feature!</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>MJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Mike Johnson</p>
                    <p className="text-sm text-muted-foreground">Thanks for the feedback.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team/Group Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Team & Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">Avatar Stack</h3>
              <div className="flex -space-x-2">
                <Avatar className="border-2 border-background">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-background">
                  <AvatarImage src="https://github.com/vercel.png" alt="User 2" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-background">
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-background bg-muted">
                  <AvatarFallback>+2</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Team List</h3>
              <div className="space-y-2">
                {users.slice(0, 3).map((user, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage src={user.image || ''} alt={user.name} />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Code Examples</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Basic Usage</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {`// Basic avatar with image
<Avatar>
  <AvatarImage src="/user.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// Different sizes
<Avatar size="sm">...</Avatar>
<Avatar size="lg">...</Avatar>
<Avatar size="xl">...</Avatar>

// Fallback only
<Avatar>
  <AvatarFallback>AB</AvatarFallback>
</Avatar>`}
              </pre>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Advanced Usage</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {`// Custom styled fallback
<Avatar>
  <AvatarFallback className="bg-blue-100 text-blue-600">
    JD
  </AvatarFallback>
</Avatar>

// Avatar stack
<div className="flex -space-x-2">
  <Avatar className="border-2 border-background">
    <AvatarImage src="/user1.jpg" />
    <AvatarFallback>U1</AvatarFallback>
  </Avatar>
  <Avatar className="border-2 border-background">
    <AvatarFallback>+3</AvatarFallback>
  </Avatar>
</div>`}
              </pre>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-green-600">✅ Do</h3>
              <ul className="space-y-2 text-sm">
                <li>• Always provide meaningful fallback text (initials)</li>
                <li>• Use appropriate sizes for context</li>
                <li>• Include alt text for images</li>
                <li>• Use consistent sizing across similar UI areas</li>
                <li>• Consider loading states for images</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-red-600">❌ Don&apos;t</h3>
              <ul className="space-y-2 text-sm">
                <li>• Don&apos;t use overly large avatars in lists</li>
                <li>• Don&apos;t forget fallback content</li>
                <li>• Don&apos;t use low-quality images</li>
                <li>• Don&apos;t mix different sizes inconsistently</li>
                <li>• Don&apos;t use avatars for non-user entities</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AvatarExamples;
