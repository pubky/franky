'use client';

import * as React from 'react';

import { Badge } from './Badge';
import type { BadgeVariant } from './Badge.types';

export function BadgeExamples() {
  const variants: BadgeVariant[] = ['default', 'secondary', 'destructive', 'outline'];

  return (
    <div className="p-8 space-y-12 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Badge Examples</h1>
        <p className="text-muted-foreground mb-8">
          Comprehensive showcase of all Badge component variations and use cases.
        </p>

        {/* All Variants */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Variants</h2>
          <div className="flex flex-wrap gap-4">
            {variants.map((variant) => (
              <div key={variant} className="space-y-2 text-center">
                <Badge variant={variant}>{variant}</Badge>
                <code className="text-xs text-muted-foreground block">variant=&quot;{variant}&quot;</code>
              </div>
            ))}
          </div>
        </section>

        {/* With Icons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">With Icons</h2>
          <div className="flex flex-wrap gap-4">
            <Badge variant="default">
              <span>✓</span> Completed
            </Badge>
            <Badge variant="secondary">
              <span>⏳</span> Pending
            </Badge>
            <Badge variant="destructive">
              <span>✕</span> Failed
            </Badge>
            <Badge variant="outline">
              <span>🔄</span> Processing
            </Badge>
          </div>
        </section>

        {/* Different Content Types */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Content Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">Status Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Active</Badge>
                <Badge variant="secondary">Inactive</Badge>
                <Badge variant="destructive">Blocked</Badge>
                <Badge variant="outline">Draft</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Numbers</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">1</Badge>
                <Badge variant="secondary">99+</Badge>
                <Badge variant="destructive">!</Badge>
                <Badge variant="outline">42</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Frontend</Badge>
                <Badge variant="secondary">Backend</Badge>
                <Badge variant="outline">Design</Badge>
                <Badge variant="outline">DevOps</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Priorities</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="destructive">High</Badge>
                <Badge variant="default">Medium</Badge>
                <Badge variant="outline">Low</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* AsChild Usage */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">AsChild Usage</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Badge as Link</h3>
              <div className="flex gap-2">
                <Badge asChild variant="outline">
                  <a href="#" className="hover:underline">
                    Clickable Badge
                  </a>
                </Badge>
                <Badge asChild variant="default">
                  <button onClick={() => alert('Badge clicked!')}>Button Badge</button>
                </Badge>
              </div>
              <code className="text-xs text-muted-foreground block">
                &lt;Badge asChild&gt;&lt;a href=&quot;#&quot;&gt;Link&lt;/a&gt;&lt;/Badge&gt;
              </code>
            </div>
          </div>
        </section>

        {/* Variant Matrix */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Variant Showcase</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 border border-border">Variant</th>
                  <th className="text-center p-4 border border-border">Example</th>
                  <th className="text-left p-4 border border-border">Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border border-border font-mono text-sm">default</td>
                  <td className="p-4 border border-border text-center">
                    <Badge variant="default">Badge</Badge>
                  </td>
                  <td className="p-4 border border-border text-sm">Primary status, important labels</td>
                </tr>
                <tr>
                  <td className="p-4 border border-border font-mono text-sm">secondary</td>
                  <td className="p-4 border border-border text-center">
                    <Badge variant="secondary">Badge</Badge>
                  </td>
                  <td className="p-4 border border-border text-sm">Secondary information, categories</td>
                </tr>
                <tr>
                  <td className="p-4 border border-border font-mono text-sm">destructive</td>
                  <td className="p-4 border border-border text-center">
                    <Badge variant="destructive">Badge</Badge>
                  </td>
                  <td className="p-4 border border-border text-sm">Errors, warnings, urgent status</td>
                </tr>
                <tr>
                  <td className="p-4 border border-border font-mono text-sm">outline</td>
                  <td className="p-4 border border-border text-center">
                    <Badge variant="outline">Badge</Badge>
                  </td>
                  <td className="p-4 border border-border text-sm">Subtle labels, optional information</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Real-world Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">User Profile</h3>
              <div className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <div className="flex gap-1">
                      <Badge variant="default">Pro</Badge>
                      <Badge variant="outline">Verified</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Task List</h3>
              <div className="p-4 border border-border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span>Setup authentication</span>
                  <Badge variant="default">Done</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Add validation</span>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fix bug #123</span>
                  <Badge variant="destructive">Blocked</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Write tests</span>
                  <Badge variant="outline">Todo</Badge>
                </div>
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
                {`// Basic badge
<Badge>Default</Badge>

// With variant
<Badge variant="destructive">
  Error
</Badge>

// With icon
<Badge variant="default">
  <CheckIcon /> Completed
</Badge>`}
              </pre>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Advanced Usage</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {`// As interactive element
<Badge asChild>
  <button onClick={handleClick}>
    Click me
  </button>
</Badge>

// With custom styling
<Badge 
  variant="outline" 
  className="hover:bg-accent"
>
  Custom Badge
</Badge>`}
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
                <li>
                  • Use <code>destructive</code> for errors and urgent states
                </li>
                <li>• Keep badge text short and descriptive</li>
                <li>• Use consistent variants for similar meanings</li>
                <li>• Consider using icons for quick recognition</li>
                <li>
                  • Use <code>outline</code> for subtle, optional information
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-red-600">❌ Don&apos;t</h3>
              <ul className="space-y-2 text-sm">
                <li>• Don&apos;t use too many badges in one area</li>
                <li>• Don&apos;t use long text in badges</li>
                <li>• Don&apos;t mix badge purposes inconsistently</li>
                <li>• Don&apos;t use badges for primary actions</li>
                <li>• Don&apos;t ignore accessibility considerations</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default BadgeExamples;
