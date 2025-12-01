import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostText } from './PostText';

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

describe('PostText', () => {
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
    it('renders links with correct attributes', () => {
      render(<PostText content="Check out [example](https://example.com)" />);

      const link = screen.getByRole('link', { name: 'example' });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders links with brand color and hover classes', () => {
      render(<PostText content="Visit [site](https://site.com)" />);

      const link = screen.getByRole('link', { name: 'site' });
      expect(link).toHaveClass('text-brand');
      expect(link).toHaveClass('cursor-pointer');
      expect(link).toHaveClass('transition-colors');
    });

    it('stops event propagation on link click', () => {
      const handleParentClick = vi.fn();
      render(
        <div onClick={handleParentClick}>
          <PostText content="Click [here](https://example.com)" />
        </div>,
      );

      const link = screen.getByRole('link', { name: 'here' });
      fireEvent.click(link);

      expect(handleParentClick).not.toHaveBeenCalled();
    });

    it('renders auto-linked URLs from GFM', () => {
      render(<PostText content="Visit https://example.com for more info" />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
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
    it('unwraps headings but keeps content', () => {
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

    it('renders hashtags alongside regular links', () => {
      render(<PostText content="Visit [site](https://example.com) and check #topic" />);

      expect(screen.getByRole('link', { name: 'site' })).toBeInTheDocument();
      expect(screen.getByTestId('post-hashtag')).toHaveTextContent('#topic');
    });

    it('renders hashtags with underscores', () => {
      render(<PostText content="Check #hello_world tag" />);

      const hashtag = screen.getByTestId('post-hashtag');
      expect(hashtag).toHaveTextContent('#hello_world');
    });

    it('renders hashtags with numbers', () => {
      render(<PostText content="Check #web3 tag" />);

      const hashtag = screen.getByTestId('post-hashtag');
      expect(hashtag).toHaveTextContent('#web3');
    });

    it('does not parse hashtag starting with number', () => {
      render(<PostText content="This is #123invalid" />);

      expect(screen.queryByTestId('post-hashtag')).not.toBeInTheDocument();
    });

    it('renders hashtags mixed with markdown formatting', () => {
      render(<PostText content="This is **bold** and #hashtag text" />);

      expect(screen.getByText('bold').tagName).toBe('STRONG');
      expect(screen.getByTestId('post-hashtag')).toHaveTextContent('#hashtag');
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
});

describe('PostText - Snapshots', () => {
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

  it('matches snapshot for links', () => {
    const { container } = render(<PostText content="Visit [Example Site](https://example.com) for more" />);
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

This is **bold** and *italic* text with a [link](https://example.com).

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

  it('matches snapshot for autolinked URL', () => {
    const { container } = render(<PostText content="Check out https://example.com/path?query=value" />);
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

  it('matches snapshot for hashtag alongside link', () => {
    const { container } = render(<PostText content="Visit [Example](https://example.com) and follow #trending" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for hashtag with markdown formatting', () => {
    const { container } = render(<PostText content="This is **bold** with #hashtag and *italic* text" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
