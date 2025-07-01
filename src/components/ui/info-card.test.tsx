import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('should render collapsible chevron when collapsible is true', () => {
    const { container } = render(
      <InfoCard title="Collapsible Test" icon={Info} collapsible>
        <p>Content</p>
      </InfoCard>,
    );

    // Should find both the main icon and the chevron
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements).toHaveLength(2); // Main icon + chevron
  });

  it('should not render chevron when collapsible is false', () => {
    const { container } = render(
      <InfoCard title="Non-collapsible Test" icon={Info} collapsible={false}>
        <p>Content</p>
      </InfoCard>,
    );

    // Should only find the main icon, not a chevron
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements).toHaveLength(1); // Only the main icon
  });

  it('should toggle content visibility when clicked and collapsible', () => {
    render(
      <InfoCard title="Toggle Test" icon={Info} collapsible>
        <p>Toggle content</p>
      </InfoCard>,
    );

    const titleElement = screen.getByText('Toggle Test');
    const contentElement = screen.getByText('Toggle content');

    // Content should be visible initially
    expect(contentElement).toBeVisible();

    // Click to collapse
    fireEvent.click(titleElement);

    // Content should be hidden (opacity-0 class applied)
    expect(contentElement.closest('.max-h-0')).toBeInTheDocument();

    // Click to expand
    fireEvent.click(titleElement);

    // Content should be visible again
    expect(contentElement.closest('.max-h-96')).toBeInTheDocument();
  });

  it('should start collapsed when defaultCollapsed is true', () => {
    render(
      <InfoCard title="Default Collapsed Test" icon={Info} collapsible defaultCollapsed>
        <p>Collapsed content</p>
      </InfoCard>,
    );

    const contentElement = screen.getByText('Collapsed content');

    // Content should start collapsed
    expect(contentElement.closest('.max-h-0')).toBeInTheDocument();
  });

  it('should have cursor pointer when collapsible', () => {
    const { container } = render(
      <InfoCard title="Cursor Test" icon={Info} collapsible>
        <p>Content</p>
      </InfoCard>,
    );

    const titleContainer = container.querySelector('.cursor-pointer');
    expect(titleContainer).toBeInTheDocument();
  });

  it('should not have cursor pointer when not collapsible', () => {
    const { container } = render(
      <InfoCard title="No Cursor Test" icon={Info} collapsible={false}>
        <p>Content</p>
      </InfoCard>,
    );

    const titleContainer = container.querySelector('.cursor-pointer');
    expect(titleContainer).not.toBeInTheDocument();
  });
});
