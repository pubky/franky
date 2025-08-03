import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders with default props', () => {
    render(<Container data-testid="container">Test content</Container>);

    const container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    expect(container.tagName).toBe('DIV');
    expect(container).toHaveClass('mx-auto', 'w-full', 'flex-col', 'flex');
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders different HTML elements', () => {
    const { rerender } = render(
      <Container as="section" data-testid="container">
        Content
      </Container>,
    );

    let container = screen.getByTestId('container');
    expect(container.tagName).toBe('SECTION');

    rerender(
      <Container as="main" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container.tagName).toBe('MAIN');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(
      <Container size="sm" data-testid="container">
        Content
      </Container>,
    );

    let container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-screen-sm');

    rerender(
      <Container size="md" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-screen-md');

    rerender(
      <Container size="lg" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-screen-lg');

    rerender(
      <Container size="xl" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-screen-xl');

    rerender(
      <Container size="container" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('container');
  });

  it('renders different display modes correctly', () => {
    const { rerender } = render(
      <Container display="grid" data-testid="container">
        Content
      </Container>,
    );

    let container = screen.getByTestId('container');
    expect(container).toHaveClass('grid');

    rerender(
      <Container display="block" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('block');

    rerender(
      <Container display="flex" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('flex');
  });

  it('applies custom className', () => {
    render(
      <Container className="custom-container" data-testid="container">
        Content
      </Container>,
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('custom-container');
  });

  it('combines all props correctly', () => {
    render(
      <Container as="article" size="lg" display="grid" className="custom" data-testid="container">
        Combined props content
      </Container>,
    );

    const container = screen.getByTestId('container');
    expect(container.tagName).toBe('ARTICLE');
    expect(container).toHaveClass('mx-auto', 'w-full', 'flex-col', 'grid', 'max-w-screen-lg', 'custom');
  });
});
