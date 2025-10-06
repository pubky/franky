import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SettingsPage from './page';

// Mock the Templates module
vi.mock('@/templates', () => ({
  Settings: vi.fn(() => <div data-testid="settings-template">Settings Template</div>),
}));

describe('SettingsPage', () => {
  it('renders without errors', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('settings-template')).toBeInTheDocument();
  });

  it('renders Settings template component', () => {
    render(<SettingsPage />);
    const settingsTemplate = screen.getByTestId('settings-template');
    expect(settingsTemplate).toBeInTheDocument();
    expect(settingsTemplate).toHaveTextContent('Settings Template');
  });
});
