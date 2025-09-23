'use client';

import * as React from 'react';

import { Button } from './Button';
import type { ButtonVariant, ButtonSize } from './Button.types';

export function ButtonExamples() {
  const variants: ButtonVariant[] = [
    'default',
    'destructive',
    'outline',
    'secondary',
    'ghost',
    'brand',
    'link',
    'dark',
    'dark-outline',
  ];

  const sizes: ButtonSize[] = ['sm', 'default', 'lg', 'icon'];

  return (
    <div className="p-8 space-y-12 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Button Examples</h1>
        <p className="text-muted-foreground mb-8">
          Comprehensive showcase of all Button component variations and use cases.
        </p>

        {/* All Variants */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {variants.map((variant) => (
              <div key={variant} className="space-y-2">
                <Button variant={variant} className="w-full">
                  {variant}
                </Button>
                <code className="text-xs text-muted-foreground block text-center">variant=&quot;{variant}&quot;</code>
              </div>
            ))}
          </div>
        </section>

        {/* All Sizes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Sizes</h2>
          <div className="flex items-center gap-4 flex-wrap">
            {sizes.map((size) => (
              <div key={size} className="space-y-2 text-center">
                <Button size={size}>{size === 'icon' ? '🔍' : `Size ${size}`}</Button>
                <code className="text-xs text-muted-foreground block">size=&quot;{size}&quot;</code>
              </div>
            ))}
          </div>
        </section>

        {/* Size x Variant Matrix */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Size × Variant Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border border-border">Variant</th>
                  {sizes.map((size) => (
                    <th key={size} className="text-center p-2 border border-border min-w-24">
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant}>
                    <td className="p-2 border border-border font-mono text-sm">{variant}</td>
                    {sizes.map((size) => (
                      <td key={`${variant}-${size}`} className="p-2 border border-border text-center">
                        <Button variant={variant} size={size}>
                          {size === 'icon' ? '✓' : 'Button'}
                        </Button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* States */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Normal</h3>
              <Button>Normal Button</Button>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Disabled</h3>
              <Button disabled>Disabled Button</Button>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Loading State</h3>
              <Button disabled className="opacity-75">
                <span className="animate-spin">⏳</span> Loading...
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">With Icon</h3>
              <Button>
                <span>📄</span> With Icon
              </Button>
            </div>
          </div>
        </section>

        {/* AsChild Usage */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">AsChild Usage</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Button as Link</h3>
              <Button asChild variant="outline">
                <a href="#" className="inline-flex">
                  External Link 🔗
                </a>
              </Button>
              <code className="text-xs text-muted-foreground block">
                &lt;Button asChild&gt;&lt;a href=&quot;#&quot;&gt;Link&lt;/a&gt;&lt;/Button&gt;
              </code>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Button as Div</h3>
              <Button asChild variant="secondary">
                <div>Custom Div Element</div>
              </Button>
              <code className="text-xs text-muted-foreground block">
                &lt;Button asChild&gt;&lt;div&gt;Content&lt;/div&gt;&lt;/Button&gt;
              </code>
            </div>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Interactive Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">Action Buttons</h3>
              <div className="flex gap-2 flex-wrap">
                <Button variant="default" onClick={() => alert('Default clicked!')}>
                  Primary Action
                </Button>
                <Button variant="secondary" onClick={() => alert('Secondary clicked!')}>
                  Secondary
                </Button>
                <Button variant="outline" onClick={() => alert('Outline clicked!')}>
                  Tertiary
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Danger Zone</h3>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="destructive"
                  onClick={() => confirm('Are you sure you want to delete?') && alert('Deleted!')}
                >
                  Delete
                </Button>
                <Button variant="outline" onClick={() => alert('Cancelled!')}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Form Usage</h2>
          <div className="max-w-md space-y-4 p-6 border border-border rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" className="w-full p-2 border border-border rounded-md" placeholder="your@email.com" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Submit Form
              </Button>
              <Button type="button" variant="outline">
                Reset
              </Button>
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
                {`// Basic button
<Button>Click me</Button>

// With variant
<Button variant="destructive">
  Delete
</Button>

// With size
<Button size="lg">
  Large Button
</Button>

// Combined
<Button variant="outline" size="sm">
  Small Outline
</Button>`}
              </pre>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Advanced Usage</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {`// As child element
<Button asChild>
  <Link href="/profile">
    Go to Profile
  </Link>
</Button>

// With custom styling
<Button 
  variant="ghost" 
  className="hover:bg-red-100"
>
  Custom Button
</Button>

// Event handlers
<Button 
  onClick={handleClick}
  disabled={isLoading}
>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>`}
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
                  • Use <code>variant=&quot;destructive&quot;</code> for dangerous actions
                </li>
                <li>
                  • Use <code>size=&quot;lg&quot;</code> for primary CTAs
                </li>
                <li>• Provide descriptive button text</li>
                <li>
                  • Use <code>disabled</code> state during loading
                </li>
                <li>
                  • Use <code>asChild</code> for navigation links
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-red-600">❌ Don&apos;t</h3>
              <ul className="space-y-2 text-sm">
                <li>• Don&apos;t use too many different variants in one area</li>
                <li>• Don&apos;t make buttons too small for mobile</li>
                <li>
                  • Don&apos;t use <code>link</code> variant for actions
                </li>
                <li>• Don&apos;t forget focus states for accessibility</li>
                <li>
                  • Don&apos;t overuse <code>brand</code> variant
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ButtonExamples;
