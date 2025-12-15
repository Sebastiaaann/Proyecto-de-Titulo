import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export function FloatingInput({ label, error, className = '', ...props }: FloatingInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    return (
        <div className="relative flex flex-col gap-2">
            <label
                className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${isFocused || hasValue
                        ? 'top-0 -translate-y-1/2 text-xs font-semibold text-brand-400 bg-dark-900 px-2'
                        : 'top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400'
                    }`}
            >
                {label}
            </label>
            <input
                {...props}
                onFocus={(e) => {
                    setIsFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    setHasValue(e.target.value !== '');
                    props.onBlur?.(e);
                }}
                onChange={(e) => {
                    setHasValue(e.target.value !== '');
                    props.onChange?.(e);
                }}
                className={`px-4 py-3 bg-white/5 border ${error
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-white/10 focus:ring-brand-500 focus:border-brand-500'
                    } rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 transition-all duration-300 ${isFocused ? 'shadow-glow' : ''
                    } ${className}`}
            />
            {error && (
                <span className="text-red-400 text-xs animate-shake flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </span>
            )}
        </div>
    );
}

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export function FloatingTextarea({ label, error, className = '', ...props }: FloatingTextareaProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    return (
        <div className="relative flex flex-col gap-2">
            <label
                className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${isFocused || hasValue
                        ? 'top-0 -translate-y-1/2 text-xs font-semibold text-brand-400 bg-dark-900 px-2'
                        : 'top-6 text-sm font-medium text-slate-400'
                    }`}
            >
                {label}
            </label>
            <textarea
                {...props}
                onFocus={(e) => {
                    setIsFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    setHasValue(e.target.value !== '');
                    props.onBlur?.(e);
                }}
                onChange={(e) => {
                    setHasValue(e.target.value !== '');
                    props.onChange?.(e);
                }}
                className={`px-4 py-3 pt-6 bg-white/5 border ${error
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-white/10 focus:ring-brand-500 focus:border-brand-500'
                    } rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${isFocused ? 'shadow-glow' : ''
                    } ${className}`}
            />
            {error && (
                <span className="text-red-400 text-xs animate-shake flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </span>
            )}
        </div>
    );
}
