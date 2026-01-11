import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { HumanPhoneInputField } from './HumanPhoneInputField';

describe('HumanPhoneInputField', () => {
  it('matches snapshot', () => {
    const { container } = render(<HumanPhoneInputField value="" onChange={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
