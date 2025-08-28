import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { List } from './List';

describe('List', () => {
  it('renders as ul by default', () => {
    render(
      <List>
        <li>Item 1</li>
        <li>Item 2</li>
      </List>,
    );

    const list = screen.getByTestId('list');
    expect(list.tagName).toBe('UL');
    expect(list).toHaveClass('list-disc');
  });

  it('renders as ol when specified', () => {
    render(
      <List as="ol">
        <li>Item 1</li>
        <li>Item 2</li>
      </List>,
    );

    const list = screen.getByTestId('list');
    expect(list.tagName).toBe('OL');
  });

  it('applies default variant classes', () => {
    render(
      <List>
        <li>Item 1</li>
      </List>,
    );

    const list = screen.getByTestId('list');
    expect(list).toHaveClass('list-disc');
  });

  it('applies decimal variant classes', () => {
    render(
      <List variant="decimal">
        <li>Item 1</li>
      </List>,
    );

    const list = screen.getByTestId('list');
    expect(list).toHaveClass('list-decimal');
  });

  it('applies none variant classes', () => {
    render(
      <List variant="none">
        <li>Item 1</li>
      </List>,
    );

    const list = screen.getByTestId('list');
    expect(list).toHaveClass('list-none');
  });

  it('applies custom className', () => {
    render(
      <List className="custom-list-class">
        <li>Item 1</li>
      </List>,
    );

    const list = screen.getByTestId('list');
    expect(list).toHaveClass('custom-list-class');
  });

  it('applies custom data-testid', () => {
    render(
      <List data-testid="custom-list">
        <li>Item 1</li>
      </List>,
    );

    const list = screen.getByTestId('custom-list');
    expect(list).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <List>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </List>,
    );

    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
    expect(screen.getByText('Third item')).toBeInTheDocument();
  });

  it('passes additional props to the element', () => {
    render(
      <List id="test-list" aria-label="Test list">
        <li>Item 1</li>
      </List>,
    );

    const list = screen.getByTestId('list');
    expect(list).toHaveAttribute('id', 'test-list');
    expect(list).toHaveAttribute('aria-label', 'Test list');
  });
});
