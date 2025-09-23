import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders with default props', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const breadcrumb = screen.getByTestId('breadcrumb');
    expect(breadcrumb).toBeInTheDocument();
    expect(breadcrumb).toHaveAttribute('aria-label', 'breadcrumb');
    expect(breadcrumb).toHaveAttribute('data-slot', 'breadcrumb');
  });

  it('applies custom className', () => {
    render(<Breadcrumb className="custom-breadcrumb" />);
    const breadcrumb = screen.getByTestId('breadcrumb');
    expect(breadcrumb).toHaveClass('custom-breadcrumb');
  });

  it('forwards additional props', () => {
    render(<Breadcrumb data-custom="test" />);
    const breadcrumb = screen.getByTestId('breadcrumb');
    expect(breadcrumb).toHaveAttribute('data-custom', 'test');
  });
});

describe('BreadcrumbList', () => {
  it('renders as ordered list', () => {
    render(
      <BreadcrumbList>
        <BreadcrumbItem>Item</BreadcrumbItem>
      </BreadcrumbList>,
    );

    const list = screen.getByTestId('breadcrumb-list');
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe('OL');
    expect(list).toHaveAttribute('data-slot', 'breadcrumb-list');
  });

  it('has correct styling classes', () => {
    render(<BreadcrumbList />);
    const list = screen.getByTestId('breadcrumb-list');
    expect(list).toHaveClass('flex', 'flex-wrap', 'items-center', 'gap-1.5', 'break-words', 'text-sm');
  });
});

describe('BreadcrumbItem', () => {
  it('renders as list item', () => {
    render(<BreadcrumbItem>Item content</BreadcrumbItem>);

    const item = screen.getByTestId('breadcrumb-item');
    expect(item).toBeInTheDocument();
    expect(item.tagName).toBe('LI');
    expect(item).toHaveAttribute('data-slot', 'breadcrumb-item');
    expect(screen.getByText('Item content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<BreadcrumbItem className="custom-item">Content</BreadcrumbItem>);
    const item = screen.getByTestId('breadcrumb-item');
    expect(item).toHaveClass('custom-item');
  });
});

describe('BreadcrumbLink', () => {
  it('renders as anchor by default', () => {
    render(<BreadcrumbLink href="/test">Link text</BreadcrumbLink>);

    const link = screen.getByTestId('breadcrumb-link');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveAttribute('data-slot', 'breadcrumb-link');
    expect(screen.getByText('Link text')).toBeInTheDocument();
  });

  it('renders with hover styles', () => {
    render(<BreadcrumbLink href="/test">Link</BreadcrumbLink>);
    const link = screen.getByTestId('breadcrumb-link');
    expect(link).toHaveClass('transition-colors', 'hover:text-foreground');
  });

  it('supports asChild prop', () => {
    render(
      <BreadcrumbLink asChild>
        <button onClick={() => {}}>Custom Link</button>
      </BreadcrumbLink>,
    );

    const button = screen.getByRole('button', { name: 'Custom Link' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-slot', 'breadcrumb-link');
  });

  it('applies custom className', () => {
    render(
      <BreadcrumbLink className="custom-link" href="/test">
        Link
      </BreadcrumbLink>,
    );
    const link = screen.getByTestId('breadcrumb-link');
    expect(link).toHaveClass('custom-link');
  });
});

describe('BreadcrumbPage', () => {
  it('renders current page with correct attributes', () => {
    render(<BreadcrumbPage>Current Page</BreadcrumbPage>);

    const page = screen.getByTestId('breadcrumb-page');
    expect(page).toBeInTheDocument();
    expect(page.tagName).toBe('SPAN');
    expect(page).toHaveAttribute('role', 'link');
    expect(page).toHaveAttribute('aria-disabled', 'true');
    expect(page).toHaveAttribute('aria-current', 'page');
    expect(page).toHaveAttribute('data-slot', 'breadcrumb-page');
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('has correct styling', () => {
    render(<BreadcrumbPage>Page</BreadcrumbPage>);
    const page = screen.getByTestId('breadcrumb-page');
    expect(page).toHaveClass('font-normal', 'text-foreground');
  });

  it('applies custom className', () => {
    render(<BreadcrumbPage className="custom-page">Page</BreadcrumbPage>);
    const page = screen.getByTestId('breadcrumb-page');
    expect(page).toHaveClass('custom-page');
  });
});

describe('BreadcrumbSeparator', () => {
  it('renders with default chevron icon', () => {
    render(<BreadcrumbSeparator />);

    const separator = screen.getByTestId('breadcrumb-separator');
    expect(separator).toBeInTheDocument();
    expect(separator.tagName).toBe('LI');
    expect(separator).toHaveAttribute('role', 'presentation');
    expect(separator).toHaveAttribute('aria-hidden', 'true');
    expect(separator).toHaveAttribute('data-slot', 'breadcrumb-separator');
  });

  it('renders custom separator content', () => {
    render(<BreadcrumbSeparator>/</BreadcrumbSeparator>);
    const separator = screen.getByTestId('breadcrumb-separator');
    expect(separator).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(<BreadcrumbSeparator />);
    const separator = screen.getByTestId('breadcrumb-separator');
    expect(separator).toHaveClass('[&>svg]:size-3.5');
  });

  it('applies custom className', () => {
    render(<BreadcrumbSeparator className="custom-separator" />);
    const separator = screen.getByTestId('breadcrumb-separator');
    expect(separator).toHaveClass('custom-separator');
  });
});

describe('Breadcrumb - Complete component', () => {
  it('renders complete breadcrumb navigation', () => {
    render(
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
            <BreadcrumbPage>Laptop</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('breadcrumb-item')).toHaveLength(3);
    expect(screen.getAllByTestId('breadcrumb-link')).toHaveLength(2);
    expect(screen.getAllByTestId('breadcrumb-separator')).toHaveLength(2);
    expect(screen.getByTestId('breadcrumb-page')).toBeInTheDocument();

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Laptop')).toBeInTheDocument();
  });

  it('has proper navigation structure', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const nav = screen.getByTestId('breadcrumb');
    const list = screen.getByTestId('breadcrumb-list');
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const currentPage = screen.getByTestId('breadcrumb-page');

    expect(nav).toContainElement(list);
    expect(list).toContainElement(homeLink);
    expect(list).toContainElement(currentPage);
    expect(homeLink).toHaveAttribute('href', '/');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });
});
