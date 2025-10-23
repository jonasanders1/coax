import * as React from 'react';

import {cn} from '@/lib/utils';

type TextareaProps = React.ComponentProps<'textarea'> & {
  autoResize?: boolean;
  maxHeight?: number; // in px
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({className, autoResize, maxHeight, onInput, value, ...props}, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const resize = React.useCallback(() => {
      if (!autoResize) return;
      const el = innerRef.current;
      if (!el) return;
      el.style.height = 'auto';
      const targetHeight = el.scrollHeight;
      const capped = typeof maxHeight === 'number' ? Math.min(targetHeight, maxHeight) : targetHeight;
      el.style.height = `${capped}px`;
      if (typeof maxHeight === 'number') {
        el.style.overflowY = targetHeight > maxHeight ? 'auto' : 'hidden';
      }
    }, [autoResize, maxHeight]);

    React.useEffect(() => {
      resize();
    }, [value, resize]);

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoResize) resize();
      onInput?.(e);
    };

    return (
      <textarea
        className={cn(
          'flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={innerRef}
        onInput={handleInput}
        value={value}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
