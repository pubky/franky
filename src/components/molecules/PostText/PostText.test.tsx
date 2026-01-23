import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostText } from './PostText';

// Mock next/navigation
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock @/atoms
vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    overrideDefaults,
  }: {
    children: React.ReactNode;
    className?: string;
    overrideDefaults?: boolean;
  }) => (
    <div data-testid="container" data-override-defaults={overrideDefaults} className={className}>
      {children}
    </div>
  ),
}));

// Mock @/molecules
vi.mock('@/molecules', () => ({
  PostCodeBlock: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <code data-testid="post-code-block" className={className}>
      {children}
    </code>
  ),
  PostHashtags: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a data-testid="post-hashtag" href={href}>
      {children}
    </a>
  ),
}));

// Mock @/organisms
vi.mock('@/organisms', () => ({
  PostMentions: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a data-testid="post-mention" href={href}>
      {children}
    </a>
  ),
}));

// Helper to generate content of specific length
const generateContent = (length: number): string => {
  const base = 'Lorem ipsum dolor sit amet. ';
  let result = '';
  while (result.length < length) {
    result += base;
  }
  return result.slice(0, length);
};

describe('PostText', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/home');
  });

  describe('Basic rendering', () => {
    it('renders plain text content', () => {
      render(<PostText content="Hello, world!" />);

      expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    });

    it('renders content inside a Container', () => {
      render(<PostText content="Test content" />);

      const container = screen.getByTestId('container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('data-override-defaults', 'true');
    });

    it('renders empty content without errors', () => {
      const { container } = render(<PostText content="" />);

      expect(container).toBeInTheDocument();
    });

    it('renders multiline content', () => {
      render(<PostText content={'Line 1\nLine 2\nLine 3'} />);

      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Line 2/)).toBeInTheDocument();
      expect(screen.getByText(/Line 3/)).toBeInTheDocument();
    });
  });

  describe('Markdown formatting', () => {
    it('renders bold text with **', () => {
      render(<PostText content="This is **bold** text" />);

      const strongElement = screen.getByText('bold');
      expect(strongElement.tagName).toBe('STRONG');
    });

    it('renders italic text with *', () => {
      render(<PostText content="This is *italic* text" />);

      const emElement = screen.getByText('italic');
      expect(emElement.tagName).toBe('EM');
    });

    it('renders italic text with _', () => {
      render(<PostText content="This is _italic_ text" />);

      const emElement = screen.getByText('italic');
      expect(emElement.tagName).toBe('EM');
    });

    it('renders strikethrough text with ~~', () => {
      render(<PostText content="This is ~~deleted~~ text" />);

      const delElement = screen.getByText('deleted');
      expect(delElement.tagName).toBe('DEL');
    });

    it('renders inline code', () => {
      render(<PostText content="Use `const x = 1` for variables" />);

      const codeBlock = screen.getByTestId('post-code-block');
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock).toHaveTextContent('const x = 1');
    });

    it('renders code blocks', () => {
      render(<PostText content={'```javascript\nconst hello = "world";\n```'} />);

      const codeBlock = screen.getByTestId('post-code-block');
      expect(codeBlock).toBeInTheDocument();
    });

    it('renders italic and strikethrough on same text', () => {
      render(<PostText content="This is *~~italic and strikethrough~~* text" />);

      const textElement = screen.getByText('italic and strikethrough');
      expect(textElement.tagName).toBe('DEL');
      const parent = textElement.parentElement;
      expect(parent?.tagName).toBe('EM');
    });

    it('renders strikethrough and italic on same text', () => {
      render(<PostText content="This is ~~*strikethrough and italic*~~ text" />);

      const textElement = screen.getByText('strikethrough and italic');
      expect(textElement.tagName).toBe('EM');
      const parent = textElement.parentElement;
      expect(parent?.tagName).toBe('DEL');
    });

    it('renders italic and bold on same text', () => {
      render(<PostText content="This is ***italic and bold*** text" />);

      const textElement = screen.getByText('italic and bold');
      expect(textElement.tagName).toBe('STRONG');
      const parent = textElement.parentElement;
      expect(parent?.tagName).toBe('EM');
    });

    it('renders bold and italic on same text', () => {
      render(<PostText content="This is **_bold and italic_** text" />);

      const textElement = screen.getByText('bold and italic');
      expect(textElement.tagName).toBe('EM');
      const parent = textElement.parentElement;
      expect(parent?.tagName).toBe('STRONG');
    });

    it('renders strikethrough and inline code on same text', () => {
      render(<PostText content="This is ~~`strikethrough and code`~~ text" />);

      const codeBlock = screen.getByTestId('post-code-block');
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock).toHaveTextContent('strikethrough and code');
      const parent = codeBlock.parentElement;
      expect(parent?.tagName).toBe('DEL');
    });
  });

  describe('Links', () => {
    describe('GFM autolinks (preserved)', () => {
      it('renders auto-linked URLs from GFM', () => {
        render(<PostText content="Visit https://example.com for more info" />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'https://example.com');
      });

      it('renders www autolinks from GFM', () => {
        render(<PostText content="Visit www.example.com for more info" />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'http://www.example.com');
      });

      it('renders email autolinks from GFM', () => {
        render(<PostText content="Contact user@example.com for help" />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'mailto:user@example.com');
      });

      it('renders autolinks with brand color and hover classes', () => {
        render(<PostText content="Visit https://example.com" />);

        const link = screen.getByRole('link');
        expect(link).toHaveClass('text-brand');
        expect(link).toHaveClass('cursor-pointer');
        expect(link).toHaveClass('transition-colors');
      });

      it('stops event propagation on autolink click', () => {
        const handleParentClick = vi.fn();
        render(
          <div onClick={handleParentClick}>
            <PostText content="Click https://example.com" />
          </div>,
        );

        const link = screen.getByRole('link');
        fireEvent.click(link);

        expect(handleParentClick).not.toHaveBeenCalled();
      });
    });

    describe('Markdown links (disallowed)', () => {
      it('converts markdown link to plaintext', () => {
        render(<PostText content="Check out [example](https://example.com)" />);

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByText(/\[example\]\(https:\/\/example\.com\)/)).toBeInTheDocument();
      });

      it('converts deceptive markdown link to plaintext', () => {
        render(<PostText content="Visit [facebook.com](https://badsite.com)" />);

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByText(/\[facebook\.com\]\(https:\/\/badsite\.com\)/)).toBeInTheDocument();
      });

      it('converts markdown link with title to plaintext including title', () => {
        render(<PostText content='Click [here](https://example.com "My Title")' />);

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByText(/\[here\]\(https:\/\/example\.com "My Title"\)/)).toBeInTheDocument();
      });

      it('preserves surrounding text when converting markdown links', () => {
        render(<PostText content="Before [link](https://example.com) after" />);

        expect(screen.getByText(/Before/)).toBeInTheDocument();
        expect(screen.getByText(/after/)).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
      });
    });

    describe('Mixed autolinks and markdown links', () => {
      it('preserves autolinks while converting markdown links', () => {
        render(<PostText content="Visit https://good.com or [click](https://other.com)" />);

        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(1);
        expect(links[0]).toHaveAttribute('href', 'https://good.com');
        expect(screen.getByText(/\[click\]\(https:\/\/other\.com\)/)).toBeInTheDocument();
      });
    });
  });

  describe('Lists', () => {
    it('renders unordered lists', () => {
      render(<PostText content={'- Item 1\n- Item 2\n- Item 3'} />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('UL');
      expect(list).toHaveClass('list-inside', 'list-disc');

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });

    it('renders ordered lists', () => {
      render(<PostText content={'1. First\n2. Second\n3. Third'} />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('OL');
      expect(list).toHaveClass('list-inside', 'list-decimal');

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });
  });

  describe('Blockquotes', () => {
    it('renders blockquotes with correct styling', () => {
      render(<PostText content="> This is a quote" />);

      const blockquote = screen.getByText('This is a quote').closest('blockquote');
      expect(blockquote).toBeInTheDocument();
      expect(blockquote).toHaveClass('border-l-4', 'border-foreground', 'pl-4');
    });
  });

  describe('Horizontal rules', () => {
    it('renders horizontal rules', () => {
      const { container } = render(<PostText content={'Before\n\n---\n\nAfter'} />);

      const hr = container.querySelector('hr');
      expect(hr).toBeInTheDocument();
    });
  });

  describe('Unwrapped disallowed elements', () => {
    it('unwraps headings but keeps content in regular posts', () => {
      render(<PostText content="# Heading text" />);

      // Heading should be unwrapped but text preserved
      expect(screen.getByText('Heading text')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('unwraps images but handles gracefully', () => {
      const { container } = render(<PostText content="![alt text](https://example.com/image.png)" />);

      // Image should be unwrapped (not rendered as img)
      const img = container.querySelector('img');
      expect(img).not.toBeInTheDocument();
    });

    it('unwraps tables but keeps content', () => {
      render(<PostText content={'| Header |\n| ------ |\n| Cell |'} />);

      // Table should be unwrapped but content preserved
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Article mode (isArticle=true)', () => {
    describe('Headings', () => {
      it('renders h1 heading in article mode', () => {
        render(<PostText content="# Main Title" isArticle={true} />);

        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Main Title');
        expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-foreground');
      });

      it('renders h2 heading in article mode', () => {
        render(<PostText content="## Section Title" isArticle={true} />);

        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Section Title');
        expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-foreground');
      });

      it('renders h3 heading in article mode', () => {
        render(<PostText content="### Subsection Title" isArticle={true} />);

        const heading = screen.getByRole('heading', { level: 3 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Subsection Title');
        expect(heading).toHaveClass('text-xl', 'font-semibold', 'text-foreground');
      });

      it('renders h4 heading in article mode', () => {
        render(<PostText content="#### Minor Title" isArticle={true} />);

        const heading = screen.getByRole('heading', { level: 4 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Minor Title');
        expect(heading).toHaveClass('text-lg', 'font-semibold', 'text-foreground');
      });

      it('renders h5 heading in article mode', () => {
        render(<PostText content="##### Small Title" isArticle={true} />);

        const heading = screen.getByRole('heading', { level: 5 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Small Title');
        expect(heading).toHaveClass('text-base', 'font-semibold', 'text-foreground');
      });

      it('renders h6 heading in article mode', () => {
        render(<PostText content="###### Tiny Title" isArticle={true} />);

        const heading = screen.getByRole('heading', { level: 6 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Tiny Title');
        expect(heading).toHaveClass('text-sm', 'font-semibold', 'text-foreground');
      });

      it('renders multiple headings in article mode', () => {
        render(
          <PostText content={`# Main Title\n\n## Section One\n\n### Subsection\n\n## Section Two`} isArticle={true} />,
        );

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title');
        expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subsection');
      });
    });

    describe('Embedded links', () => {
      it('renders markdown link as clickable link in article mode', () => {
        render(<PostText content="Check out [Example](https://example.com)" isArticle={true} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'https://example.com');
        expect(link).toHaveTextContent('Example');
      });

      it('renders markdown link with title in article mode', () => {
        render(<PostText content='Visit [our site](https://example.com "Our Website")' isArticle={true} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'https://example.com');
        expect(link).toHaveTextContent('our site');
      });

      it('renders multiple markdown links in article mode', () => {
        render(
          <PostText content="Check [link one](https://one.com) and [link two](https://two.com)" isArticle={true} />,
        );

        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', 'https://one.com');
        expect(links[1]).toHaveAttribute('href', 'https://two.com');
      });

      it('renders nested formatting in link text in article mode', () => {
        render(<PostText content="[**bold link**](https://example.com)" isArticle={true} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'https://example.com');
        expect(link.querySelector('strong')).toHaveTextContent('bold link');
      });
    });

    describe('Combined article features', () => {
      it('renders article with headings and embedded links', () => {
        render(
          <PostText
            content={`# Article Title\n\nThis is an intro with a [link](https://example.com).\n\n## Section One\n\nMore content here.`}
            isArticle={true}
          />,
        );

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Article Title');
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section One');
        expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com');
      });

      it('renders article with all markdown features', () => {
        render(
          <PostText
            content={`# Title\n\nThis is **bold** and *italic*.\n\n## Links\n\n- [Link one](https://one.com)\n- [Link two](https://two.com)\n\n> A quote\n\n\`\`\`js\nconst x = 1;\n\`\`\``}
            isArticle={true}
          />,
        );

        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        expect(screen.getAllByRole('link')).toHaveLength(2);
        expect(screen.getByText('bold').tagName).toBe('STRONG');
        expect(screen.getByText('italic').tagName).toBe('EM');
      });
    });

    describe('Default behavior (isArticle=false)', () => {
      it('still unwraps headings when isArticle is false', () => {
        render(<PostText content="# Heading text" isArticle={false} />);

        expect(screen.getByText('Heading text')).toBeInTheDocument();
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      });

      it('still converts markdown links to plaintext when isArticle is false', () => {
        render(<PostText content="Check out [example](https://example.com)" isArticle={false} />);

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByText(/\[example\]\(https:\/\/example\.com\)/)).toBeInTheDocument();
      });

      it('still unwraps headings when isArticle is undefined (default)', () => {
        render(<PostText content="# Heading text" />);

        expect(screen.getByText('Heading text')).toBeInTheDocument();
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Hashtags', () => {
    it('renders hashtag as PostHashtags component', () => {
      render(<PostText content="Check out #bitcoin" />);

      const hashtag = screen.getByTestId('post-hashtag');
      expect(hashtag).toHaveTextContent('#bitcoin');
      expect(hashtag).toHaveAttribute('href', '/search?tags=bitcoin');
    });

    it('renders hashtag at start of content', () => {
      render(<PostText content="#trending is popular" />);

      const hashtag = screen.getByTestId('post-hashtag');
      expect(hashtag).toHaveTextContent('#trending');
    });

    it('renders hashtag at end of content', () => {
      render(<PostText content="This is about #crypto" />);

      const hashtag = screen.getByTestId('post-hashtag');
      expect(hashtag).toHaveTextContent('#crypto');
    });

    it('renders multiple hashtags', () => {
      render(<PostText content="#one #two #three" />);

      const hashtags = screen.getAllByTestId('post-hashtag');
      expect(hashtags).toHaveLength(3);
      expect(hashtags[0]).toHaveTextContent('#one');
      expect(hashtags[1]).toHaveTextContent('#two');
      expect(hashtags[2]).toHaveTextContent('#three');
    });

    it('renders hashtags alongside autolinks', () => {
      render(<PostText content="Visit https://example.com and check #topic" />);

      const links = screen.getAllByRole('link');
      const autolink = links.find((link) => link.getAttribute('href') === 'https://example.com');
      expect(autolink).toBeInTheDocument();
      expect(screen.getByTestId('post-hashtag')).toHaveTextContent('#topic');
    });

    it('renders hashtags with underscores', () => {
      render(<PostText content="Check #hello_world tag" />);

      const hashtag = screen.getByTestId('post-hashtag');
      expect(hashtag).toHaveTextContent('#hello_world');
    });

    it('renders hashtags with hyphens', () => {
      render(<PostText content="Check #hello-world tag" />);

      const hashtag = screen.getByTestId('post-hashtag');
      expect(hashtag).toHaveTextContent('#hello-world');
    });

    it('renders hashtags with mixed hyphens and underscores', () => {
      render(<PostText content="Check #hello-world_test tag" />);

      const hashtag = screen.getByTestId('post-hashtag');
      expect(hashtag).toHaveTextContent('#hello-world_test');
    });

    it('renders hashtags with numbers', () => {
      render(<PostText content="Check #web3 tag" />);

      const hashtag = screen.getByTestId('post-hashtag');
      expect(hashtag).toHaveTextContent('#web3');
    });

    it('parses hashtag starting with number', () => {
      render(<PostText content="This is #123numeric" />);

      const hashtag = screen.getByTestId('post-hashtag');
      expect(hashtag).toHaveTextContent('#123numeric');
    });

    it('renders hashtags mixed with markdown formatting', () => {
      render(<PostText content="This is **bold** and #hashtag text" />);

      expect(screen.getByText('bold').tagName).toBe('STRONG');
      expect(screen.getByTestId('post-hashtag')).toHaveTextContent('#hashtag');
    });
  });

  describe('Mentions', () => {
    const validPkMention = 'pk:8pinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo';
    const validPubkyMention = 'pubky8pinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo';

    it('renders mention as PostMentions component with pk: prefix', () => {
      render(<PostText content={`Check out ${validPkMention}`} />);

      const mention = screen.getByTestId('post-mention');
      expect(mention).toHaveTextContent(validPkMention);
      expect(mention).toHaveAttribute('href', '/profile/8pinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo');
    });

    it('renders mention as PostMentions component with pubky prefix', () => {
      render(<PostText content={`Check out ${validPubkyMention}`} />);

      const mention = screen.getByTestId('post-mention');
      expect(mention).toHaveTextContent(validPubkyMention);
      expect(mention).toHaveAttribute('href', '/profile/8pinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo');
    });

    it('renders mention at start of content', () => {
      render(<PostText content={`${validPkMention} is a great user`} />);

      const mention = screen.getByTestId('post-mention');
      expect(mention).toHaveTextContent(validPkMention);
    });

    it('renders mention at end of content', () => {
      render(<PostText content={`Check out this user ${validPkMention}`} />);

      const mention = screen.getByTestId('post-mention');
      expect(mention).toHaveTextContent(validPkMention);
    });

    it('renders multiple mentions', () => {
      const secondMention = 'pk:7qinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo';
      render(<PostText content={`${validPkMention} and ${secondMention}`} />);

      const mentions = screen.getAllByTestId('post-mention');
      expect(mentions).toHaveLength(2);
      expect(mentions[0]).toHaveTextContent(validPkMention);
      expect(mentions[1]).toHaveTextContent(secondMention);
    });

    it('renders mentions alongside autolinks', () => {
      render(<PostText content={`Visit https://example.com and follow ${validPkMention}`} />);

      const links = screen.getAllByRole('link');
      const autolink = links.find((link) => link.getAttribute('href') === 'https://example.com');
      expect(autolink).toBeInTheDocument();
      expect(screen.getByTestId('post-mention')).toHaveTextContent(validPkMention);
    });

    it('renders mentions alongside hashtags', () => {
      render(<PostText content={`${validPkMention} loves #bitcoin`} />);

      expect(screen.getByTestId('post-mention')).toHaveTextContent(validPkMention);
      expect(screen.getByTestId('post-hashtag')).toHaveTextContent('#bitcoin');
    });

    it('does not parse invalid mention with short key', () => {
      render(<PostText content="This is pk:short not a mention" />);

      expect(screen.queryByTestId('post-mention')).not.toBeInTheDocument();
    });

    it('renders mentions mixed with markdown formatting', () => {
      render(<PostText content={`This is **bold** and ${validPkMention} text`} />);

      expect(screen.getByText('bold').tagName).toBe('STRONG');
      expect(screen.getByTestId('post-mention')).toHaveTextContent(validPkMention);
    });
  });

  describe('GFM (GitHub Flavored Markdown) features', () => {
    it('renders task lists as regular lists (checkboxes unwrapped)', () => {
      render(<PostText content={'- [ ] Todo\n- [x] Done'} />);

      // Task list items should render as list items (checkboxes unwrapped)
      const items = screen.getAllByRole('listitem');
      expect(items.length).toBeGreaterThan(0);
    });

    it('renders autolinked URLs', () => {
      render(<PostText content="Check out www.example.com" />);

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Content truncation and Show more button', () => {
    it('does not truncate content under 500 characters', () => {
      const shortContent = generateContent(400);
      render(<PostText content={shortContent} />);

      expect(screen.queryByRole('button', { name: 'Show full post content' })).not.toBeInTheDocument();
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });

    it('truncates content over 500 characters and shows "Show more" button', () => {
      const longContent = generateContent(600);
      render(<PostText content={longContent} />);

      const showMoreButton = screen.getByRole('button', { name: 'Show full post content' });
      expect(showMoreButton).toBeInTheDocument();
    });

    it('shows truncated content with ellipsis when over 500 characters', () => {
      const longContent = generateContent(600);
      render(<PostText content={longContent} />);

      // The truncated content should be 500 chars + "..." + non-breaking space
      // Original content beyond 500 chars should not be present
      const originalEndText = longContent.slice(495, 505);
      expect(screen.queryByText(originalEndText)).not.toBeInTheDocument();
    });

    it('does not truncate on post detail page', () => {
      mockUsePathname.mockReturnValue('/post/some-post-id');
      const longContent = generateContent(600);
      render(<PostText content={longContent} />);

      expect(screen.queryByRole('button', { name: 'Show full post content' })).not.toBeInTheDocument();
    });

    it('does not truncate on nested post routes', () => {
      mockUsePathname.mockReturnValue('/post/author/123');
      const longContent = generateContent(600);
      render(<PostText content={longContent} />);

      expect(screen.queryByRole('button', { name: 'Show full post content' })).not.toBeInTheDocument();
    });

    it('truncates on non-post pages like home', () => {
      mockUsePathname.mockReturnValue('/home');
      const longContent = generateContent(600);
      render(<PostText content={longContent} />);

      expect(screen.getByRole('button', { name: 'Show full post content' })).toBeInTheDocument();
    });

    it('truncates on search page', () => {
      mockUsePathname.mockReturnValue('/search');
      const longContent = generateContent(600);
      render(<PostText content={longContent} />);

      expect(screen.getByRole('button', { name: 'Show full post content' })).toBeInTheDocument();
    });

    it('truncates on profile page', () => {
      mockUsePathname.mockReturnValue('/profile/some-user-id');
      const longContent = generateContent(600);
      render(<PostText content={longContent} />);

      expect(screen.getByRole('button', { name: 'Show full post content' })).toBeInTheDocument();
    });

    it('renders "Show more" button with correct styling classes', () => {
      const longContent = generateContent(600);
      render(<PostText content={longContent} />);

      const showMoreButton = screen.getByRole('button', { name: 'Show full post content' });
      expect(showMoreButton).toHaveClass('cursor-pointer');
      expect(showMoreButton).toHaveClass('text-brand');
    });

    it('does not stop event propagation on "Show more" button click', () => {
      const handleParentClick = vi.fn();
      const longContent = generateContent(600);

      render(
        <div onClick={handleParentClick}>
          <PostText content={longContent} />
        </div>,
      );

      const showMoreButton = screen.getByRole('button', { name: 'Show full post content' });
      fireEvent.click(showMoreButton);

      // Click should propagate to parent (unlike regular links)
      expect(handleParentClick).toHaveBeenCalled();
    });

    it('truncates content exactly at 500 characters plus ellipsis', () => {
      const longContent = generateContent(600);
      const { container } = render(<PostText content={longContent} />);

      // The displayed text should contain the first 500 chars
      const expectedStart = longContent.slice(0, 100);
      expect(container.textContent).toContain(expectedStart);
    });
  });
});

describe('PostText - Snapshots', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/home');
  });

  it('matches snapshot for plain text', () => {
    const { container } = render(<PostText content="Simple plain text content" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for bold and italic text', () => {
    const { container } = render(<PostText content="This is **bold** and *italic* text" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for strikethrough text', () => {
    const { container } = render(<PostText content="This is ~~strikethrough~~ text" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for inline code', () => {
    const { container } = render(<PostText content="Use `console.log()` for debugging" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for code block', () => {
    const { container } = render(
      <PostText
        content={`\`\`\`javascript
const greeting = "Hello";
console.log(greeting);
\`\`\``}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for code block without language', () => {
    const { container } = render(
      <PostText
        content={`\`\`\`
plain code block
\`\`\``}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for autolinked URL', () => {
    const { container } = render(<PostText content="Check out https://example.com for more" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for markdown link converted to plaintext', () => {
    const { container } = render(<PostText content="Check out [Example](https://example.com) for more" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for deceptive link converted to plaintext', () => {
    const { container } = render(<PostText content="Visit [facebook.com](https://badsite.com) now" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for unordered list', () => {
    const { container } = render(<PostText content={'- Apple\n- Banana\n- Cherry'} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for ordered list', () => {
    const { container } = render(<PostText content={'1. First item\n2. Second item\n3. Third item'} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for blockquote', () => {
    const { container } = render(<PostText content="> This is a quoted message" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for nested blockquote', () => {
    const { container } = render(<PostText content={'> Level 1\n>> Level 2'} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for horizontal rule', () => {
    const { container } = render(<PostText content={'Above the line\n\n---\n\nBelow the line'} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for combined markdown elements', () => {
    const { container } = render(
      <PostText
        content={`# Welcome

This is **bold** and *italic* text with a link https://example.com here.

> A meaningful quote

- Item one
- Item two

\`\`\`js
const x = 42;
\`\`\`

Use \`inline code\` for variables.`}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for empty content', () => {
    const { container } = render(<PostText content="" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for content with special characters', () => {
    const { container } = render(<PostText content={'Special chars: <>&"\' and emoji: 🎉🚀'} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for multiline content with line breaks', () => {
    const { container } = render(
      <PostText
        content={`First line
Second line
Third line`}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for autolinked URL with path and query', () => {
    const { container } = render(<PostText content="Check out https://example.com/path?query=value" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for www autolink', () => {
    const { container } = render(<PostText content="Visit www.example.com today" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for email autolink', () => {
    const { container } = render(<PostText content="Contact user@example.com for help" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for italic and strikethrough combination', () => {
    const { container } = render(<PostText content="This is *~~italic and strikethrough~~* text" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for strikethrough and italic combination', () => {
    const { container } = render(<PostText content="This is ~~*strikethrough and italic*~~ text" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for italic and bold combination', () => {
    const { container } = render(<PostText content="This is ***italic and bold*** text" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for bold and italic combination', () => {
    const { container } = render(<PostText content="This is **_bold and italic_** text" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for strikethrough and inline code combination', () => {
    const { container } = render(<PostText content="This is ~~`strikethrough and code`~~ text" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for single hashtag', () => {
    const { container } = render(<PostText content="Check out #bitcoin" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for multiple hashtags', () => {
    const { container } = render(<PostText content="#one #two #three" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for hashtag with text', () => {
    const { container } = render(<PostText content="This post is about #crypto and #blockchain technology" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for hashtag alongside autolink', () => {
    const { container } = render(<PostText content="Visit https://example.com and follow #trending" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for hashtag with markdown formatting', () => {
    const { container } = render(<PostText content="This is **bold** with #hashtag and *italic* text" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for long hashtag', () => {
    const { container } = render(
      <PostText content="Check out this #verylooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooonghashtagwithlotsofcharactersandnumbers123456789 tag" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for hashtag with underscores', () => {
    const { container } = render(<PostText content="Check out #hello_world tag" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for hashtag with hyphens', () => {
    const { container } = render(<PostText content="Check out #hello-world tag" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for hashtag with mixed hyphens and underscores', () => {
    const { container } = render(<PostText content="Check out #hello-world_test-example tag" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for single mention with pk: prefix', () => {
    const { container } = render(
      <PostText content="Check out pk:8pinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for single mention with pubky prefix', () => {
    const { container } = render(
      <PostText content="Check out pubky8pinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for multiple mentions', () => {
    const { container } = render(
      <PostText content="pk:8pinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo and pk:7qinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for mention with text', () => {
    const { container } = render(
      <PostText content="This post mentions pk:8pinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo in the middle" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for mention alongside hashtag', () => {
    const { container } = render(
      <PostText content="pk:8pinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo loves #bitcoin" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for mention alongside autolink', () => {
    const { container } = render(
      <PostText content={`Check pk:o1gg96ewuojmopcjbz8895478wench6tjmjh6kiwgbwycb35ory and https://example.com`} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for mention with markdown formatting', () => {
    const { container } = render(
      <PostText content="This is **bold** with pk:8pinxxgqs41n4aididenw5apqp1urfmzdztr8jt4abrkdn435ewo and *italic* text" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for truncated content with Show more button', () => {
    const longContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Extra text to make this longer than 500 characters for truncation testing purposes.';
    const { container } = render(<PostText content={longContent} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for non-truncated long content on post page', () => {
    mockUsePathname.mockReturnValue('/post/some-post-id');
    const longContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Extra text to make this longer than 500 characters for truncation testing purposes.';
    const { container } = render(<PostText content={longContent} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  describe('Article mode snapshots', () => {
    it('matches snapshot for article with h1 heading', () => {
      const { container } = render(<PostText content="# Main Title" isArticle={true} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for article with all heading levels', () => {
      const { container } = render(
        <PostText
          content={`# H1 Title\n\n## H2 Title\n\n### H3 Title\n\n#### H4 Title\n\n##### H5 Title\n\n###### H6 Title`}
          isArticle={true}
        />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for article with embedded link', () => {
      const { container } = render(
        <PostText content="Check out [Example](https://example.com) for more" isArticle={true} />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for article with headings and embedded links', () => {
      const { container } = render(
        <PostText
          content={`# Article Title\n\nThis is an intro with a [link](https://example.com).\n\n## Section One\n\nMore content with [another link](https://another.com).`}
          isArticle={true}
        />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for full article with all markdown features', () => {
      const { container } = render(
        <PostText
          content={`# Welcome to the Article\n\nThis is **bold** and *italic* text.\n\n## Getting Started\n\nVisit [our docs](https://docs.example.com) to learn more.\n\n### Key Features\n\n- Feature one\n- Feature two\n- Feature three\n\n> An important quote\n\n\`\`\`javascript\nconst hello = "world";\n\`\`\`\n\n## Conclusion\n\nFollow us at #article and check https://example.com`}
          isArticle={true}
        />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
