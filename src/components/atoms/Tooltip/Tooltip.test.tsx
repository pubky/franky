import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';

describe('Tooltip', () => {
  it('renders trigger without errors', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('shows tooltip content on hover', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByText('Hover me');
    await user.hover(trigger);

    await waitFor(() => {
      const tooltips = screen.getAllByText('Tooltip content');
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });

  it('initially hides tooltip content', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });

  it('applies custom className to TooltipContent', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent className="custom-tooltip">Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByText('Hover me');
    await user.hover(trigger);

    await waitFor(() => {
      const tooltips = screen.getAllByText('Tooltip content');
      const visibleTooltip = tooltips.find((el) => el.className.includes('custom-tooltip'));
      expect(visibleTooltip).toHaveClass('custom-tooltip');
    });
  });

  it('renders with custom sideOffset', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent sideOffset={10}>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByText('Hover me');
    await user.hover(trigger);

    await waitFor(() => {
      const tooltips = screen.getAllByText('Tooltip content');
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });

  it('can be controlled with open state', async () => {
    const { rerender } = render(
      <TooltipProvider>
        <Tooltip open={false}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.queryAllByText('Tooltip content').length).toBe(0);

    rerender(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    await waitFor(() => {
      const tooltips = screen.getAllByText('Tooltip content');
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });

  it('renders trigger as child component', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Click me</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();

    const trigger = screen.getByRole('button');
    await user.hover(trigger);

    await waitFor(() => {
      const tooltips = screen.getAllByText('Tooltip content');
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });

  it('supports delay duration', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByText('Hover me');
    await user.hover(trigger);

    await waitFor(() => {
      const tooltips = screen.getAllByText('Tooltip content');
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });

  it('has correct display name', () => {
    expect(TooltipContent.displayName).toBe('TooltipContent');
  });
});

describe('Tooltip - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent className="custom-class">Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom sideOffset', () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent sideOffset={20}>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
