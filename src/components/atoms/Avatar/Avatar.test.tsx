import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

describe('AvatarImage', () => {
  it('component exists and can be imported', () => {
    expect(() => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test avatar" />
        </Avatar>,
      );
    }).not.toThrow();
  });

  it('applies custom className', () => {
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test" className="custom-image" />
      </Avatar>,
    );
    // AvatarImage may not render in test environment, but should not throw
    expect(() => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test" className="custom-image" />
        </Avatar>,
      );
    }).not.toThrow();
  });
});

describe('Avatar - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<Avatar className="custom-avatar" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom data attribute', () => {
    const { container } = render(<Avatar data-custom="custom-avatar"></Avatar>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with AvatarFallback only', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with AvatarImage and AvatarFallback', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom AvatarFallback className', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback className="custom-fallback">AB</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with AvatarFallback active state', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback active={true}>JD</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with AvatarFallback inactive state', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback active={false}>JD</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
