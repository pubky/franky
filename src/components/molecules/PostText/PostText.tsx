'use client';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkHashtags, remarkMentions, remarkPlaintextCodeblock, remarkShowMoreButton } from './PostText.utils';
import { RemarkAnchorProps } from './PostText.types';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import { usePathname } from 'next/navigation';
import { POST_ROUTES } from '@/app/routes';

type PostTextProps = {
  content: string;
};

export const PostText = ({ content }: PostTextProps) => {
  const pathname = usePathname();

  const contentTruncated =
    content.length > 500 && !pathname.startsWith(POST_ROUTES.POST) ? content.slice(0, 500) + '...\u00A0' : null;

  return (
    <Atoms.Container
      data-cy="post-text"
      overrideDefaults
      className="text-base leading-6 font-medium break-all whitespace-pre-line text-secondary-foreground"
    >
      <Markdown
        allowedElements={['em', 'strong', 'code', 'pre', 'a', 'p', 'br', 'ul', 'ol', 'li', 'del', 'blockquote', 'hr']}
        unwrapDisallowed
        remarkPlugins={[
          remarkGfm,
          remarkPlaintextCodeblock,
          remarkHashtags,
          remarkMentions,
          ...(contentTruncated ? [remarkShowMoreButton] : []),
        ]}
        components={{
          a(props: RemarkAnchorProps) {
            const { children, className, 'data-type': dataType, node: _node, ref: _ref, ...rest } = props;

            if (dataType === 'hashtag') return <Molecules.PostHashtags {...props} />;
            if (dataType === 'mention') return <Organisms.PostMentions {...props} />;

            // No stopPropagation on this button therefore click takes user to post via parent element
            if (dataType === 'show-more-button')
              return (
                <button
                  className={Libs.cn(className, 'cursor-pointer text-brand transition-colors hover:text-brand/80')}
                >
                  {children}
                </button>
              );

            return (
              <a
                {...rest}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={Libs.cn(className, 'cursor-pointer text-brand transition-colors hover:text-brand/80')}
              >
                {children}
              </a>
            );
          },
          blockquote(props) {
            const { children, className, node: _node, ref: _ref, ...rest } = props;

            return (
              <blockquote
                {...rest}
                className={Libs.cn(className, 'border-l-4 border-foreground pl-4 whitespace-normal')}
              >
                {children}
              </blockquote>
            );
          },
          ol(props) {
            const { children, className, node: _node, ref: _ref, ...rest } = props;

            return (
              <ol {...rest} className={Libs.cn(className, 'list-inside list-decimal whitespace-normal')}>
                {children}
              </ol>
            );
          },
          ul(props) {
            const { children, className, node: _node, ref: _ref, ...rest } = props;

            return (
              <ul {...rest} className={Libs.cn(className, 'list-inside list-disc whitespace-normal')}>
                {children}
              </ul>
            );
          },
          code(props) {
            return <Molecules.PostCodeBlock {...props} />;
          },
        }}
      >
        {contentTruncated || content}
      </Markdown>
    </Atoms.Container>
  );
};
