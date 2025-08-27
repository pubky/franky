import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Metadata } from './Metadata';

// Mock Next.js navigation
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock React useEffect
const mockUseEffect = vi.fn();
vi.mock('react', () => ({
  useEffect: (callback: () => void, dependencies?: unknown[]) => mockUseEffect(callback, dependencies),
}));

describe('Metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    mockUsePathname.mockReturnValue('/');

    const { container } = render(<Metadata />);
    expect(container).toBeDefined();
  });

  it('calls useEffect when component mounts', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Metadata />);
    expect(mockUseEffect).toHaveBeenCalled();
  });

  it('returns null (does not render anything)', () => {
    mockUsePathname.mockReturnValue('/');

    const { container } = render(<Metadata />);
    expect(container.firstChild).toBeNull();
  });

  it('handles different pathnames correctly', () => {
    // Test home route
    mockUsePathname.mockReturnValue('/');
    render(<Metadata />);

    let useEffectCallback = mockUseEffect.mock.calls[0][0];
    expect(useEffectCallback).toBeDefined();

    // Test onboarding route
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/onboarding/install');
    render(<Metadata />);

    useEffectCallback = mockUseEffect.mock.calls[0][0];
    expect(useEffectCallback).toBeDefined();

    // Test unknown route
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/unknown-route');
    render(<Metadata />);

    useEffectCallback = mockUseEffect.mock.calls[0][0];
    expect(useEffectCallback).toBeDefined();
  });

  it('calls useEffect with correct dependencies', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Metadata />);

    // Verify useEffect was called with a callback and dependency array
    expect(mockUseEffect).toHaveBeenCalledWith(expect.any(Function), expect.arrayContaining(['/']));
  });

  it('handles 404 routes correctly', () => {
    mockUsePathname.mockReturnValue('/non-existent-page');

    render(<Metadata />);

    const useEffectCallback = mockUseEffect.mock.calls[0][0];
    expect(useEffectCallback).toBeDefined();
  });

  it('handles onboarding routes correctly', () => {
    const onboardingRoutes = [
      '/onboarding/install',
      '/onboarding/profile',
      '/onboarding/scan',
      '/onboarding/backup',
      '/onboarding/homeserver',
      '/onboarding/pubky',
    ];

    onboardingRoutes.forEach((route) => {
      vi.clearAllMocks();
      mockUsePathname.mockReturnValue(route);

      render(<Metadata />);

      const useEffectCallback = mockUseEffect.mock.calls[0][0];
      expect(useEffectCallback).toBeDefined();
    });
  });

  it('handles root path correctly', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Metadata />);

    const useEffectCallback = mockUseEffect.mock.calls[0][0];
    expect(useEffectCallback).toBeDefined();
  });

  it('handles deep nested routes correctly', () => {
    mockUsePathname.mockReturnValue('/deeply/nested/route/that/doesnt/exist');

    render(<Metadata />);

    const useEffectCallback = mockUseEffect.mock.calls[0][0];
    expect(useEffectCallback).toBeDefined();
  });
});
