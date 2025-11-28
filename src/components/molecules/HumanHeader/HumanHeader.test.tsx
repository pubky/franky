import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HumanHeader } from './HumanHeader';

describe('HumanHeader', () => {
  it('renders the highlighted title text', () => {
    render(<HumanHeader />);

    expect(screen.getByText(/Proof of Human\./i)).toBeInTheDocument();
    expect(screen.getByText('Human.')).toHaveClass('text-brand');
  });

  it('renders the supporting subtitle copy', () => {
    render(<HumanHeader />);

    expect(
      screen.getByText('Prove your humanity. This keeps the arena real and fair for everyone.'),
    ).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanHeader />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
