import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  text?: string | null;
  className?: string;
  block?: boolean;
}

interface ParsedToken {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
}

/**
 * Parses a string containing LaTeX delimiters ($...$, $$...$$, \(...\), \[...\])
 * into tokens for rendering.
 */
function parseLatexTokens(raw: string): ParsedToken[] {
  if (!raw) return [];

  const tokens: ParsedToken[] = [];
  // Regex to match block math $$...$$ or \[...\], and inline math $...$ or \(...\)
  const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$\n]+?\$|\\\([\s\S]*?\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    // Add text preceding the match
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: raw.slice(lastIndex, match.index),
      });
    }

    const fullMatch = match[0];
    if (fullMatch.startsWith('$$') && fullMatch.endsWith('$$')) {
      tokens.push({
        type: 'block-math',
        content: fullMatch.slice(2, -2).trim(),
      });
    } else if (fullMatch.startsWith('\\[') && fullMatch.endsWith('\\]')) {
      tokens.push({
        type: 'block-math',
        content: fullMatch.slice(2, -2).trim(),
      });
    } else if (fullMatch.startsWith('$') && fullMatch.endsWith('$')) {
      tokens.push({
        type: 'inline-math',
        content: fullMatch.slice(1, -1).trim(),
      });
    } else if (fullMatch.startsWith('\\(') && fullMatch.endsWith('\\)')) {
      tokens.push({
        type: 'inline-math',
        content: fullMatch.slice(2, -2).trim(),
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Add trailing text
  if (lastIndex < raw.length) {
    tokens.push({
      type: 'text',
      content: raw.slice(lastIndex),
    });
  }

  return tokens;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({
  text,
  className = '',
  block = false,
}) => {
  const content = text ?? '';

  const renderedContent = useMemo(() => {
    if (!content.trim()) return null;

    // Check if the content has delimiters
    const hasDelimiters =
      content.includes('$') ||
      content.includes('\\(') ||
      content.includes('\\[') ||
      content.includes('$$');

    // If no delimiters, but the entire string starts with or contains raw LaTeX commands (like \frac, \sqrt, \begin, etc.),
    // treat the whole string as math if requested or if it strongly looks like pure formula
    if (!hasDelimiters) {
      const isPureLatexCommand =
        content.trim().startsWith('\\') ||
        /\\(frac|sqrt|sum|int|lim|begin|alpha|beta|gamma|theta|le|ge|neq|times|div|pm|vec)/.test(content);

      if (isPureLatexCommand) {
        try {
          const html = katex.renderToString(content.trim(), {
            displayMode: block,
            throwOnError: false,
          });
          return (
            <span
              className={block ? 'block my-2 overflow-x-auto text-center' : 'inline-block align-middle'}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span>{content}</span>;
        }
      }

      // Regular text with line breaks preserved
      return (
        <span>
          {content.split('\n').map((line, idx, arr) => (
            <React.Fragment key={idx}>
              {line}
              {idx < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </span>
      );
    }

    // Parse tokens
    const tokens = parseLatexTokens(content);

    return tokens.map((token, index) => {
      if (token.type === 'text') {
        return (
          <span key={index}>
            {token.content.split('\n').map((line, lIdx, lArr) => (
              <React.Fragment key={lIdx}>
                {line}
                {lIdx < lArr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        );
      }

      const isBlock = token.type === 'block-math' || block;
      try {
        const html = katex.renderToString(token.content, {
          displayMode: isBlock,
          throwOnError: false,
        });
        return (
          <span
            key={index}
            className={
              isBlock
                ? 'block my-2.5 overflow-x-auto text-center py-1'
                : 'inline-block px-0.5 align-middle'
            }
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err: any) {
        return (
          <span
            key={index}
            className="inline-block px-1.5 py-0.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200 font-mono"
            title={err?.message || 'Formula error'}
          >
            ${token.content}$
          </span>
        );
      }
    });
  }, [content, block]);

  return <span className={`math-content ${className}`}>{renderedContent}</span>;
};
