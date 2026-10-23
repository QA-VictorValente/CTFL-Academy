import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id, ...props }, ref) => {
    const textareaEl = (
      <textarea
        id={id}
        className={cn(
          'flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (!label) {
      return textareaEl;
    }

    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-medium text-foreground">
          {label}
        </label>
        {textareaEl}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
