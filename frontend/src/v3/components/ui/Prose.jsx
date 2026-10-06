import React from 'react';
import { cn } from '../../lib/cn';

/*
  AI answers arrive as light markdown and older stored messages may contain emoji.
  This renderer handles headings, lists, tables, rules and inline emphasis, and
  strips pictographs at render time so a stored emoji can never reach the
  interface (the product rule is no emoji in AI text, enforced backend-side too).
*/
const EMOJI_RE =
  /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}]/gu;

const clean = (text) =>
  String(text || '')
    .replace(EMOJI_RE, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]{2,}/g, ' ').replace(/\s+$/, ''))
    .join('\n');

const inline = (text, keyPrefix, tone) => {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter(Boolean);
  const strong = tone === 'dusk' ? 'font-semibold text-dusk-text' : 'font-semibold text-sand-950';
  const code =
    tone === 'dusk'
      ? 'bg-white/10 text-dusk-body'
      : 'bg-sand-100 text-sand-900';

  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={key} className={strong}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={key} className={cn('v3-num rounded-md px-1.5 py-0.5 font-mono3 text-m4', code)}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
};

const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line);
const isTableDivider = (line) => /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-');
const isRule = (line) => /^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line);

const cells = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

const MarkdownTable = ({ rows, keyPrefix, tone }) => {
  const cleaned = rows.filter((r) => !isTableDivider(r));
  if (cleaned.length === 0) return null;
  const [head, ...body] = cleaned;
  const dusk = tone === 'dusk';

  return (
    <div className={cn('v3-scroll-x my-2 overflow-hidden rounded-ctl3 border', dusk ? 'border-white/10' : 'border-sand-200')}>
      <table className="w-full border-collapse text-left text-b3">
        <thead>
          <tr>
            {cells(head).map((cell, i) => (
              <th
                key={i}
                className={cn(
                  'border-b px-3 py-2 text-mic uppercase tracking-caps',
                  dusk ? 'border-white/10 bg-white/5 text-petrol-200' : 'border-sand-200 bg-bone text-sand-600'
                )}
              >
                {inline(cell, `${keyPrefix}-h-${i}`, tone)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri}>
              {cells(row).map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    'v3-num border-b px-3 py-2 align-top last:border-b-0',
                    dusk ? 'border-white/8 text-dusk-body' : 'border-sand-200 text-sand-800'
                  )}
                >
                  {inline(cell, `${keyPrefix}-r${ri}-${ci}`, tone)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Prose = ({ text, tone = 'sand', className = '' }) => {
  const source = clean(text).trim();
  if (!source) return null;

  const lines = source.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (isRule(line)) {
      blocks.push({ type: 'rule', key: `rule-${i}` });
      i += 1;
      continue;
    }

    if (isTableRow(line)) {
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: 'table', key: `table-${i}`, rows });
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: 'heading', key: `h-${i}`, level: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ul', key: `ul-${i}`, items });
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ol', key: `ol-${i}`, items });
      continue;
    }

    const paragraph = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !isRule(lines[i]) &&
      !isTableRow(lines[i]) &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: 'p', key: `p-${i}`, lines: paragraph });
  }

  const dusk = tone === 'dusk';

  return (
    <div className={cn('space-y-3 text-b2 leading-relaxed', dusk ? 'text-dusk-body' : 'text-sand-700', className)}>
      {blocks.map((block) => {
        if (block.type === 'rule') {
          return <hr key={block.key} className={dusk ? 'border-white/10' : 'border-sand-200'} />;
        }
        if (block.type === 'table') {
          return <MarkdownTable key={block.key} rows={block.rows} keyPrefix={block.key} tone={tone} />;
        }
        if (block.type === 'heading') {
          return (
            <h3
              key={block.key}
              className={cn(
                'pt-1 text-d5',
                dusk ? 'text-dusk-text' : 'text-sand-950',
                block.level <= 2 && 'text-d4'
              )}
            >
              {inline(block.text, block.key, tone)}
            </h3>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={block.key} className="space-y-1.5 pl-4">
              {block.items.map((item, li) => (
                <li key={li} className="relative pl-3">
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-0 top-[0.55em] h-1.5 w-1.5 rounded-full',
                      dusk ? 'bg-petrol-300' : 'bg-petrol-400'
                    )}
                  />
                  {inline(item, `${block.key}-${li}`, tone)}
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={block.key} className="space-y-1.5 pl-1">
              {block.items.map((item, li) => (
                <li key={li} className="flex gap-2.5">
                  <span
                    className={cn(
                      'v3-num mt-px shrink-0 font-mono3 text-m4 font-semibold',
                      dusk ? 'text-petrol-200' : 'text-petrol-700'
                    )}
                  >
                    {String(li + 1).padStart(2, '0')}
                  </span>
                  <span>{inline(item, `${block.key}-${li}`, tone)}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={block.key}>
            {block.lines.map((l, li) => (
              <React.Fragment key={li}>
                {li > 0 && <br />}
                {inline(l, `${block.key}-${li}`, tone)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};
