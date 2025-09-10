/* eslint-disable @next/next/no-img-element */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Link } from './Link';

describe('SocialLink', () => {
  it('renders with default props', () => {
    render(
      <Link href="https://example.com">
        <span>Test Icon</span>
      </Link>,
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveClass('cursor-pointer', 'text-brand', 'hover:text-brand/80', 'transition-colors', 'text-sm');
    expect(screen.getByText('Test Icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <Link href="https://example.com" className="custom-link-class">
        <span>Test Icon</span>
      </Link>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveClass('custom-link-class');
  });

  it('renders different types of children', () => {
    const { rerender } = render(
      <Link href="https://example.com">
        <svg data-testid="svg-icon">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </Link>,
    );

    expect(screen.getByTestId('svg-icon')).toBeInTheDocument();

    rerender(
      <Link href="https://example.com">
        <img src="/icon.png" alt="Icon" data-testid="img-icon" />
      </Link>,
    );

    expect(screen.getByTestId('img-icon')).toBeInTheDocument();
  });

  it('handles different href formats', () => {
    const { rerender } = render(
      <Link href="mailto:test@example.com">
        <span>Email</span>
      </Link>,
    );

    let link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'mailto:test@example.com');

    rerender(
      <Link href="tel:+1234567890">
        <span>Phone</span>
      </Link>,
    );

    link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'tel:+1234567890');
  });
});

describe('Link - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(
      <Link href="https://example.com">
        <span>Default Link</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different variants', () => {
    const { container: defaultContainer } = render(
      <Link href="https://example.com" variant="default">
        <span>Default Variant</span>
      </Link>,
    );
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: mutedContainer } = render(
      <Link href="https://example.com" variant="muted">
        <span>Muted Variant</span>
      </Link>,
    );
    expect(mutedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different sizes', () => {
    const { container: defaultContainer } = render(
      <Link href="https://example.com" size="default">
        <span>Default Size</span>
      </Link>,
    );
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: lgContainer } = render(
      <Link href="https://example.com" size="lg">
        <span>Large Size</span>
      </Link>,
    );
    expect(lgContainer.firstChild).toMatchSnapshot();

    const { container: xlContainer } = render(
      <Link href="https://example.com" size="xl">
        <span>Extra Large Size</span>
      </Link>,
    );
    expect(xlContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different href types', () => {
    const { container: httpContainer } = render(
      <Link href="https://example.com">
        <span>HTTP Link</span>
      </Link>,
    );
    expect(httpContainer.firstChild).toMatchSnapshot();

    const { container: mailtoContainer } = render(
      <Link href="mailto:test@example.com">
        <span>Email Link</span>
      </Link>,
    );
    expect(mailtoContainer.firstChild).toMatchSnapshot();

    const { container: telContainer } = render(
      <Link href="tel:+1234567890">
        <span>Phone Link</span>
      </Link>,
    );
    expect(telContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different children types', () => {
    const { container: textContainer } = render(
      <Link href="https://example.com">
        <span>Text Link</span>
      </Link>,
    );
    expect(textContainer.firstChild).toMatchSnapshot();

    const { container: svgContainer } = render(
      <Link href="https://example.com">
        <svg data-testid="svg-icon">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </Link>,
    );
    expect(svgContainer.firstChild).toMatchSnapshot();

    const { container: imgContainer } = render(
      <Link href="https://example.com">
        <img src="/icon.png" alt="Icon" />
      </Link>,
    );
    expect(imgContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for combined props', () => {
    const { container: combinedContainer } = render(
      <Link href="https://example.com" variant="muted" size="lg" className="custom-class">
        <span>Combined Props Link</span>
      </Link>,
    );
    expect(combinedContainer.firstChild).toMatchSnapshot();
  });
});
