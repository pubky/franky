import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HumanPhoneCodeInput } from './HumanPhoneCodeInput';

describe('HumanPhoneCodeInput', () => {
  it('renders the highlighted title text', () => {
    render(<HumanPhoneCodeInput value={[]} onChange={() => {}} />);

    expect(screen.getByText(/Proof of Human\./i)).toBeInTheDocument();
    expect(screen.getByText('Human.')).toHaveClass('text-brand');
  });

  it('renders the supporting subtitle copy', () => {
    render(<HumanPhoneCodeInput value={[]} onChange={() => {}} />);

    expect(
      screen.getByText('Prove your humanity. This keeps the arena real and fair for everyone.'),
    ).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanPhoneCodeInput value={[]} onChange={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
