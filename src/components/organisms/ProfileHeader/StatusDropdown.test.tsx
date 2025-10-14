import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusDropdown } from './StatusDropdown';

describe('StatusDropdown', () => {
  const defaultProps = {
    currentStatus: 'Vacationing',
    customStatus: '',
    selectedEmoji: '😊',
    showStatusMenu: false,
    onStatusMenuChange: vi.fn(),
    onStatusSelect: vi.fn(),
    onCustomStatusChange: vi.fn(),
    onCustomStatusSave: vi.fn(),
    onEmojiPickerClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders current status and emoji', () => {
    render(<StatusDropdown {...defaultProps} />);

    expect(screen.getByText('Vacationing')).toBeInTheDocument();
    expect(screen.getByText('🌴')).toBeInTheDocument(); // Default emoji for Vacationing
  });

  it('shows chevron down icon', () => {
    render(<StatusDropdown {...defaultProps} />);

    const chevron = screen.getByTestId('popover-trigger');
    expect(chevron).toBeInTheDocument();
  });

  it('rotates chevron when menu is open', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} />);

    const chevron = screen.getByTestId('popover-trigger');
    const svg = chevron.querySelector('svg');
    expect(svg).toHaveClass('rotate-180');
  });

  it('calls onStatusMenuChange when trigger is clicked', () => {
    render(<StatusDropdown {...defaultProps} />);

    const trigger = screen.getByTestId('popover-trigger');
    fireEvent.click(trigger);

    expect(defaultProps.onStatusMenuChange).toHaveBeenCalledWith(true);
  });

  it('renders all status options when menu is open', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} />);

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Away')).toBeInTheDocument();
    expect(screen.getAllByText('Vacationing')).toHaveLength(2); // One in trigger, one in dropdown
    expect(screen.getByText('Working')).toBeInTheDocument();
    expect(screen.getByText('Traveling')).toBeInTheDocument();
    expect(screen.getByText('Celebrating')).toBeInTheDocument();
    expect(screen.getByText('Sick')).toBeInTheDocument();
    expect(screen.getByText('No Status')).toBeInTheDocument();
  });

  it('calls onStatusSelect when status option is clicked', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} />);

    const availableOption = screen.getByText('Available');
    fireEvent.click(availableOption);

    expect(defaultProps.onStatusSelect).toHaveBeenCalledWith('Available');
  });

  it('renders custom status section', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} />);

    expect(screen.getByText('CUSTOM STATUS')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add status')).toBeInTheDocument();
  });

  it('calls onCustomStatusChange when input value changes', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} />);

    const input = screen.getByPlaceholderText('Add status');
    fireEvent.change(input, { target: { value: 'Custom status' } });

    expect(defaultProps.onCustomStatusChange).toHaveBeenCalledWith('Custom status');
  });

  it('shows emoji picker button with selected emoji', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} />);

    const emojiButton = screen.getByText('😊');
    expect(emojiButton).toBeInTheDocument();
  });

  it('calls onEmojiPickerClick when emoji button is clicked', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} />);

    const emojiButton = screen.getByText('😊');
    fireEvent.click(emojiButton);

    expect(defaultProps.onEmojiPickerClick).toHaveBeenCalled();
  });

  it('shows save button when custom status has text', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} customStatus="Custom status" />);

    // Look for the button that contains the Plus icon by checking for SVG elements
    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find(
      (button) => button.querySelector('svg') && button.querySelector('svg')?.classList.contains('w-4'),
    );
    expect(saveButton).toBeInTheDocument();
  });

  it('calls onCustomStatusSave when save button is clicked', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} customStatus="Custom status" />);

    // Look for the button that contains the Plus icon
    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find(
      (button) => button.querySelector('svg') && button.querySelector('svg')?.classList.contains('w-4'),
    );
    if (saveButton) {
      fireEvent.click(saveButton);
    }

    expect(defaultProps.onCustomStatusSave).toHaveBeenCalled();
  });

  it('hides save button when custom status is empty', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} customStatus="" />);

    // The save button should not be rendered when customStatus is empty
    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find(
      (button) => button.querySelector('svg') && button.querySelector('svg')?.classList.contains('w-4'),
    );
    expect(saveButton).toBeUndefined();
  });
});
