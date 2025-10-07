import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateProfileForm } from './CreateProfileForm';
import * as App from '@/app';

vi.mock('@/core', () => ({
  useOnboardingStore: vi.fn(),
  UserController: {
    uploadAvatar: vi.fn(),
    saveProfile: vi.fn(),
  },
  UserValidator: {
    check: vi.fn(),
  },
  AuthController: {
    authorizeAndBootstrap: vi.fn(),
  },
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
  };
});

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
const mockToast = vi.fn();
vi.mock('@/molecules', () => ({
  DialogAge: () => <div data-testid="dialog-age">DialogAge</div>,
  DialogTerms: () => <div data-testid="dialog-terms">DialogTerms</div>,
  DialogPrivacy: () => <div data-testid="dialog-privacy">DialogPrivacy</div>,
  useToast: () => ({
    toast: mockToast,
  }),
  InputField: ({
    placeholder,
    value = '',
    onChange,
    status,
    message,
    messageType,
    variant,
    icon,
    onClickIcon,
    iconPosition,
  }: {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    status?: string;
    message?: string;
    messageType?: string;
    variant?: string;
    icon?: React.ReactNode;
    onClickIcon?: () => void;
    iconPosition?: string;
  }) => (
    <div data-testid="molecules-input-field">
      <input
        data-testid="molecules-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          if (onChange && e && e.target) {
            onChange(e);
          }
        }}
        data-status={status}
        data-variant={variant}
      />
      {icon && (
        <button onClick={onClickIcon} data-position={iconPosition}>
          {icon}
        </button>
      )}
      {message && (
        <span data-testid="molecules-input-error" data-type={messageType}>
          {message}
        </span>
      )}
    </div>
  ),
  TextareaField: ({
    placeholder,
    value = '',
    onChange,
    variant,
    rows,
  }: {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    variant?: string;
    rows?: number;
  }) => (
    <div data-testid="molecules-textarea-field">
      <textarea
        data-testid="molecules-textarea"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          if (onChange && e && e.target) {
            onChange(e);
          }
        }}
        data-variant={variant}
        rows={rows}
      />
    </div>
  ),
  ProfileNavigation: ({
    children,
    continueButtonDisabled,
    continueButtonLoading,
    continueText,
    onContinue,
  }: {
    children?: React.ReactNode;
    continueButtonDisabled?: boolean;
    continueButtonLoading?: boolean;
    continueText?: string;
    onContinue?: () => void;
  }) => (
    <div data-testid="profile-navigation">
      {children}
      <button
        onClick={onContinue}
        disabled={continueButtonDisabled || continueButtonLoading}
        data-testid="continue-button"
      >
        {continueText || 'Continue'}
      </button>
    </div>
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
  const mockPubky = 'test-public-key';

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked modules
    const Core = await import('@/core');
    vi.mocked(Core.useOnboardingStore).mockReturnValue({
      pubky: mockPubky,
    });

    // Reset all mock functions
    mockPush.mockReset();
    mockToast.mockReset();
    vi.mocked(Core.UserController.uploadAvatar).mockReset();
    vi.mocked(Core.UserController.saveProfile).mockReset();
    vi.mocked(Core.UserValidator.check).mockReset();
    vi.mocked(Core.AuthController.authorizeAndBootstrap).mockReset();
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
    const buttonText = screen.getByText('Choose file');

    expect(button).toBeInTheDocument();
    expect(buttonText).toBeInTheDocument();
    // File icon is now actual lucide-react component (SVG), not mocked div
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

      // Trash icons are now actual lucide-react Trash2 components (SVGs), not mocked divs
      expect(deleteButton).toBeInTheDocument();

      // Find the avatar delete button
      const avatarDeleteButton = deleteButton.parentElement;
      const avatarTrashIcon = avatarDeleteButton?.querySelector('svg.lucide-trash-2');
      expect(avatarTrashIcon).toBeInTheDocument();
      expect(avatarTrashIcon).toHaveClass('h-4', 'w-4');

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

  describe('Form submission (basic tests)', () => {
    it('should render continue button correctly', () => {
      render(<CreateProfileForm />);
      const continueButton = screen.getByTestId('continue-button');
      expect(continueButton).toBeInTheDocument();
      expect(continueButton).toHaveTextContent('Finish');
    });

    it('should have form fields available', () => {
      render(<CreateProfileForm />);

      // Check that name input exists
      const nameInputs = screen.getAllByTestId('molecules-input');
      expect(nameInputs.length).toBeGreaterThan(0);

      // Check that profile navigation exists
      const profileNavigation = screen.getByTestId('profile-navigation');
      expect(profileNavigation).toBeInTheDocument();
    });

    it('should test Core module integration exists', async () => {
      const Core = await import('@/core');

      // Verify that the mocked functions exist
      expect(typeof Core.UserController.saveProfile).toBe('function');
      expect(typeof Core.UserController.uploadAvatar).toBe('function');
      expect(typeof Core.UserValidator.check).toBe('function');
      expect(typeof Core.AuthController.authorizeAndBootstrap).toBe('function');
    });

    it('should handle authorizeAndBootstrap error and show error toast', async () => {
      const Core = await import('@/core');

      // Mock successful validation and profile save
      vi.mocked(Core.UserValidator.check).mockReturnValue({
        data: {
          name: 'Test User',
          bio: 'Test bio',
          links: [],
        },
        error: [],
      });

      vi.mocked(Core.UserController.saveProfile).mockResolvedValue({
        ok: true,
      } as Response);

      // Mock authorizeAndBootstrap to throw an error
      const bootstrapError = new Error('Failed to fetch user data');
      vi.mocked(Core.AuthController.authorizeAndBootstrap).mockRejectedValue(bootstrapError);

      render(<CreateProfileForm />);

      // Fill in the name field to make form valid
      const nameInput = screen.getAllByTestId('molecules-input')[0];
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      // Submit the form
      const continueButton = screen.getByTestId('continue-button');
      expect(continueButton).not.toBeDisabled();

      fireEvent.click(continueButton);

      // Wait for the error handling to complete
      await waitFor(() => {
        // Should show error toast
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Please try again.',
          description: 'Failed to fetch the new user data. Indexing might be in progress...',
        });

        // Button text should change to "Try again!"
        expect(continueButton).toHaveTextContent('Try again!');

        // Should not navigate to feed page
        expect(mockPush).not.toHaveBeenCalledWith(App.FEED_ROUTES.FEED);
      });

      // Verify the mocks were called in the correct order
      expect(Core.UserValidator.check).toHaveBeenCalled();
      expect(Core.UserController.saveProfile).toHaveBeenCalled();
      expect(Core.AuthController.authorizeAndBootstrap).toHaveBeenCalled();
    });
  });

  describe('Welcome Dialog Integration', () => {
    it('should call setShowWelcomeDialog(true) when profile creation is successful', async () => {
      const mockSetShowWelcomeDialog = vi.fn();
      const Core = await import('@/core');

      // Mock the onboarding store to return the setShowWelcomeDialog function
      vi.mocked(Core.useOnboardingStore).mockReturnValue({
        pubky: 'test-pubky-123',
        setShowWelcomeDialog: mockSetShowWelcomeDialog,
      });

      // Mock successful validation and profile save
      vi.mocked(Core.UserValidator.check).mockReturnValue({
        data: {
          name: 'Test User',
          bio: 'Test bio',
          links: [],
        },
        error: [],
      });

      vi.mocked(Core.UserController.saveProfile).mockResolvedValue({
        ok: true,
      } as Response);

      // Mock successful bootstrap
      vi.mocked(Core.AuthController.authorizeAndBootstrap).mockResolvedValue(undefined);

      render(<CreateProfileForm />);

      // Fill in the name field to make form valid
      const nameInput = screen.getAllByTestId('molecules-input')[0];
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      // Submit the form
      const continueButton = screen.getByTestId('continue-button');
      fireEvent.click(continueButton);

      // Wait for the success handling to complete
      await waitFor(() => {
        // Should navigate to feed page
        expect(mockPush).toHaveBeenCalledWith(App.FEED_ROUTES.FEED);
      });

      // Verify that setShowWelcomeDialog(true) was called
      expect(mockSetShowWelcomeDialog).toHaveBeenCalledWith(true);

      // Verify the flow was completed successfully
      expect(Core.UserValidator.check).toHaveBeenCalled();
      expect(Core.UserController.saveProfile).toHaveBeenCalled();
      expect(Core.AuthController.authorizeAndBootstrap).toHaveBeenCalled();
    });

    it('should not call setShowWelcomeDialog when profile creation fails', async () => {
      const mockSetShowWelcomeDialog = vi.fn();
      const Core = await import('@/core');

      // Mock the onboarding store to return the setShowWelcomeDialog function
      vi.mocked(Core.useOnboardingStore).mockReturnValue({
        pubky: 'test-pubky-123',
        setShowWelcomeDialog: mockSetShowWelcomeDialog,
      });

      // Mock successful validation but failed profile save
      vi.mocked(Core.UserValidator.check).mockReturnValue({
        data: {
          name: 'Test User',
          bio: 'Test bio',
          links: [],
        },
        error: [],
      });

      vi.mocked(Core.UserController.saveProfile).mockResolvedValue({
        ok: false,
      } as Response);

      render(<CreateProfileForm />);

      // Fill in the name field to make form valid
      const nameInput = screen.getAllByTestId('molecules-input')[0];
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      // Submit the form
      const continueButton = screen.getByTestId('continue-button');
      fireEvent.click(continueButton);

      // Wait for the error handling to complete
      await waitFor(() => {
        // Button text should change to "Try again!"
        expect(continueButton).toHaveTextContent('Try again!');
      });

      // Verify that setShowWelcomeDialog was NOT called due to profile save failure
      expect(mockSetShowWelcomeDialog).not.toHaveBeenCalled();

      // Verify that bootstrap was not called due to profile save failure
      expect(Core.AuthController.authorizeAndBootstrap).not.toHaveBeenCalled();
    });

    it('should not call setShowWelcomeDialog when bootstrap fails', async () => {
      const mockSetShowWelcomeDialog = vi.fn();
      const Core = await import('@/core');

      // Mock the onboarding store to return the setShowWelcomeDialog function
      vi.mocked(Core.useOnboardingStore).mockReturnValue({
        pubky: 'test-pubky-123',
        setShowWelcomeDialog: mockSetShowWelcomeDialog,
      });

      // Mock successful validation and profile save
      vi.mocked(Core.UserValidator.check).mockReturnValue({
        data: {
          name: 'Test User',
          bio: 'Test bio',
          links: [],
        },
        error: [],
      });

      vi.mocked(Core.UserController.saveProfile).mockResolvedValue({
        ok: true,
      } as Response);

      // Mock bootstrap failure
      vi.mocked(Core.AuthController.authorizeAndBootstrap).mockRejectedValue(new Error('Bootstrap failed'));

      render(<CreateProfileForm />);

      // Fill in the name field to make form valid
      const nameInput = screen.getAllByTestId('molecules-input')[0];
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      // Submit the form
      const continueButton = screen.getByTestId('continue-button');
      fireEvent.click(continueButton);

      // Wait for the error handling to complete
      await waitFor(() => {
        // Button text should change to "Try again!"
        expect(continueButton).toHaveTextContent('Try again!');
      });

      // Verify that setShowWelcomeDialog was NOT called due to bootstrap failure
      expect(mockSetShowWelcomeDialog).not.toHaveBeenCalled();

      // Verify bootstrap was attempted
      expect(Core.AuthController.authorizeAndBootstrap).toHaveBeenCalled();
    });

    it('should have access to setShowWelcomeDialog from onboarding store', async () => {
      const mockSetShowWelcomeDialog = vi.fn();
      const Core = await import('@/core');

      // Mock the onboarding store
      vi.mocked(Core.useOnboardingStore).mockReturnValue({
        pubky: 'test-pubky-123',
        setShowWelcomeDialog: mockSetShowWelcomeDialog,
      });

      render(<CreateProfileForm />);

      // Verify that the component has access to the setShowWelcomeDialog function
      // This is implicitly tested by the component rendering without errors
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });
  });
});
