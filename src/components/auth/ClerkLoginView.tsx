/**
 * ClerkLoginView - Modern login view using Clerk's prebuilt components
 * Replaces the old Supabase-based LoginView
 */

import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
} from "@clerk/clerk-react";
import { FleetTechLogo } from '@components/common/FleetTechLogo';

export function ClerkLoginView() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo and Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-brand-500/10 rounded-2xl border border-brand-500/20">
                            <FleetTechLogo size={48} className="text-brand-500" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        FleetTech
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Gestión Inteligente de Flotas
                    </p>
                </div>

                {/* Authentication Card */}
                <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/5 p-8">
                    <SignedOut>
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white text-center mb-6">
                                Accede a tu cuenta
                            </h2>

                            <SignInButton mode="modal">
                                <button className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/20">
                                    Iniciar Sesión
                                </button>
                            </SignInButton>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-dark-900/50 text-slate-500">o</span>
                                </div>
                            </div>

                            <SignUpButton mode="modal">
                                <button className="w-full py-3 px-4 border border-slate-600 hover:border-slate-500 hover:bg-white/5 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                                    Crear Cuenta
                                </button>
                            </SignUpButton>

                            <p className="text-xs text-slate-500 text-center mt-6">
                                Al continuar, aceptas nuestros términos de servicio y política de privacidad
                            </p>
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <div className="flex flex-col items-center space-y-4">
                            <p className="text-slate-400">Sesión iniciada</p>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-12 h-12"
                                    }
                                }}
                            />
                        </div>
                    </SignedIn>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-sm">
                    © 2025 FleetTech Corp. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
