'use client';

import { useMemo } from 'react';
import Markdown, { Components } from 'react-markdown';
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

// Base elements allowed in all posts
const BASE_ALLOWED_ELEMENTS = [
  'em',
  'strong',
  'code',
  'pre',
  'a',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'del',
  'blockquote',
  'hr',
] as const;

// Additional elements allowed in articles (headings)
const ARTICLE_ALLOWED_ELEMENTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

// Heading styles following design system - article headings use foreground color
const HEADING_STYLES: Record<string, string> = {
  h1: 'text-3xl font-bold text-foreground mt-6 mb-4 first:mt-0',
  h2: 'text-2xl font-bold text-foreground mt-5 mb-3 first:mt-0',
  h3: 'text-xl font-semibold text-foreground mt-4 mb-2 first:mt-0',
  h4: 'text-lg font-semibold text-foreground mt-3 mb-2 first:mt-0',
  h5: 'text-base font-semibold text-foreground mt-3 mb-1 first:mt-0',
  h6: 'text-sm font-semibold text-foreground mt-2 mb-1 first:mt-0',
};

// Factory for creating heading components
const createHeadingComponent = (level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): Components[typeof level] => {
  const HeadingComponent: Components[typeof level] = (props) => {
    const { children, className, node: _node, ref: _ref, ...rest } = props;
    const Tag = level;
    return (
      <Tag {...rest} className={Libs.cn(HEADING_STYLES[level], 'whitespace-normal', className)}>
        {children}
      </Tag>
    );
  };
  return HeadingComponent;
};

export const PostText = ({ content, isArticle = false }: PostTextProps) => {
  const pathname = usePathname();

  const contentTruncated =
    content.length > TRUNCATION_LIMIT && !pathname.startsWith(POST_ROUTES.POST)
      ? truncateAtWordBoundary(content, TRUNCATION_LIMIT)
      : null;

  // Memoize plugins array to avoid recreation on every render
  // For articles, we allow markdown-style links (embedded links)
  // For regular posts, we disallow them to prevent phishing
  const remarkPlugins = useMemo(
    () => [
      remarkGfm,
      // Only disallow markdown links for non-article posts (security measure)
      ...(isArticle ? [] : [remarkDisallowMarkdownLinks]),
      remarkPlaintextCodeblock,
      remarkHashtags,
      remarkMentions,
      ...(contentTruncated ? [remarkShowMoreButton] : []),
    ],
    [contentTruncated, isArticle],
  );

  // Build allowed elements based on post type
  const allowedElements = useMemo(
    () =>
      isArticle
        ? [...BASE_ALLOWED_ELEMENTS, ...ARTICLE_ALLOWED_ELEMENTS]
        : ([...BASE_ALLOWED_ELEMENTS] as unknown as string[]),
    [isArticle],
  );

  // Build markdown components with article-specific heading renderers
  const markdownComponents = useMemo((): Components => {
    const baseComponents: Components = {
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
          <blockquote {...rest} className={Libs.cn(className, 'border-l-4 border-foreground pl-4 whitespace-normal')}>
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
    };

    // Add heading components for articles
    if (isArticle) {
      return {
        ...baseComponents,
        h1: createHeadingComponent('h1'),
        h2: createHeadingComponent('h2'),
        h3: createHeadingComponent('h3'),
        h4: createHeadingComponent('h4'),
        h5: createHeadingComponent('h5'),
        h6: createHeadingComponent('h6'),
      };
    }

    return baseComponents;
  }, [isArticle]);

  return (
    <Atoms.Container
      data-cy="post-text"
      overrideDefaults
      className="text-base leading-6 font-medium wrap-anywhere hyphens-auto whitespace-pre-line text-secondary-foreground"
    >
      <Markdown
        allowedElements={allowedElements as string[]}
        unwrapDisallowed
        remarkPlugins={remarkPlugins}
        components={markdownComponents}
      >
        {contentTruncated || content}
      </Markdown>
    </Atoms.Container>
  );
};
