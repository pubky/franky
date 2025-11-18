import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClickStop } from './ClickStop';

vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    onClick,
    'data-testid': dataTestId,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    'data-testid'?: string;
  }) => (
    <div data-testid={dataTestId || 'container'} className={className} onClick={onClick}>
      {children}
    </div>
  ),
}));

describe('ClickStop', () => {
  it('renders with default props', () => {
    render(<ClickStop>Default ClickStop</ClickStop>);
    const element = screen.getByText('Default ClickStop');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveAttribute('data-testid', 'click-stop');
    expect(element.closest('[data-testid="click-stop"]')).toBeInTheDocument();
  });

  it('stops event propagation on click', () => {
    const parentClickHandler = vi.fn();

    render(
      <div onClick={parentClickHandler}>
        <ClickStop>
          <button>Click me</button>
        </ClickStop>
      </div>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Parent click handler should NOT be called because propagation was stopped
    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<ClickStop className="custom-class">Custom Class</ClickStop>);
    const element = screen.getByText('Custom Class');
    expect(element).toHaveClass('custom-class');
  });

  it('supports custom data-testid', () => {
    render(<ClickStop data-testid="custom-testid">Custom Test ID</ClickStop>);
    const element = screen.getByTestId('custom-testid');
    expect(element).toBeInTheDocument();
  });

  it('handles nested clickable elements correctly', () => {
    const parentClickHandler = vi.fn();
    const buttonClickHandler = vi.fn();
    const linkClickHandler = vi.fn();

    render(
      <div onClick={parentClickHandler}>
        <ClickStop>
          <button onClick={buttonClickHandler}>Button</button>
          <a href="#" onClick={linkClickHandler}>
            Link
          </a>
        </ClickStop>
      </div>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(buttonClickHandler).toHaveBeenCalledTimes(1);
    expect(parentClickHandler).not.toHaveBeenCalled();

    const link = screen.getByRole('link');
    fireEvent.click(link);
    expect(linkClickHandler).toHaveBeenCalledTimes(1);
    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it('works with multiple nested ClickStop components', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <ClickStop>
          <ClickStop>
            <button>Nested Button</button>
          </ClickStop>
        </ClickStop>
      </div>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Outer handler should NOT be called because propagation was stopped
    expect(outerClickHandler).not.toHaveBeenCalled();
  });
});

describe('ClickStop - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ClickStop>Default ClickStop</ClickStop>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with children', () => {
    const { container } = render(
      <ClickStop>
        <button>Click me</button>
      </ClickStop>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<ClickStop className="custom-class">Custom Class</ClickStop>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom data-testid', () => {
    const { container } = render(<ClickStop data-testid="custom-testid">Custom Test ID</ClickStop>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with multiple children', () => {
    const { container } = render(
      <ClickStop>
        <button>Button 1</button>
        <button>Button 2</button>
        <span>Text</span>
      </ClickStop>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with nested content', () => {
    const { container } = render(
      <ClickStop>
        <div>
          <h1>Title</h1>
          <p>Content</p>
        </div>
      </ClickStop>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
