/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateProfileForm } from './CreateProfileForm';

// Mock the Core onboarding store
const mockUseOnboardingStore = vi.fn();
vi.mock('@/core', () => ({
  useOnboardingStore: () => mockUseOnboardingStore(),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Trash2: ({ className }: { className?: string }) => (
    <div data-testid="trash2-icon" className={className}>
      Trash2
    </div>
  ),
  File: ({ className }: { className?: string }) => (
    <div data-testid="file-icon" className={className}>
      File
    </div>
  ),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Heading: ({ children, level, className }: { children: React.ReactNode; level?: number; className?: string }) => (
    <div data-testid={`heading-${level || 1}`} className={className}>
      {children}
    </div>
  ),
  Avatar: ({
    children,
    className,
    onClick,
    role,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    role?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="avatar" className={className} onClick={onClick} role={role} {...props}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img data-testid="avatar-image" src={src} alt={alt} />,
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar-fallback" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    variant,
    size,
    className,
    onClick,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button
      data-testid={variant ? `button-${variant}` : 'button'}
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Typography: ({
    children,
    as,
    size,
    className,
  }: {
    children: React.ReactNode;
    as?: string;
    size?: string;
    className?: string;
  }) => {
    if (as === 'small') {
      return (
        <small data-testid="typography" data-as={as} data-size={size} className={className}>
          {children}
        </small>
      );
    }
    return (
      <p data-testid="typography" data-as={as} data-size={size} className={className}>
        {children}
      </p>
    );
  },
  InputField: ({
    label,
    placeholder,
    value,
    onChange,
    error,
  }: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
  }) => (
    <div data-testid="input-field">
      <label>{label}</label>
      <input data-testid="input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      {error && <span data-testid="input-error">{error}</span>}
    </div>
  ),
  TextareaField: ({
    label,
    placeholder,
    value,
    onChange,
    error,
  }: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
  }) => (
    <div data-testid="textarea-field">
      <label>{label}</label>
      <textarea
        data-testid="textarea"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span data-testid="textarea-error">{error}</span>}
    </div>
  ),
  Label: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label data-testid="label" className={className}>
      {children}
    </label>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  DialogAge: () => <div data-testid="dialog-age">DialogAge</div>,
  DialogTerms: () => <div data-testid="dialog-terms">DialogTerms</div>,
  DialogPrivacy: () => <div data-testid="dialog-privacy">DialogPrivacy</div>,
  InputField: ({
    label,
    placeholder,
    value,
    onChange,
    error,
  }: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
  }) => (
    <div data-testid="molecules-input-field">
      <label>{label}</label>
      <input
        data-testid="molecules-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span data-testid="molecules-input-error">{error}</span>}
    </div>
  ),
  TextareaField: ({
    label,
    placeholder,
    value,
    onChange,
    error,
  }: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
  }) => (
    <div data-testid="molecules-textarea-field">
      <label>{label}</label>
      <textarea
        data-testid="molecules-textarea"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span data-testid="molecules-textarea-error">{error}</span>}
    </div>
  ),
  ProfileNavigation: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="profile-navigation">{children}</div>
  ),
  DialogAddLink: ({ onSave }: { onSave: (label: string, url: string) => void }) => (
    <div data-testid="dialog-add-link">
      <button onClick={() => onSave('Test Label', 'https://test.com')}>Add Link</button>
    </div>
  ),
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

