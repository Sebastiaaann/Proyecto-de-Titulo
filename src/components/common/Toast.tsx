import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast Provider Component - Add this to your App.tsx
export const ToastProvider: React.FC = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#1e293b',
                    color: '#f1f5f9',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                },
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                },
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
};

// Custom Toast Functions with enhanced animations
export const showToast = {
    success: (message: string, subtitle?: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'toast-enter' : 'toast-exit'
                    } max-w-md w-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-green-500/20 border border-green-500/30 hover-lift`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold text-white">{message}</p>
                            {subtitle && (
                                <p className="mt-1 text-xs text-green-300/80">{subtitle}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-green-500/20">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-green-500 rounded-b-xl toast-progress"></div>
            </div>
        ), { duration: 3000 });
    },

    error: (message: string, details?: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'toast-enter' : 'toast-exit'
                    } max-w-md w-full bg-gradient-to-r from-red-500/10 to-rose-500/10 backdrop-blur-xl shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-red-500/20 border border-red-500/30 hover-lift`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-400" />
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold text-white">{message}</p>
                            {details && (
                                <p className="mt-1 text-xs text-red-300/80">{details}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-red-500/20">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-red-500 rounded-b-xl toast-progress"></div>
            </div>
        ), { duration: 5000 });
    },

    warning: (message: string, subtitle?: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'toast-enter' : 'toast-exit'
                    } max-w-md w-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-yellow-500/20 border border-yellow-500/30 hover-lift`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold text-white">{message}</p>
                            {subtitle && (
                                <p className="mt-1 text-xs text-yellow-300/80">{subtitle}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-yellow-500/20">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 rounded-b-xl toast-progress"></div>
            </div>
        ), { duration: 4000 });
    },

    info: (message: string, subtitle?: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'toast-enter' : 'toast-exit'
                    } max-w-md w-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-xl shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-blue-500/20 border border-blue-500/30 hover-lift`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Info className="h-5 w-5 text-blue-400" />
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold text-white">{message}</p>
                            {subtitle && (
                                <p className="mt-1 text-xs text-blue-300/80">{subtitle}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-blue-500/20">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-xl toast-progress"></div>
            </div>
        ), { duration: 4000 });
    },
};

export default showToast;
