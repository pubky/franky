import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Badge>Default Badge</Badge>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for all variants', () => {
    const { container: defaultContainer } = render(<Badge variant="default">Default</Badge>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: secondaryContainer } = render(<Badge variant="secondary">Secondary</Badge>);
    expect(secondaryContainer.firstChild).toMatchSnapshot();

    const { container: destructiveContainer } = render(<Badge variant="destructive">Destructive</Badge>);
    expect(destructiveContainer.firstChild).toMatchSnapshot();

    const { container: outlineContainer } = render(<Badge variant="outline">Outline</Badge>);
    expect(outlineContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: customContainer } = render(<Badge className="custom-badge">Custom</Badge>);
    expect(customContainer.firstChild).toMatchSnapshot();

    const { container: complexContainer } = render(
      <Badge>
        <span>Complex Content</span>
      </Badge>,
    );
    expect(complexContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for asChild prop', () => {
    const { container } = render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
