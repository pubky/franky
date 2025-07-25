import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from './Card';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-card', 'text-card-foreground', 'rounded-xl', 'border');
  });

  it('applies custom className', () => {
    render(
      <Card data-testid="card" className="custom-class">
        Card content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('renders card header correctly', () => {
    render(<CardHeader data-testid="card-header">Header content</CardHeader>);
    const header = screen.getByTestId('card-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('data-slot', 'card-header');
  });

  it('renders card title correctly', () => {
    render(<CardTitle data-testid="card-title">Title</CardTitle>);
    const title = screen.getByTestId('card-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute('data-slot', 'card-title');
    expect(title).toHaveClass('leading-none', 'font-semibold');
  });

  it('renders card description correctly', () => {
    render(<CardDescription data-testid="card-description">Description</CardDescription>);
    const description = screen.getByTestId('card-description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute('data-slot', 'card-description');
    expect(description).toHaveClass('text-muted-foreground', 'text-sm');
  });

  it('renders card content correctly', () => {
    render(<CardContent data-testid="card-content">Content</CardContent>);
    const content = screen.getByTestId('card-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute('data-slot', 'card-content');
    expect(content).toHaveClass('px-6');
  });

  it('renders card footer correctly', () => {
    render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
    const footer = screen.getByTestId('card-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveAttribute('data-slot', 'card-footer');
    expect(footer).toHaveClass('flex', 'items-center', 'px-6');
  });

  it('renders card action correctly', () => {
    render(<CardAction data-testid="card-action">Action</CardAction>);
    const action = screen.getByTestId('card-action');
    expect(action).toBeInTheDocument();
    expect(action).toHaveAttribute('data-slot', 'card-action');
  });

  it('renders complete card structure', () => {
    render(
      <Card data-testid="complete-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId('complete-card')).toBeInTheDocument();
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });
});
