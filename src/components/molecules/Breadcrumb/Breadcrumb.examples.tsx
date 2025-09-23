'use client';

import * as React from 'react';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './Breadcrumb';

export function BreadcrumbExamples() {
  return (
    <div className="p-8 space-y-12 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Breadcrumb Examples</h1>
        <p className="text-muted-foreground mb-8">
          Comprehensive showcase of all Breadcrumb component variations and use cases.
        </p>

        {/* Basic Usage */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Basic Usage</h2>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Current Page</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <code className="text-xs text-muted-foreground block">Simple two-level breadcrumb navigation</code>
          </div>
        </section>

        {/* Multi-level Navigation */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Multi-level Navigation</h2>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/products/electronics">Electronics</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/products/electronics/laptops">Laptops</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>MacBook Pro</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <code className="text-xs text-muted-foreground block">Five-level deep navigation structure</code>
          </div>
        </section>

        {/* Custom Separators */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Custom Separators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">Slash Separator</h3>
              <div className="p-4 border border-border rounded-lg">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbPage>Components</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Dot Separator</h3>
              <div className="p-4 border border-border rounded-lg">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>•</BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/blog">Blog</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>•</BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbPage>Article Title</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>
        </section>

        {/* AsChild Usage */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">AsChild Usage</h2>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <button onClick={() => alert('Navigate to Home')} className="cursor-pointer">
                        Home
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <button onClick={() => alert('Navigate to Settings')} className="cursor-pointer">
                        Settings
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Profile</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <code className="text-xs text-muted-foreground block">
              Using buttons instead of anchor tags with asChild prop
            </code>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Real-world Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">E-commerce Navigation</h3>
              <div className="p-4 border border-border rounded-lg">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Store</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/categories/clothing">Clothing</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Men&apos;s T-Shirts</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Documentation Site</h3>
              <div className="p-4 border border-border rounded-lg">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Docs</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/components/navigation">Navigation</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>
        </section>

        {/* Different Contexts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Different Contexts</h2>
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-medium">Admin Dashboard</h3>
              <div className="p-4 border border-border rounded-lg bg-muted/50">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/admin/users/123">John Doe</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Edit Profile</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">File System</h3>
              <div className="p-4 border border-border rounded-lg">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/files">Files</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/files/documents">documents</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/files/documents/projects">projects</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbPage>readme.md</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Code Examples</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Basic Structure</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/products">
        Products
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
              </pre>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Custom Separator</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator>/</BreadcrumbSeparator>
    <BreadcrumbItem>
      <BreadcrumbPage>Current</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

// With asChild
<BreadcrumbLink asChild>
  <Link href="/products">Products</Link>
</BreadcrumbLink>`}
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
                <li>• Use breadcrumbs for hierarchical navigation</li>
                <li>• Keep breadcrumb paths under 5 levels</li>
                <li>• Make all non-current items clickable</li>
                <li>• Use descriptive labels for each level</li>
                <li>• Include proper ARIA attributes</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-red-600">❌ Don&apos;t</h3>
              <ul className="space-y-2 text-sm">
                <li>• Don&apos;t use breadcrumbs for single-level navigation</li>
                <li>• Don&apos;t make the current page clickable</li>
                <li>• Don&apos;t use overly long labels</li>
                <li>• Don&apos;t skip levels in the hierarchy</li>
                <li>• Don&apos;t use breadcrumbs as primary navigation</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default BreadcrumbExamples;
