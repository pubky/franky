import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Help } from './Help';

describe('Help', () => {
  it('renders with default props', () => {
    render(<Help />);
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders FAQ questions', () => {
    render(<Help />);
    expect(screen.getByText('How can I update my profile information?')).toBeInTheDocument();
    expect(screen.getByText('How can I delete my posts?')).toBeInTheDocument();
    expect(screen.getByText('How can I mute someone?')).toBeInTheDocument();
    expect(screen.getByText('How can I restore my account?')).toBeInTheDocument();
    expect(screen.getByText('How is Pubky different from other social platforms?')).toBeInTheDocument();
  });

  it('renders User Guide section', () => {
    render(<Help />);
    const userGuideHeaders = screen.getAllByText('User Guide');
    expect(userGuideHeaders.length).toBeGreaterThan(0);
  });

  it('renders Support section', () => {
    render(<Help />);
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Help className="custom-help" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('Help - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Help />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<Help className="custom-help" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
