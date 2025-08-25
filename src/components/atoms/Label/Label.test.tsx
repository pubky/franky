import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './Label';

describe('Label', () => {
  it('renders with default props', () => {
    render(<Label>Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveClass('flex', 'items-center', 'gap-2', 'text-sm', 'leading-none', 'font-medium', 'select-none');
    expect(label).toHaveAttribute('data-slot', 'label');
  });

  it('applies custom className', () => {
    render(<Label className="custom-label">Custom Label</Label>);
    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-label');
  });

  it('forwards additional props', () => {
    render(<Label htmlFor="test-input" data-testid="label">Form Label</Label>);
    const label = screen.getByTestId('label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('renders children correctly', () => {
    render(
      <Label>
        <span>Complex Label</span>
      </Label>,
    );
    expect(screen.getByText('Complex Label')).toBeInTheDocument();
  });

  it('handles peer-disabled state', () => {
    render(<Label>Disabled Label</Label>);
    const label = screen.getByText('Disabled Label');
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-50');
  });

  it('works with form input association', () => {
    render(
      <div>
        <Label htmlFor="username">Username</Label>
        <input id="username" type="text" />
      </div>,
    );
    
    const label = screen.getByText('Username');
    const input = screen.getByRole('textbox');
    
    expect(label).toHaveAttribute('for', 'username');
    expect(input).toHaveAttribute('id', 'username');
  });

  it('applies focus and disabled state classes correctly', () => {
    render(<Label data-testid="label">State Label</Label>);
    const label = screen.getByTestId('label');
    
    // Check that the base classes include focus and disabled handling
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-50', 'group-data-[disabled=true]:pointer-events-none', 'group-data-[disabled=true]:opacity-50');
  });
});
