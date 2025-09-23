import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbEllipsis, BreadcrumbPage } from './Breadcrumb';

export const BreadcrumbExamples = () => {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Breadcrumb</h3>
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem href="/products">Products</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Product Details</BreadcrumbPage>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Ellipsis</h3>
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbEllipsis />
          <BreadcrumbSeparator />
          <BreadcrumbItem href="/category">Category</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Current Page</BreadcrumbPage>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Dropdown</h3>
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem dropdown onClick={() => alert('Dropdown clicked!')}>
            Categories
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem href="/products">Products</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Item Name</BreadcrumbPage>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Small Size</h3>
        <Breadcrumb size="sm">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator size="sm" />
          <BreadcrumbItem href="/docs">Documentation</BreadcrumbItem>
          <BreadcrumbSeparator size="sm" />
          <BreadcrumbItem href="/docs/components">Components</BreadcrumbItem>
          <BreadcrumbSeparator size="sm" />
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medium Size (Default)</h3>
        <Breadcrumb size="md">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator size="md" />
          <BreadcrumbItem href="/docs">Documentation</BreadcrumbItem>
          <BreadcrumbSeparator size="md" />
          <BreadcrumbItem href="/docs/components">Components</BreadcrumbItem>
          <BreadcrumbSeparator size="md" />
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Complex Example</h3>
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbEllipsis />
          <BreadcrumbSeparator />
          <BreadcrumbItem dropdown onClick={() => console.log('Dropdown clicked')}>
            Category
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem href="/products">Products</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem href="/products/electronics">Electronics</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Smartphone XYZ</BreadcrumbPage>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Separator</h3>
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator icon={<span className="mx-2">/</span>} />
          <BreadcrumbItem href="/about">About</BreadcrumbItem>
          <BreadcrumbSeparator icon={<span className="mx-2">/</span>} />
          <BreadcrumbPage>Team</BreadcrumbPage>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Interactive Items (No Links)</h3>
        <Breadcrumb>
          <BreadcrumbItem onClick={() => alert('Home clicked!')}>Home</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem onClick={() => alert('Settings clicked!')}>Settings</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Profile</BreadcrumbPage>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Long Breadcrumb (Responsive)</h3>
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem href="/very-long-category-name">Very Long Category Name</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem href="/another-long-subcategory">Another Long Subcategory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem href="/deeply-nested-section">Deeply Nested Section</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Final Page with a Very Descriptive Title</BreadcrumbPage>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Styled Example</h3>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Breadcrumb className="text-blue-600 dark:text-blue-400">
            <BreadcrumbItem href="/" className="hover:underline">
              Dashboard
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem href="/analytics" className="hover:underline">
              Analytics
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="text-gray-900 dark:text-gray-100">Monthly Report</BreadcrumbPage>
          </Breadcrumb>
        </div>
      </div>
    </div>
  );
};
