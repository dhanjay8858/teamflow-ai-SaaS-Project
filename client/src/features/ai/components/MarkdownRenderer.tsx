import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2 rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden text-xs font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800/60 text-[11px] text-zinc-400">
        <span className="text-zinc-500 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-zinc-300 leading-relaxed whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
};

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse codeblocks vs text formatting cleanly
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs leading-relaxed text-zinc-200">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          const language = part.slice(3, firstLineEnd).trim() || 'text';
          const code = part.slice(firstLineEnd + 1, -3).trim();
          return <CodeBlock key={index} code={code} language={language} />;
        }

        // Standard text with bold / bullet list formatting
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-1">
            {lines.map((line, lIdx) => {
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                  <li key={lIdx} className="ml-4 list-disc text-zinc-300">
                    {line.slice(2)}
                  </li>
                );
              }
              if (line.startsWith('# ')) {
                return <h3 key={lIdx} className="font-bold text-sm text-white mt-2">{line.slice(2)}</h3>;
              }
              if (line.startsWith('## ')) {
                return <h4 key={lIdx} className="font-bold text-xs text-zinc-100 mt-2">{line.slice(3)}</h4>;
              }
              return <p key={lIdx} className="whitespace-pre-wrap">{line}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};
