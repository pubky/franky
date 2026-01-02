import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { HumanInviteCode } from './HumanInviteCode';

describe('HumanInviteCode', () => {
  it('matches snapshot', () => {
    const { container } = render(<HumanInviteCode onBack={() => {}} onSuccess={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
