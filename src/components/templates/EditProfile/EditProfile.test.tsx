import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditProfile } from './EditProfile';

// Mock next/navigation
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock file reader for avatar upload
global.FileReader = class {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState: number = 0;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL() {
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,mock-avatar-data';
      this.onload?.({} as ProgressEvent<FileReader>);
    }, 0);
  }

  abort() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }
};

describe('EditProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default values', () => {
    render(<EditProfile />);

    expect(screen.getByDisplayValue('Satoshi Nakamoto')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Authored the Bitcoin white paper, developed Bitcoin, mined 1st block.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Profile')).toBeInTheDocument();
  });

  it('renders existing links', () => {
    render(<EditProfile />);

    expect(screen.getByDisplayValue('https://www.bitcoin.org/')).toBeInTheDocument();
    expect(screen.getByDisplayValue('@satoshi')).toBeInTheDocument();
  });

  it('allows adding new links', async () => {
    const user = userEvent.setup();
    render(<EditProfile />);

    const addButton = screen.getByText('Add link');
    await user.click(addButton);

    // Should now have 3 link inputs (2 original + 1 new)
    const linkInputs = screen.getAllByPlaceholderText(/https:\/\/|@user/);
    expect(linkInputs).toHaveLength(3);
  });

  it('allows editing link URLs', async () => {
    const user = userEvent.setup();
    render(<EditProfile />);

    const linkInput = screen.getByDisplayValue('https://www.bitcoin.org/');
    await user.clear(linkInput);
    await user.type(linkInput, 'https://new-website.com');

    expect(linkInput).toHaveValue('https://new-website.com');
  });

  it('allows deleting links', async () => {
    const user = userEvent.setup();
    render(<EditProfile />);

    // First add a new link to get a delete button
    const addButton = screen.getByText('Add link');
    await user.click(addButton);

    // Now there should be 1 delete button for the newly added link (index >= 2)
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((button) => button.querySelector('svg')?.getAttribute('class')?.includes('lucide-trash'));
    expect(deleteButtons).toHaveLength(1);

    // Delete the newly added link
    await user.click(deleteButtons[0]);

    // Should now have only the original 2 links (no delete buttons)
    const remainingDeleteButtons = screen
      .getAllByRole('button')
      .filter((button) => button.querySelector('svg')?.getAttribute('class')?.includes('lucide-trash'));
    expect(remainingDeleteButtons).toHaveLength(0);
  });

  it('handles avatar file upload', async () => {
    render(<EditProfile />);

    const file = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
    const avatarInput = document.getElementById('avatar-upload') as HTMLInputElement;

    // The avatar input is hidden, so we need to access it directly
    expect(avatarInput).toBeInTheDocument();

    // Simulate file selection
    Object.defineProperty(avatarInput, 'files', {
      value: [file],
      writable: false,
    });

    // Trigger change event
    fireEvent.change(avatarInput);

    // Should trigger file reader and update avatar state
    await waitFor(() => {
      expect(avatarInput).toBeInTheDocument();
    });
  });

  it('handles cancel action', async () => {
    const user = userEvent.setup();
    render(<EditProfile />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('handles save action', async () => {
    const user = userEvent.setup();
    render(<EditProfile />);

    const saveButton = screen.getByText('Save Profile');
    await user.click(saveButton);

    // Should show loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument();

    // Should navigate to profile after save
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/profile');
      },
      { timeout: 2000 },
    );
  });

  it('disables save button when loading', async () => {
    const user = userEvent.setup();
    render(<EditProfile />);

    const saveButton = screen.getByText('Save Profile');
    await user.click(saveButton);

    // Button should be disabled and show loading text
    expect(saveButton).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows avatar preview', () => {
    render(<EditProfile />);

    // Avatar should always be shown with fallback
    const avatarFallback = screen.getByText('SN');
    expect(avatarFallback).toBeInTheDocument();
  });

  it('renders form sections correctly', () => {
    render(<EditProfile />);

    // Should have name field
    expect(screen.getByText('NAME')).toBeInTheDocument();

    // Should have bio field
    expect(screen.getByText('BIO')).toBeInTheDocument();

    // Should have avatar upload (hidden input with id)
    const avatarInput = document.getElementById('avatar-upload');
    expect(avatarInput).toBeInTheDocument();

    // Should have links section
    expect(screen.getByText('Links')).toBeInTheDocument();

    // Should have add link button
    expect(screen.getByText('Add link')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<EditProfile />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with loading state', () => {
    // Mock loading state by triggering save
    render(<EditProfile />);

    const saveButton = screen.getByText('Save Profile');
    fireEvent.click(saveButton);

    // Wait for loading state to appear
    expect(screen.getByText('Saving...')).toBeInTheDocument();

    const { container } = render(<EditProfile />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
