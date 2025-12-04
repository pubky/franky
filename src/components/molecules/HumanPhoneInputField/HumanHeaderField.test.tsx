import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HumanPhoneHeader } from './HumanPhoneInputField';

describe('HumanHeader', () => {
  it('renders the highlighted title text', () => {
    render(<HumanPhoneHeader />);

    expect(screen.getByText(/Proof of Human\./i)).toBeInTheDocument();
    expect(screen.getByText('Human.')).toHaveClass('text-brand');
  });

  it('renders the supporting subtitle copy', () => {
    render(<HumanPhoneHeader />);

    expect(
      screen.getByText('Prove your humanity. This keeps the arena real and fair for everyone.'),
    ).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanPhoneHeader />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
