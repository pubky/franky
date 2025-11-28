'use client';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

type PostTextProps = {
  content: string;
};

// We assign full code blocks without a language specified as plaintext (ex. ```...```)
const remarkPlaintextCodeblock = () => (tree: Root) => {
  visit(tree, 'code', (node) => {
    node.lang = node.lang ?? 'plaintext';
  });
};

export const PostText = ({ content }: PostTextProps) => {
  return (
    <Atoms.Container
      overrideDefaults
      className="text-base leading-6 font-medium break-all whitespace-pre-line text-secondary-foreground"
    >
      <Markdown
        allowedElements={['em', 'strong', 'code', 'pre', 'a', 'p', 'br', 'ul', 'ol', 'li', 'del', 'blockquote', 'hr']}
        unwrapDisallowed
        remarkPlugins={[remarkGfm, remarkPlaintextCodeblock]}
        components={{
          a(props) {
            const { children, className, node: _node, ref: _ref, ...rest } = props;

            return (
              <a
                {...rest}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={Libs.cn(className, 'text-brand')}
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
        {content}
      </Markdown>
    </Atoms.Container>
  );
};
