import React from 'react';
// Minimal inline markdown renderer – no heavy dependencies.
// Renders headings, bold, italic, code, links, and line breaks safely.

interface MarkdownRendererProps {
  markdown: string;
  className?: string;
}

/** Very lightweight client-side markdown renderer (no external lib) */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown, className = '' }) => {
  const renderMarkdown = (text: string): string => {
    let html = text
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Code blocks (must come before inline code)
      .replace(/```[\w]*\n?([\s\S]*?)```/gm, '<pre class="md-pre"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
      // Headings
      .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
      // Blockquote
      .replace(/^&gt; (.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>')
      // Task lists
      .replace(/^- \[x\] (.+)$/gm, '<li class="md-task-item md-task-done">✅ $1</li>')
      .replace(/^- \[ \] (.+)$/gm, '<li class="md-task-item">☐ $1</li>')
      // Unordered list items
      .replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
      // @mentions
      .replace(/@([a-zA-Z0-9_-]+)/g, '<span class="md-mention">@$1</span>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="md-p">')
      .replace(/\n/g, '<br/>');

    return `<p class="md-p">${html}</p>`;
  };

  if (!markdown || markdown === '_Comment deleted_') {
    return (
      <p className={`text-xs italic text-zinc-600 ${className}`}>
        {markdown || ''}
      </p>
    );
  }

  return (
    <div
      className={`md-content text-sm text-zinc-200 leading-relaxed ${className}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
};
