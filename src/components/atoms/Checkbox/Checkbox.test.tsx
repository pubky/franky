import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { normaliseRadixIds } from '@/libs/utils/utils';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders with default props', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('handles onCheckedChange callback', () => {
    const handleChange = vi.fn();
    render(<Checkbox onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('clicking label toggles checkbox', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Toggle me" onCheckedChange={handleChange} />);

    const label = screen.getByText('Toggle me');
    fireEvent.click(label);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});

// Use normaliseRadixIds to ensure the snapshots are consistent.
describe('Checkbox - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Checkbox />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when checked', () => {
    const { container } = render(<Checkbox checked={true} />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when unchecked', () => {
    const { container } = render(<Checkbox checked={false} />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when disabled', () => {
    const { container } = render(<Checkbox disabled />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when disabled and checked', () => {
    const { container } = render(<Checkbox disabled checked={true} />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with label', () => {
    const { container } = render(<Checkbox label="Test label" />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with label and description', () => {
    const { container } = render(<Checkbox label="Label" description="Description text" />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with label, description and checked', () => {
    const { container } = render(<Checkbox label="Checked label" description="Description text" checked={true} />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });
});
