import { AnchorHTMLAttributes, ClassAttributes, JSX } from 'react';
import { ExtraProps } from 'react-markdown';
import * as Libs from '@/libs';
import * as Icons from '@/libs/icons';
import * as Atoms from '@/atoms';

type PostHashtagsProps = ClassAttributes<HTMLAnchorElement> &
  AnchorHTMLAttributes<HTMLAnchorElement> &
  ExtraProps & { 'data-type'?: string };

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

export const PostHashtags = (props: PostHashtagsProps) => {
  const { href, children, className, node: _node, ref: _ref, ...rest } = props;

  const Icon = tagIcons[String(children).toLowerCase()] || null;

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
