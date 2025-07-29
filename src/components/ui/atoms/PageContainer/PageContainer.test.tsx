import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageContainer } from './PageContainer';

describe('PageContainer', () => {
  it('renders with default props', () => {
    render(<PageContainer>Test Content</PageContainer>);

    const container = screen.getByText('Test Content');
    expect(container).toBeInTheDocument();
  });

  it('applies default size classes', () => {
    const { container } = render(<PageContainer>Test Content</PageContainer>);

    const pageContainer = container.firstChild as HTMLElement;
    expect(pageContainer.className).toContain('container');
    expect(pageContainer.className).toContain('mx-auto');
    expect(pageContainer.className).toContain('px-6');
  });

  it('renders as main element when specified', () => {
    render(<PageContainer as="main">Test Content</PageContainer>);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveTextContent('Test Content');
  });

  it('applies narrow size classes', () => {
    const { container } = render(<PageContainer size="narrow">Test Content</PageContainer>);

    const pageContainer = container.firstChild as HTMLElement;
    expect(pageContainer.className).toContain('max-w-[588px]');
  });

  it('applies wide size classes', () => {
    const { container } = render(<PageContainer size="wide">Test Content</PageContainer>);

    const pageContainer = container.firstChild as HTMLElement;
    expect(pageContainer.className).toContain('max-w-[1200px]');
  });

  it('applies custom className', () => {
    const { container } = render(<PageContainer className="custom-class">Test Content</PageContainer>);

    const pageContainer = container.firstChild as HTMLElement;
    expect(pageContainer).toHaveClass('custom-class');
  });
});
