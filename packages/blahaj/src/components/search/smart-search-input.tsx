import clsx from 'clsx';
import { type HTMLAttributes, memo, useEffect, useMemo, useRef } from 'react';
import React from 'react';

export interface SmartSearchInputProps
  extends Omit<HTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  value: string;
  height: string;
  onChange: (value: string) => void;
}

const BASE_CLASSES =
  'border border-1 border-transparent p-2 font-mono whitespace-pre-wrap break-words text-base';

// this is "a test" => ["this", " ", is", " ", "a test"]
const splitQuery = (input: string): string[] => {
  const parts = [];
  let currentPart = '';
  let inQuotes = false;

  for (const char of input) {
    if (char === '"') {
      inQuotes = !inQuotes;
      currentPart += char;
    } else if (char === ' ' && !inQuotes) {
      parts.push(currentPart, ' ');
      currentPart = '';
    } else {
      currentPart += char;
    }
  }

  parts.push(currentPart);

  return parts;
};

const resetHeight = (element: HTMLTextAreaElement, minHeight: number) => {
  element.style.height = 'inherit';
  element.style.height = `max(${element.scrollHeight}px, ${minHeight}px)`;
};

export const SmartSearchInput = memo<SmartSearchInputProps>(({ value, height, onChange, ...rest }) => {
  const split = useMemo(() => splitQuery(value), [value]);
  const [minHeight, setMinHeight] = React.useState(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tokens = useMemo(() => {
    return split.map((part, index) => {
      if (part.includes(':')) {
        const [before, ...after] = part.split(':');
        const key = index + part;
        return (
          <span key={key} className="bg-purple-400/20 outline outline-1 outline-purple-500">
            <span className="text-purple-300">{before}:</span>
            <span className="text-purple-100">{after.join(':')}</span>
          </span>
        );
      }

      return part;
    });
  }, [split]);

  useEffect(() => {
    if (!textAreaRef.current) return;
    resetHeight(textAreaRef.current, minHeight);
  }, [textAreaRef.current]);

  useEffect(() => {
    if (!containerRef.current) return;
    setMinHeight(containerRef.current.clientHeight);
  }, [containerRef.current]);

  return (
    <div className={clsx('relative', height)} ref={containerRef}>
      <div className={clsx('absolute inset-0 select-none pointer-events-none', BASE_CLASSES)}>{tokens}</div>
      <textarea
        {...rest}
        placeholder="Search by name, path, operators, and more"
        autoComplete="off"
        spellCheck={false}
        value={value}
        ref={textAreaRef}
        onChange={(e) => {
          onChange(e.target.value);
          resetHeight(e.target, minHeight);
        }}
        onKeyUp={(event) => {
          resetHeight(event.currentTarget, minHeight);
        }}
        className={clsx(
          'relative flex resize-none outline-none w-full bg-transparent text-transpaernt caret-white z-10 focus:border-purple-400/50',
          BASE_CLASSES,
        )}
      />
    </div>
  );
});
