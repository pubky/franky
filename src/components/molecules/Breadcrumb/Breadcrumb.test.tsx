import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbEllipsis, BreadcrumbPage } from './Breadcrumb';

describe('Breadcrumb', () => {
  describe('Breadcrumb Container', () => {
    it('renders with nav element', () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
      expect(nav).toBeInTheDocument();
    });

    it('renders with ordered list', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      const ol = container.querySelector('ol');
      expect(ol).toBeInTheDocument();
    });

    it('applies size variants', () => {
      const { rerender } = render(
        <Breadcrumb size="sm">
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('gap-1.5');

      rerender(
        <Breadcrumb size="md">
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      expect(nav).toHaveClass('gap-2.5');
    });

    it('applies custom className', () => {
      render(
        <Breadcrumb className="custom-class">
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('custom-class');
    });
  });

  describe('BreadcrumbItem', () => {
    it('renders as list item', () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      const listItem = screen.getByRole('listitem');
      expect(listItem).toBeInTheDocument();
    });

    it('renders as link when href is provided', () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/home">Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/home');
    });

    it('renders as button when href is not provided', () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders dropdown variant with chevron icon', () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem dropdown>Menu</BreadcrumbItem>
        </Breadcrumb>,
      );

      const item = screen.getByRole('listitem');
      expect(item).toHaveClass('rounded', 'overflow-hidden');

      // Check for ChevronDown icon by looking for svg
      const svg = item.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('applies variant classes', () => {
      const { rerender } = render(
        <Breadcrumb>
          <BreadcrumbItem variant="link">Link</BreadcrumbItem>
        </Breadcrumb>,
      );

      let item = screen.getByRole('listitem');
      expect(item).toHaveClass('text-muted-foreground', 'hover:text-foreground');

      rerender(
        <Breadcrumb>
          <BreadcrumbItem variant="current">Current</BreadcrumbItem>
        </Breadcrumb>,
      );

      item = screen.getByRole('listitem');
      expect(item).toHaveClass('text-foreground');
    });

    it('handles click events', () => {
      const handleClick = vi.fn();
      render(
        <Breadcrumb>
          <BreadcrumbItem onClick={handleClick}>Click me</BreadcrumbItem>
        </Breadcrumb>,
      );

      const item = screen.getByRole('listitem');
      fireEvent.click(item);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders with correct font styles', () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem>Styled Text</BreadcrumbItem>
        </Breadcrumb>,
      );

      const text = screen.getByText('Styled Text');
      expect(text).toHaveClass('font-bold', 'text-sm', 'leading-5');
    });
  });

  describe('BreadcrumbSeparator', () => {
    it('renders with presentation role', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem>Home</BreadcrumbItem>
          <BreadcrumbSeparator />
        </Breadcrumb>,
      );

      const separator = container.querySelector('li[role="presentation"]');
      expect(separator).toBeInTheDocument();
    });

    it('is hidden from screen readers', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem>Home</BreadcrumbItem>
          <BreadcrumbSeparator />
        </Breadcrumb>,
      );

      const separator = container.querySelector('li[role="presentation"]');
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders default ChevronRight icon', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem>Home</BreadcrumbItem>
          <BreadcrumbSeparator />
        </Breadcrumb>,
      );

      const separator = container.querySelector('li[role="presentation"]');
      const svg = separator?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders custom icon when provided', () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem>Home</BreadcrumbItem>
          <BreadcrumbSeparator icon={<span data-testid="custom-icon">/</span>} />
        </Breadcrumb>,
      );

      const customIcon = screen.getByTestId('custom-icon');
      expect(customIcon).toBeInTheDocument();
    });

    it('applies size variants', () => {
      const { container, rerender } = render(
        <Breadcrumb>
          <BreadcrumbSeparator size="sm" />
        </Breadcrumb>,
      );

      let separator = container.querySelector('li[role="presentation"]');
      expect(separator).toHaveClass('w-[15px]', 'h-[15px]');

      rerender(
        <Breadcrumb>
          <BreadcrumbSeparator size="md" />
        </Breadcrumb>,
      );

      separator = container.querySelector('li[role="presentation"]');
      expect(separator).toHaveClass('w-[15px]', 'h-[15px]');
    });
  });

  describe('BreadcrumbEllipsis', () => {
    it('renders with presentation role', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbEllipsis />
        </Breadcrumb>,
      );

      const ellipsis = container.querySelector('span[role="presentation"]');
      expect(ellipsis).toBeInTheDocument();
    });

    it('renders MoreHorizontal icon', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbEllipsis />
        </Breadcrumb>,
      );

      const ellipsis = container.querySelector('span[role="presentation"]');
      const svg = ellipsis?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('applies correct size classes', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbEllipsis />
        </Breadcrumb>,
      );

      const ellipsis = container.querySelector('span[role="presentation"]');
      expect(ellipsis).toHaveClass('w-9', 'h-9');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbEllipsis className="custom-ellipsis" />
        </Breadcrumb>,
      );

      const ellipsis = container.querySelector('span[role="presentation"]');
      expect(ellipsis).toHaveClass('custom-ellipsis');
    });
  });

  describe('BreadcrumbPage', () => {
    it('renders with current variant', () => {
      render(
        <Breadcrumb>
          <BreadcrumbPage>Current Page</BreadcrumbPage>
        </Breadcrumb>,
      );

      const page = screen.getByRole('link');
      expect(page).toHaveClass('text-foreground');
    });

    it('has aria-current attribute', () => {
      render(
        <Breadcrumb>
          <BreadcrumbPage>Current Page</BreadcrumbPage>
        </Breadcrumb>,
      );

      const page = screen.getByRole('link');
      expect(page).toHaveAttribute('aria-current', 'page');
    });

    it('renders children correctly', () => {
      render(
        <Breadcrumb>
          <BreadcrumbPage>My Current Page</BreadcrumbPage>
        </Breadcrumb>,
      );

      expect(screen.getByText('My Current Page')).toBeInTheDocument();
    });
  });

  describe('Complete Breadcrumb Example', () => {
    it('renders a complete breadcrumb navigation', () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbEllipsis />
          <BreadcrumbSeparator />
          <BreadcrumbItem dropdown>Category</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem href="/products">Products</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Product Details</BreadcrumbPage>
        </Breadcrumb>,
      );

      // Check all items are rendered
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Product Details')).toBeInTheDocument();

      // Check links
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3); // Home, Products, and Product Details (BreadcrumbPage)
      expect(links[0]).toHaveAttribute('href', '/');
      expect(links[1]).toHaveAttribute('href', '/products');

      // Check current page
      const currentPage = screen.getByText('Product Details');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Current</BreadcrumbPage>
        </Breadcrumb>,
      );

      const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
      expect(nav).toHaveAttribute('aria-label', 'breadcrumb');

      const separator = container.querySelector('li[role="presentation"]');
      expect(separator).toHaveAttribute('aria-hidden', 'true');

      const currentPage = screen.getByText('Current');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('maintains keyboard navigation', () => {
      const handleClick = vi.fn();
      render(
        <Breadcrumb>
          <BreadcrumbItem onClick={handleClick}>Clickable</BreadcrumbItem>
        </Breadcrumb>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Buttons are keyboard accessible by default
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
