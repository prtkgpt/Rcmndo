"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className = "", label, error, id, maxLength, showCount, value, ...props },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, "-");
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          className={`w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none ${
            error ? "border-error focus:ring-error" : ""
          } ${className}`}
          {...props}
        />
        <div className="flex justify-between items-center mt-1.5">
          {error && <p className="text-sm text-error">{error}</p>}
          {showCount && maxLength && (
            <p
              className={`text-xs ml-auto ${
                currentLength >= maxLength ? "text-error" : "text-muted"
              }`}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
