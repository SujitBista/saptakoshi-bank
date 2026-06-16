import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, id, className = "", ...props }, ref) {
    const textareaId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-brand-black-75"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-brand-black shadow-sm transition-colors placeholder:text-brand-black-50 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-brand-black-15 focus:border-brand-blue"
          } ${className}`}
          {...props}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }
);
