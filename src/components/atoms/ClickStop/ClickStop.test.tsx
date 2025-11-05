import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClickStop } from './ClickStop';

describe('ClickStop', () => {
  it('renders with default props', () => {
    render(<ClickStop>Default ClickStop</ClickStop>);
    const element = screen.getByText('Default ClickStop');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveAttribute('data-testid', 'click-stop');
  });

  it('stops event propagation on click', () => {
    const parentClickHandler = vi.fn();
    const childClickHandler = vi.fn();

    render(
      <div onClick={parentClickHandler}>
        <ClickStop onClick={childClickHandler}>
          <button>Click me</button>
        </ClickStop>
      </div>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Child click handler should be called
    expect(childClickHandler).toHaveBeenCalledTimes(1);
    // Parent click handler should NOT be called because propagation was stopped
    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it('calls custom onClick handler after stopping propagation', () => {
    const customClickHandler = vi.fn();
    const parentClickHandler = vi.fn();

    render(
      <div onClick={parentClickHandler}>
        <ClickStop onClick={customClickHandler}>
          <button>Click me</button>
        </ClickStop>
      </div>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(customClickHandler).toHaveBeenCalledTimes(1);
    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it('renders as different HTML element when as prop is provided', () => {
    render(<ClickStop as="span">Span Element</ClickStop>);
    const element = screen.getByText('Span Element');
    expect(element.tagName).toBe('SPAN');
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

  it('forwards additional HTML attributes', () => {
    render(
      <ClickStop id="test-id" aria-label="Test label" data-custom="test-value">
        Test Content
      </ClickStop>,
    );
    const element = screen.getByText('Test Content');
    expect(element).toHaveAttribute('id', 'test-id');
    expect(element).toHaveAttribute('aria-label', 'Test label');
    expect(element).toHaveAttribute('data-custom', 'test-value');
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
    const middleClickHandler = vi.fn();
    const innerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <ClickStop onClick={middleClickHandler}>
          <ClickStop onClick={innerClickHandler}>
            <button>Nested Button</button>
          </ClickStop>
        </ClickStop>
      </div>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Inner handler should be called
    expect(innerClickHandler).toHaveBeenCalledTimes(1);
    // Middle handler should NOT be called because inner ClickStop stops propagation
    expect(middleClickHandler).not.toHaveBeenCalled();
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

  it('matches snapshot for span element', () => {
    const { container } = render(<ClickStop as="span">Span Element</ClickStop>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for section element', () => {
    const { container } = render(<ClickStop as="section">Section Element</ClickStop>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for article element', () => {
    const { container } = render(<ClickStop as="article">Article Element</ClickStop>);
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

  it('matches snapshot with combined props', () => {
    const { container } = render(
      <ClickStop as="section" className="custom-class" data-testid="test-id" id="test">
        Combined Props
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
