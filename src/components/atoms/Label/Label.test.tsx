import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Label } from './Label';

describe('Label - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Label>Default Label</Label>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: customContainer } = render(<Label className="custom-label">Custom Label</Label>);
    expect(customContainer.firstChild).toMatchSnapshot();

    const { container: formContainer } = render(<Label htmlFor="test-input">Form Label</Label>);
    expect(formContainer.firstChild).toMatchSnapshot();

    const { container: complexContainer } = render(
      <Label>
        <span>Complex Label</span>
      </Label>,
    );
    expect(complexContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for form association', () => {
    const { container } = render(
      <div>
        <Label htmlFor="username">Username</Label>
        <input id="username" type="text" />
      </div>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
