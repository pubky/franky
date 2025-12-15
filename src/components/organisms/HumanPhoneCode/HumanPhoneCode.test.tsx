import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Homegate } from '@/core/services/homegate';

import { HumanPhoneCode } from './HumanPhoneCode';

describe('HumanPhoneCode', () => {
  it('on back button click, onBack function is called', () => {
    let isBackClicked = false;
    const r = render(
      <HumanPhoneCode
        phoneNumber="1234567890"
        onBack={() => {
          isBackClicked = true;
        }}
        onSuccess={() => {}}
      />,
    );

    fireEvent.click(r.getByTestId('human-phone-resend-code-btn'));
    expect(isBackClicked).toBe(true);
  });

  it('on verify code button click, onVerifyCode function is called', async () => {
    const verifySmsCodeMock = vi
      .spyOn(Homegate, 'verifySmsCode')
      .mockResolvedValue({ valid: true, inviteCode: 'mock-invite-code' });
    let isVerifyCodeClicked = false;
    let inviteCode = '';
    const r = render(
      <HumanPhoneCode
        phoneNumber="1234567890"
        onBack={() => {}}
        onSuccess={(code) => {
          isVerifyCodeClicked = true;
          inviteCode = code;
        }}
      />,
    );

    // No event if there is no code
    fireEvent.click(r.getByTestId('human-phone-send-code-btn'));
    expect(isVerifyCodeClicked).toBe(false);

    // Enter code
    fireEvent.change(r.getByTestId('human-phone-code-input-0-input'), { target: { value: '1' } });
    fireEvent.change(r.getByTestId('human-phone-code-input-1-input'), { target: { value: '2' } });
    fireEvent.change(r.getByTestId('human-phone-code-input-2-input'), { target: { value: '3' } });
    fireEvent.change(r.getByTestId('human-phone-code-input-3-input'), { target: { value: '4' } });
    fireEvent.change(r.getByTestId('human-phone-code-input-4-input'), { target: { value: '5' } });
    fireEvent.change(r.getByTestId('human-phone-code-input-5-input'), { target: { value: '6' } });
    fireEvent.click(r.getByTestId('human-phone-send-code-btn'));

    await waitFor(() => {
      expect(verifySmsCodeMock).toHaveBeenCalledWith('1234567890', '123456');
      expect(isVerifyCodeClicked).toBe(true);
      expect(inviteCode).toBe('mock-invite-code');
    });

    verifySmsCodeMock.mockRestore();
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanPhoneCode phoneNumber="1234567890" onBack={() => {}} onSuccess={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
