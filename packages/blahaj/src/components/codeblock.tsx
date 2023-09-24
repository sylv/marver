import type { PrismTheme } from 'prism-react-renderer';
import { Highlight } from 'prism-react-renderer';
import { type FC } from 'react';

export const theme: PrismTheme = {
  plain: {},
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata', 'punctuation'],
      style: {
        color: '#6c6783',
      },
    },
    {
      types: ['namespace'],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ['tag', 'operator', 'number'],
      style: {
        color: '#f92690',
      },
    },
    {
      types: ['function', 'parameter'],
      style: {
        color: 'var(--atlas-foreground)',
      },
    },
    {
      types: ['string', 'keyword'],
      style: {
        color: '#f079e6',
      },
    },
    {
      types: ['tag-id', 'selector', 'atrule-id'],
      style: {
        color: '#eeebff',
      },
    },
    {
      types: ['attr-name'],
      style: {
        color: '#c4b9fe',
      },
    },
    {
      types: [
        'boolean',
        'entity',
        'url',
        'attr-value',
        'control',
        'directive',
        'unit',
        'statement',
        'regex',
        'at-rule',
        'placeholder',
        'variable',
        'property',
      ],
      style: {
        color: '#d3d3d3', // light gray
      },
    },
    {
      types: ['deleted'],
      style: {
        textDecorationLine: 'line-through',
      },
    },
    {
      types: ['inserted'],
      style: {
        textDecorationLine: 'underline',
      },
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic',
      },
    },
    {
      types: ['important', 'bold'],
      style: {
        fontWeight: 'bold',
      },
    },
    {
      types: ['important'],
      style: {
        color: '#c4b9fe',
      },
    },
  ],
};

export const Codeblock: FC<{ children: string; className?: string; lineClassName?: string }> = ({
  children,
  className,
  lineClassName,
}) => (
  <Highlight theme={theme} code={children} language="js">
    {({ style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className}>
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line })}>
            <span className="text-sm text-gray-400 select-none inline-block w-6">{i + 1}</span>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token })} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>
);
