import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders with default props', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Checkbox label="Test label" />);
    expect(screen.getByText('Test label')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<Checkbox label="Label" description="Description text" />);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('handles checked state', () => {
    render(<Checkbox checked={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('handles unchecked state', () => {
    render(<Checkbox checked={false} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('handles onCheckedChange callback', () => {
    const handleChange = vi.fn();
    render(<Checkbox onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('associates label with checkbox via id', () => {
    render(<Checkbox id="test-checkbox" label="Click me" />);
    const label = screen.getByText('Click me');
    expect(label).toHaveAttribute('for', 'test-checkbox');
  });

  it('clicking label toggles checkbox', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Toggle me" onCheckedChange={handleChange} />);

    const label = screen.getByText('Toggle me');
    fireEvent.click(label);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});

describe('Checkbox - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Checkbox />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when checked', () => {
    const { container } = render(<Checkbox checked={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when unchecked', () => {
    const { container } = render(<Checkbox checked={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when disabled', () => {
    const { container } = render(<Checkbox disabled />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when disabled and checked', () => {
    const { container } = render(<Checkbox disabled checked={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with label', () => {
    const { container } = render(<Checkbox label="Test label" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with label and description', () => {
    const { container } = render(<Checkbox label="Label" description="Description text" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<Checkbox className="custom-checkbox" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with label and checked', () => {
    const { container } = render(<Checkbox label="Checked label" checked={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
