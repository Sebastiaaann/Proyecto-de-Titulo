import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    icon?: React.ReactNode;
    children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
    loading = false,
    loadingText,
    variant = 'primary',
    icon,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-white text-black hover:bg-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]',
        secondary: 'bg-brand-600 text-white hover:bg-brand-500',
        danger: 'bg-red-600 text-white hover:bg-red-500',
        success: 'bg-green-600 text-white hover:bg-green-500',
    };

    return (
        <button
            {...props}
            disabled={disabled || loading}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingText || 'Cargando...'}</span>
                </>
            ) : (
                <>
                    {icon && icon}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
};

export default LoadingButton;