describe('CreateProfileForm', () => {
  const mockPublicKey = 'test-public-key';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOnboardingStore.mockReturnValue({
      publicKey: mockPublicKey,
    });
  });

  it('renders with default state', () => {
    render(<CreateProfileForm />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getAllByTestId('heading-3')).toHaveLength(3); // Profile, Links, Avatar
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('button-secondary')).toBeInTheDocument();
  });

  it('displays default avatar fallback when no image is selected', () => {
    render(<CreateProfileForm />);

    const avatarFallback = screen.getByTestId('avatar-fallback');
    expect(avatarFallback).toBeInTheDocument();
    expect(avatarFallback).toHaveTextContent('SN');
    expect(avatarFallback).toHaveClass('text-4xl');
  });

  it('shows "Choose file" button when no avatar is selected', () => {
    render(<CreateProfileForm />);

    const button = screen.getByTestId('button-secondary');
    const fileIcon = screen.getByTestId('file-icon');
    const buttonText = screen.getByText('Choose file');

    expect(button).toBeInTheDocument();
    expect(fileIcon).toBeInTheDocument();
    expect(buttonText).toBeInTheDocument();
    expect(fileIcon).toHaveClass('h-4', 'w-4');
  });

  it('applies correct styling to avatar button', () => {
    render(<CreateProfileForm />);

    const button = screen.getByTestId('button-secondary');
    expect(button).toHaveClass('rounded-full', 'mx-auto');
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('applies correct styling to avatar', () => {
    render(<CreateProfileForm />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('h-48', 'w-48', 'bg-muted', 'cursor-pointer');
    expect(avatar).toHaveAttribute('role', 'button');
    expect(avatar).toHaveAttribute('aria-label', 'Choose avatar image');
  });

  it('handles file selection', async () => {
    render(<CreateProfileForm />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/*');
    expect(fileInput).toHaveClass('hidden');

    // Create a mock file
    const mockFile = new File(['mock-image'], 'test-avatar.jpg', { type: 'image/jpeg' });

    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    });
  });

  it('shows avatar image when file is selected', async () => {
    render(<CreateProfileForm />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['mock-image'], 'test-avatar.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      const avatarImage = screen.getByTestId('avatar-image');
      expect(avatarImage).toBeInTheDocument();
      expect(avatarImage).toHaveAttribute('src', 'mock-object-url');
      expect(avatarImage).toHaveAttribute('alt', 'Selected avatar preview: test-avatar.jpg');
    });
  });

  it('shows "Delete" button when avatar is selected', async () => {
    render(<CreateProfileForm />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['mock-image'], 'test-avatar.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      const trashIcon = screen.getByTestId('trash2-icon');

      expect(deleteButton).toBeInTheDocument();
      expect(trashIcon).toBeInTheDocument();
      expect(trashIcon).toHaveClass('h-4', 'w-4');

      // Choose file button should not be visible
      expect(screen.queryByText('Choose file')).not.toBeInTheDocument();
    });
  });

  it('handles avatar deletion', async () => {
    render(<CreateProfileForm />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['mock-image'], 'test-avatar.jpg', { type: 'image/jpeg' });

    // First, select a file
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
    });

    // Then delete it
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      // Should revoke the object URL
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-object-url');

      // Should show fallback avatar again
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();

      // Should show "Choose file" button again
      expect(screen.getByText('Choose file')).toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  it('resets file input value when deleting avatar', async () => {
    render(<CreateProfileForm />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['mock-image'], 'test-avatar.jpg', { type: 'image/jpeg' });

    // Select a file
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
    });

    // Mock the value property to be writable for testing
    Object.defineProperty(fileInput, 'value', {
      value: 'test-avatar.jpg',
      writable: true,
    });

    // Delete the avatar
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fileInput.value).toBe('');
    });
  });

  it('handles avatar click to choose file', () => {
    render(<CreateProfileForm />);

    const avatar = screen.getByTestId('avatar');
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Mock the click method
    const clickSpy = vi.spyOn(fileInput, 'click');

    fireEvent.click(avatar);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('handles button click to choose file when no avatar', () => {
    render(<CreateProfileForm />);

    const chooseFileButton = screen.getByText('Choose file');
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Mock the click method
    const clickSpy = vi.spyOn(fileInput, 'click');

    fireEvent.click(chooseFileButton);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('uses conditional key prop on Avatar component', () => {
    render(<CreateProfileForm />);

    // Initially without image, should have 'without-image' key
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();

    // The key prop doesn't appear in the DOM, but we can test the functionality
    // by ensuring the component re-renders correctly when switching states
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
  });

  it('renders form sections correctly', () => {
    render(<CreateProfileForm />);

    // Check that main form sections are present
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getAllByTestId('heading-3')).toHaveLength(3); // Profile, Links, Avatar

    // Avatar section
    expect(screen.getByTestId('avatar')).toBeInTheDocument();

    // File input
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('maintains accessibility attributes', () => {
    render(<CreateProfileForm />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('role', 'button');
    expect(avatar).toHaveAttribute('aria-label', 'Choose avatar image');

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });
});
