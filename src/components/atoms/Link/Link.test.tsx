/* eslint-disable @next/next/no-img-element */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Link } from './Link';

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
