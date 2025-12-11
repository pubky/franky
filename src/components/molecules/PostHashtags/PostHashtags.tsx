import { JSX } from 'react';
import { RemarkAnchorProps } from '../PostText/PostText.types';
import { extractTextFromChildren } from '../PostText/PostText.utils';
import * as Libs from '@/libs';
import * as Icons from '@/libs/icons';
import * as Atoms from '@/atoms';

type TagIcons = {
  [key: string]: JSX.Element | undefined;
};

const tagIcons: TagIcons = {
  '#synonym': <Icons.Synonym size={24} />,
  '#tether': <Icons.Tether size={24} />,
  '#pubky': <Icons.PubkyIcon size={22} />,
  '#bitkit': <Icons.Bitkit size={24} />,
  '#blocktank': <Icons.Blocktank size={24} />,
  '#bitcoin': <Icons.BTCIcon size={24} />,
};

export const PostHashtags = (props: RemarkAnchorProps): React.ReactElement => {
  const { href, children, className, node: _node, ref: _ref, ...rest } = props;

  const hashtagText = extractTextFromChildren(children);

  const Icon = tagIcons[hashtagText.toLowerCase()] || null;

  return (
    <Atoms.Link
      {...rest}
      href={href || ''}
      onClick={(e) => e.stopPropagation()}
      className={Libs.cn(className, 'inline-flex items-center gap-x-1 text-base')}
    >
      {children} {Icon}
    </Atoms.Link>
  );
};
