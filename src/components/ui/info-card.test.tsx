import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Shield, AlertTriangle, Check, Info } from 'lucide-react';
import { InfoCard } from './info-card';

describe('InfoCard', () => {
  it('should render title and content correctly', () => {
    render(
      <InfoCard title="Test Title" icon={Info}>
        <p>Test content</p>
      </InfoCard>,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render with default info variant', () => {
    const { container } = render(
      <InfoCard title="Test Title" icon={Info}>
        <p>Test content</p>
      </InfoCard>,
    );

    const cardElement = container.querySelector('.border-l-blue-500\\/30');
    expect(cardElement).toBeInTheDocument();

    const iconElement = container.querySelector('.text-blue-600');
    expect(iconElement).toBeInTheDocument();
  });

  it('should render with success variant', () => {
    const { container } = render(
      <InfoCard title="Success Title" icon={Check} variant="success">
        <p>Success content</p>
      </InfoCard>,
    );

    const cardElement = container.querySelector('.border-l-green-500\\/30');
    expect(cardElement).toBeInTheDocument();

    const iconElement = container.querySelector('.text-green-600');
    expect(iconElement).toBeInTheDocument();
  });

  it('should render with warning variant', () => {
    const { container } = render(
      <InfoCard title="Warning Title" icon={AlertTriangle} variant="warning">
        <p>Warning content</p>
      </InfoCard>,
    );

    const cardElement = container.querySelector('.border-l-orange-500\\/30');
    expect(cardElement).toBeInTheDocument();

    const iconElement = container.querySelector('.text-orange-600');
    expect(iconElement).toBeInTheDocument();
  });

  it('should render with amber variant', () => {
    const { container } = render(
      <InfoCard title="Amber Title" icon={Shield} variant="amber">
        <p>Amber content</p>
      </InfoCard>,
    );

    const cardElement = container.querySelector('.border-l-amber-500\\/30');
    expect(cardElement).toBeInTheDocument();

    const iconElement = container.querySelector('.text-amber-600');
    expect(iconElement).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <InfoCard title="Test Title" icon={Info} className="custom-class">
        <p>Test content</p>
      </InfoCard>,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render complex children content', () => {
    render(
      <InfoCard title="Complex Content" icon={Shield}>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </InfoCard>,
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should have proper responsive classes', () => {
    const { container } = render(
      <InfoCard title="Responsive Test" icon={Info}>
        <p>Content</p>
      </InfoCard>,
    );

    // Check for responsive padding
    const cardElement = container.querySelector('.p-3.sm\\:p-4');
    expect(cardElement).toBeInTheDocument();

    // Check for responsive flex direction
    const flexElement = container.querySelector('.flex-col.sm\\:flex-row');
    expect(flexElement).toBeInTheDocument();

    // Check for responsive text sizing
    const textElement = container.querySelector('.text-xs.sm\\:text-sm');
    expect(textElement).toBeInTheDocument();
  });
});
