import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0a1e] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-purple-600 hover:bg-purple-500 text-white focus:ring-purple-500 shadow-lg shadow-purple-900/30",
    secondary:
      "bg-white/10 hover:bg-white/20 text-white border border-white/20 focus:ring-white/30",
    ghost:
      "bg-transparent hover:bg-white/10 text-gray-300 hover:text-white focus:ring-white/20",
    danger:
      "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500 shadow-lg shadow-red-900/30",
    gold:
      "bg-yellow-600 hover:bg-yellow-500 text-white focus:ring-yellow-500 shadow-lg shadow-yellow-900/30",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Загрузка...
        </>
      ) : (
        children
      )}
    </button>
  );
}
