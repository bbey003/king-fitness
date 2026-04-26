'use client';
import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
  useId,
} from 'react';

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}

function FieldWrapper({ label, error, hint, required, children, htmlFor }: FieldWrapperProps): React.ReactElement {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-white/80">
          {label}
          {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-white/50">{hint}</p>}
      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, required, id, ...rest },
  ref
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper
      label={label}
      error={error}
      hint={hint}
      required={required}
      htmlFor={fieldId}
    >
      <input
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        className={`field-input ${error ? 'border-red-500/60' : ''}`}
        {...rest}
      />
    </FieldWrapper>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, required, id, ...rest }, ref) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldWrapper label={label} error={error} hint={hint} required={required} htmlFor={fieldId}>
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          className={`field-input min-h-[100px] ${error ? 'border-red-500/60' : ''}`}
          {...rest}
        />
      </FieldWrapper>
    );
  }
);

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, required, options, id, ...rest },
  ref
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} htmlFor={fieldId}>
      <select
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        className={`field-input appearance-none ${error ? 'border-red-500/60' : ''}`}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink-950">
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
});

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

export function Checkbox({ label, error, id, ...rest }: CheckboxProps): React.ReactElement {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div>
      <label htmlFor={fieldId} className="flex items-start gap-3 cursor-pointer text-sm text-white/80">
        <input
          id={fieldId}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/5 text-brand-500 focus:ring-brand-400"
          aria-invalid={error ? 'true' : undefined}
          {...rest}
        />
        <span>{label}</span>
      </label>
      {error && <p className="text-xs text-red-400 mt-1" role="alert">{error}</p>}
    </div>
  );
}
