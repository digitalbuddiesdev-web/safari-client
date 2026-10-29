import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldErrorProps {
  id?: string;
  error?: string | null;
  className?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ id, error, className = '' }) => {
  if (!error) return null;
  return (
    <p
      id={id}
      role="alert"
      className={`text-[11px] text-red-600 mt-1.5 flex items-start gap-1.5 font-medium leading-snug animate-fadeIn ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
      <span>{error}</span>
    </p>
  );
};

