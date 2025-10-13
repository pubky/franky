import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SettingsInfo } from './SettingsInfo';

describe('SettingsInfo', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsInfo />);
    expect(container).toBeTruthy();
  });

  it('renders all section headers', () => {
    render(<SettingsInfo />);

    expect(screen.getByText('Terms of Service & Privacy')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
  });

  it('renders subtitle for Terms section', () => {
    render(<SettingsInfo />);
    expect(screen.getByText('Please read our terms carefully.')).toBeInTheDocument();
  });

  it('renders version text', () => {
    render(<SettingsInfo />);
    expect(screen.getByText('Pubky v0.12 © Synonym Software Ltd')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<SettingsInfo />);
    expect(container).toMatchSnapshot();
  });
});
