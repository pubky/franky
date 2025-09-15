import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

describe('AvatarImage', () => {
  it('component exists and can be imported', () => {
    // AvatarImage is a Radix UI component that may not render in JSDOM
    // but we can test that it exists and can be rendered without errors
    expect(() => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test avatar" />
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

  it('matches snapshots for different configurations', () => {
    const { container: defaultContainer } = render(<Avatar />);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customContainer } = render(<Avatar className="custom-avatar" />);
    expect(customContainer.firstChild).toMatchSnapshot();

    const { container: customFallbackContainer } = render(<Avatar data-custom="custom-avatar"></Avatar>);
    expect(customFallbackContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different children configurations', () => {
    const { container: fallbackContainer } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(fallbackContainer.firstChild).toMatchSnapshot();

    const { container: imageFallbackContainer } = render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(imageFallbackContainer.firstChild).toMatchSnapshot();

    const { container: customFallbackContainer } = render(
      <Avatar>
        <AvatarFallback className="custom-fallback">AB</AvatarFallback>
      </Avatar>,
    );
    expect(customFallbackContainer.firstChild).toMatchSnapshot();
  });
});
