import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';

// MarkdownRenderer is a custom lightweight renderer (NOT react-markdown).
// It handles: code blocks (```), bullet lists (- / *), headings (# and ##),
// and plain paragraph text. Bold/italic are NOT supported by this implementation.
// Tests must match the actual component behavior.

describe('MarkdownRenderer Component', () => {
  it('renders plain text content', () => {
    render(<MarkdownRenderer content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders heading level 1 (# prefix) as h3 element', () => {
    render(<MarkdownRenderer content="# Section Title" />);
    // The component renders `# ` as <h3>; the content after "# " is rendered
    const heading = document.querySelector('h3');
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toBe('Section Title');
  });

  it('renders heading level 2 (## prefix) as h4 element', () => {
    render(<MarkdownRenderer content="## Sub Section" />);
    // The component renders `## ` as <h4>
    const heading = document.querySelector('h4');
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toBe('Sub Section');
  });

  it('renders unordered list items with dash prefix', () => {
    const content = `- Item one
- Item two
- Item three`;
    render(<MarkdownRenderer content={content} />);
    const items = document.querySelectorAll('li');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('renders unordered list items with asterisk prefix', () => {
    const content = `* Alpha
* Beta`;
    render(<MarkdownRenderer content={content} />);
    const items = document.querySelectorAll('li');
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('renders code blocks with monospace styling', () => {
    render(<MarkdownRenderer content={"```javascript\nconsole.log('hello');\n```"} />);
    const codeBlock = document.querySelector('code');
    expect(codeBlock).toBeInTheDocument();
  });

  it('renders code block language label', () => {
    render(<MarkdownRenderer content={"```typescript\nconst x = 1;\n```"} />);
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('renders code block content correctly', () => {
    render(<MarkdownRenderer content={"```\nhello world\n```"} />);
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('renders empty content gracefully without crashing', () => {
    const { container } = render(<MarkdownRenderer content="" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders plain paragraph text in a p element', () => {
    render(<MarkdownRenderer content="Regular paragraph text." />);
    const para = document.querySelector('p');
    expect(para).toBeInTheDocument();
    expect(para?.textContent).toContain('Regular paragraph text.');
  });

  it('renders multiple lines as separate paragraphs', () => {
    render(<MarkdownRenderer content={'Line one\nLine two'} />);
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });
});
