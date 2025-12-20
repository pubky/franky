import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { HumanPhoneInput } from './HumanPhoneInput';

describe('HumanPhoneInput', () => {
  it('matches snapshot', () => {
    const { container } = render(<HumanPhoneInput onBack={() => {}} onCodeSent={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
