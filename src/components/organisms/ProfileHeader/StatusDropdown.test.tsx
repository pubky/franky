import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  it('renders current status and default emoji when no selectedEmoji', () => {
    render(<StatusDropdown {...defaultProps} selectedEmoji="" />);

    expect(screen.getByText('Vacationing')).toBeInTheDocument();
    expect(screen.getByText('🌴')).toBeInTheDocument();
  });

  it('prefers selectedEmoji in trigger when provided', () => {
    render(<StatusDropdown {...defaultProps} />);

    // Trigger shows selectedEmoji
    const trigger = screen.getByTestId('popover-trigger');
    expect(trigger).toHaveTextContent('😊');
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
    expect(screen.getAllByText('Vacationing')).toHaveLength(2);
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

  it('renders custom status section and emoji button', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} />);

    expect(screen.getByText('CUSTOM STATUS')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add status')).toBeInTheDocument();
    // The emoji appears in both trigger and button; assert the button via title
    const emojiButton = screen.getByTitle('Click to change emoji');
    expect(emojiButton).toBeInTheDocument();
    expect(emojiButton).toHaveTextContent('😊');
  });

  it('emits onEmojiPickerClick when emoji button is clicked', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} />);

    const emojiButton = screen.getByTitle('Click to change emoji');
    fireEvent.click(emojiButton);

    expect(defaultProps.onEmojiPickerClick).toHaveBeenCalled();
  });

  it('shows save button when custom status has text', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} customStatus="Custom status" />);

    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find(
      (button) => button.querySelector('svg') && button.querySelector('svg')?.classList.contains('w-4'),
    );
    expect(saveButton).toBeInTheDocument();
  });

  it('calls onCustomStatusSave when save button is clicked', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} customStatus="Custom status" />);

    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find(
      (button) => button.querySelector('svg') && button.querySelector('svg')?.classList.contains('w-4'),
    );
    if (saveButton) fireEvent.click(saveButton);

    expect(defaultProps.onCustomStatusSave).toHaveBeenCalled();
  });

  it('hides save button when custom status is empty', () => {
    render(<StatusDropdown {...defaultProps} showStatusMenu={true} customStatus="" />);

    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find(
      (button) => button.querySelector('svg') && button.querySelector('svg')?.classList.contains('w-4'),
    );
    expect(saveButton).toBeUndefined();
  });
});
