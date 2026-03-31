import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm",
          "bg-white/5 border border-white/10",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
          "transition-all duration-200",
          error && "border-red-500/60 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
