'use client';

import { useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  remarkDisallowMarkdownLinks,
  remarkHashtags,
  remarkMentions,
  remarkPlaintextCodeblock,
  remarkShowMoreButton,
  truncateAtWordBoundary,
} from './PostText.utils';
import { PostTextProps, RemarkAnchorProps } from './PostText.types';
import { TRUNCATION_LIMIT } from './PostText.constants';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import { usePathname } from 'next/navigation';
import { POST_ROUTES } from '@/app/routes';

export const PostText = ({ content }: PostTextProps) => {
  const pathname = usePathname();

  const contentTruncated =
    content.length > TRUNCATION_LIMIT && !pathname.startsWith(POST_ROUTES.POST)
      ? truncateAtWordBoundary(content, TRUNCATION_LIMIT)
      : null;

  // Memoize plugins array to avoid recreation on every render
  const remarkPlugins = useMemo(
    () => [
      remarkGfm,
      remarkDisallowMarkdownLinks,
      remarkPlaintextCodeblock,
      remarkHashtags,
      remarkMentions,
      ...(contentTruncated ? [remarkShowMoreButton] : []),
    ],
    [contentTruncated],
  );

  return (
    <Atoms.Container
      data-cy="post-text"
      overrideDefaults
      className="text-base leading-6 font-medium wrap-anywhere hyphens-auto whitespace-pre-line text-secondary-foreground"
    >
      <Markdown
        allowedElements={['em', 'strong', 'code', 'pre', 'a', 'p', 'br', 'ul', 'ol', 'li', 'del', 'blockquote', 'hr']}
        unwrapDisallowed
        remarkPlugins={remarkPlugins}
        components={{
          a(props: RemarkAnchorProps) {
            const { children, className, 'data-type': dataType, node: _node, ref: _ref, ...rest } = props;

            if (dataType === 'hashtag') return <Molecules.PostHashtags {...props} />;
            if (dataType === 'mention') return <Organisms.PostMentions {...props} />;

            // No stopPropagation on this element therefore click takes user to post via parent element
            // Using span with role='button' instead of button to avoid invalid HTML (button inside p)
            if (dataType === 'show-more-button')
              return (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Show full post content"
                  className={Libs.cn(className, 'cursor-pointer text-brand transition-colors hover:text-brand/80')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault(); // Prevent scroll on space
                      e.currentTarget.click();
                    }
                  }}
                >
                  {children}
                </span>
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
