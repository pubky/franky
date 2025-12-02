'use client';

import { RemarkAnchorProps } from '@/molecules/PostText/PostText.types';
import { extractTextFromChildren } from '@/molecules/PostText/PostText.utils';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';
import { useLiveQuery } from 'dexie-react-hooks';

export const PostMentions = (props: RemarkAnchorProps) => {
  const { href, children, className, node: _node, ref: _ref, ...rest } = props;

  const mentionText = extractTextFromChildren(children);
  const userId = Libs.extractPubkyPublicKey(mentionText);
  const username = useLiveQuery(() => Core.UserController.getDetails({ userId: userId! }), [userId], null)?.name;
  const shortenedText = Libs.truncateMiddle(mentionText, 20);
  const finalMention = username ? `@${username}` : shortenedText;

  if (!userId) return null;

  return (
    <Atoms.Link
      {...rest}
      href={href || ''}
      onClick={(e) => e.stopPropagation()}
      className={Libs.cn(className, 'text-base')}
    >
      {finalMention}
    </Atoms.Link>
  );
};
