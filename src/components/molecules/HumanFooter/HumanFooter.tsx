'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import * as Config from '@/config';
import React from 'react';

const CLICK_TIMES_TO_ENABLE_DEV_MODE = 3;
const CLICK_TIME_WINDOW_MS = 1500;

interface HumanFooterProps {
  /**
   * Callback to be called when the user clicks the "All rights reserved." text 5 times.
   */
  onDevMode?: () => void;
}

/**
 * Human footer with a hidden function to enable dev mode.
 * Just click the "All rights reserved." text 3 times within 1.5 seconds.
 * @param param0
 * @returns
 */
export const HumanFooter = ({ onDevMode }: HumanFooterProps) => {
  const clickTimestamps = React.useRef<number[]>([]);

  function onClick() {
    // Add the current timestamp to the array
    clickTimestamps.current.push(Date.now());

    // Remove timestamps older than 2 seconds
    const twoSecondsAgo = Date.now() - CLICK_TIME_WINDOW_MS;
    while (clickTimestamps.current.length > 0 && clickTimestamps.current[0] <= twoSecondsAgo) {
      clickTimestamps.current.shift();
    }

    // If the array has 5 timestamps, then we can trigger the dev mode
    if (clickTimestamps.current.length >= CLICK_TIMES_TO_ENABLE_DEV_MODE) {
      clickTimestamps.current = []; // Reset the array
      onDevMode?.();
    }
  }

  return (
    <Atoms.Container className={Libs.cn('flex-col gap-0 py-6')}>
      <Atoms.FooterLinks>
        By creating a <span className="text-brand">Pubky</span> account, you agree to the <Organisms.DialogTerms />,{' '}
        <Organisms.DialogPrivacy />, and confirm you are <Organisms.DialogAge />
      </Atoms.FooterLinks>
      <Atoms.FooterLinks>
        Pubky is powered by{' '}
        <Atoms.Link href={Config.PUBKY_CORE_URL} target="_blank">
          Pubky Core
        </Atoms.Link>{' '}
        and was built with love and dedication by Synonym Software, S.A. DE C.V. ©2025.{' '}
        <span onClick={onClick}>All rights reserved.</span>
      </Atoms.FooterLinks>
    </Atoms.Container>
  );
};
