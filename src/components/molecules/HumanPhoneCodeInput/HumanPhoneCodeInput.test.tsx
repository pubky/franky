import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

import { HumanPhoneCodeInput } from './HumanPhoneCodeInput';

describe('HumanPhoneCodeInput', () => {
  it('Change the code by typing in the inputs', () => {
    const Wrapper = () => {
      const [code, setCode] = useState(['', '', '', '', '', '']);
      return <HumanPhoneCodeInput value={code} onChange={setCode} />;
    };

    const { container } = render(<Wrapper />);

    fireEvent.change(container.querySelector('#human-phone-code-input-0-input')!, { target: { value: '1' } });
    fireEvent.change(container.querySelector('#human-phone-code-input-1-input')!, { target: { value: '1' } });
    fireEvent.change(container.querySelector('#human-phone-code-input-2-input')!, { target: { value: '1' } });
    fireEvent.change(container.querySelector('#human-phone-code-input-3-input')!, { target: { value: '1' } });
    fireEvent.change(container.querySelector('#human-phone-code-input-4-input')!, { target: { value: '1' } });
    fireEvent.change(container.querySelector('#human-phone-code-input-5-input')!, { target: { value: '1' } });

    const values = Array.from(container.querySelectorAll('input')).map((input) => (input as HTMLInputElement).value);

    expect(values).toEqual(['1', '1', '1', '1', '1', '1']);
  });

  // it('renders the supporting subtitle copy', () => {
  //   render(<HumanPhoneCodeInput value={['','','','','','']} onChange={() => {}} />);

  //   expect(
  //     screen.getByText('Prove your humanity. This keeps the arena real and fair for everyone.'),
  //   ).toBeInTheDocument();
  // });

  it('matches snapshot', () => {
    const { container } = render(<HumanPhoneCodeInput value={['', '', '', '', '', '']} onChange={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
