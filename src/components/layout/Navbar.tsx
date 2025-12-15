
import React, { useEffect, useRef, useState } from 'react';
import { AppView } from '@/types';
import { useStore } from '@store/useStore';
import { LayoutDashboard, Truck, Map, PieChart, Zap, FileCheck, Radar, Smartphone, Sun, Moon, LogOut, User } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@hooks/useAuth';
import { showToast } from '@components/common/Toast';

const Navbar: React.FC = () => {
  const { currentView, setView } = useStore();
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const navRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLButtonElement | null)[]>([]);
  const contactRef = useRef<HTMLDivElement>(null);
  const topLineRef = useRef<HTMLSpanElement>(null);
  const bottomLineRef = useRef<HTMLSpanElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const iconTL = useRef<gsap.core.Timeline | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showBurger, setShowBurger] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: AppView.FLEET, label: 'Equipo', icon: <Truck className="w-5 h-5" /> },
    { id: AppView.ROUTES, label: 'Rutas', icon: <Map className="w-5 h-5" /> },
    { id: AppView.ROUTE_BUILDER, label: 'Constructor', icon: <Zap className="w-5 h-5" /> },
    { id: AppView.FINANCIALS, label: 'Finanzas', icon: <PieChart className="w-5 h-5" /> },
    { id: AppView.COMPLIANCE, label: 'Cumplimiento', icon: <FileCheck className="w-5 h-5" /> },
    { id: AppView.DRIVER_MOBILE, label: 'App Conductor', icon: <Smartphone className="w-5 h-5" /> },
  ];

  const toggleMenu = () => {
    if (!tl.current || !iconTL.current) return;

    if (isOpen) {
      tl.current.reverse();
      iconTL.current.reverse();
    } else {
      tl.current.play();
      iconTL.current.play();
    }
    setIsOpen(!isOpen);
  };

  const handleNavClick = (view: AppView) => {
    setView(view);
    if (tl.current && iconTL.current) {
      tl.current.reverse();
      iconTL.current.reverse();
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast.success('Sesión cerrada', 'Has cerrado sesión correctamente');
    } catch (error) {
      showToast.error('Error', 'No se pudo cerrar la sesión');
    }
  };

  const formatRole = (role: string | undefined): string => {
    if (!role) return 'Usuario';
    const roleMap: Record<string, string> = {
      admin: 'Administrador',
      fleet_manager: 'Gerente de Flota',
      driver: 'Conductor',
    };
    return roleMap[role] || role;
  };

  const getUserInitial = (name: string | null | undefined): string => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // GSAP Animations
  useGSAP(() => {
    if (!navRef.current) return;

    // Initial state
    gsap.set(navRef.current, { xPercent: 100 });
    gsap.set([...linksRef.current, contactRef.current].filter(Boolean), {
      autoAlpha: 0,
      x: -20,
    });

    // Menu slide-in timeline
    tl.current = gsap
      .timeline({ paused: true })
      .to(navRef.current, {
        xPercent: 0,
        duration: 0.8,
        ease: 'power3.inOut',
      })
      .to(
        [...linksRef.current].filter(Boolean),
        {
          autoAlpha: 1,
          x: 0,
          stagger: 0.08,
          duration: 0.4,
          ease: 'power2.out',
        },
        '<+0.2'
      )
      .to(
        contactRef.current,
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.4,
          ease: 'power2.out',
        },
        '<+0.3'
      );

    // Hamburger icon animation
    iconTL.current = gsap
      .timeline({ paused: true })
      .to(topLineRef.current, {
        rotate: 45,
        y: 6,
        duration: 0.3,
        ease: 'power2.inOut',
      })
      .to(
        bottomLineRef.current,
        {
          rotate: -45,
          y: -6,
          duration: 0.3,
          ease: 'power2.inOut',
        },
        '<'
      );
  }, []);

  // Scroll behavior for hamburger button
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowBurger(currentScrollY < lastScrollY || currentScrollY < 10);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <>
      {/* Main Navbar Mejorado */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl bg-dark-900/90 border-b border-white/5 shadow-xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1 -ml-1"
              onClick={() => setView(AppView.HOME)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setView(AppView.HOME);
                }
              }}
              aria-label="Ir al inicio"
            >
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 bg-brand-500/20 rounded-lg blur-md group-hover:blur-lg transition-all"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                  <Zap className="text-white w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white leading-none">
                  FLEET<span className="text-brand-500">TECH</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-medium leading-none mt-0.5">OS Logístico</span>
              </div>
            </div>

            {/* Desktop Nav Mejorado */}
            <div className="hidden lg:flex items-center flex-1 justify-center px-8">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-white/5 to-white/[0.02] rounded-2xl p-1.5 border border-white/5 shadow-inner">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`ripple group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${currentView === item.id
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-white/10 hover:scale-105'
                      }`}
                  >
                    <span className={`w-5 h-5 transition-transform duration-300 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Profile Dropdown - Desktop */}
            <div className="hidden lg:block relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="ripple flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 hover:shadow-glow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Menú de usuario"
                aria-expanded={showUserMenu}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-500/20">
                  {getUserInitial(profile?.full_name)}
                </div>
                {/* User Info */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-semibold text-white truncate max-w-[120px]">
                    {profile?.full_name || 'Usuario'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatRole(profile?.role)}
                  </span>
                </div>
                {/* Dropdown indicator */}
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-dark-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Menu Items */}
                  <div className="py-1.5">
                    {/* Theme Toggle */}
                    <button
                      onClick={() => {
                        toggleTheme();
                        setShowUserMenu(false);
                      }}
                      className="ripple w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200"
                    >
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-blue-400" />
                      )}
                      <span className="font-medium">Cambiar tema</span>
                    </button>

                    {/* Divider */}
                    <div className="my-1.5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="ripple w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        ref={navRef}
        className="fixed z-50 flex flex-col justify-between w-full h-full px-8 bg-gradient-to-br from-dark-950 via-dark-900 to-black text-white py-20 gap-y-10 md:w-1/2 md:left-1/2 border-l border-white/10"
      >
        {/* Navigation Items */}
        <div className="flex flex-col text-3xl gap-y-3 md:text-4xl lg:text-5xl mt-16">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => { linksRef.current[index] = el; }}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-4 transition-all duration-300 cursor-pointer uppercase tracking-tight font-bold text-left ${currentView === item.id
                ? 'text-brand-400 translate-x-2'
                : 'text-white/60 hover:text-white hover:translate-x-2'
                }`}
            >
              <div className={currentView === item.id ? 'text-brand-400' : 'text-white/40'}>
                {item.icon}
              </div>
              {item.label}
              {currentView === item.id && (
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse ml-2"></div>
              )}
            </button>
          ))}
        </div>

        {/* Contact Info */}
        <div ref={contactRef} className="flex flex-col gap-6 text-sm">
          {/* User Info - Mobile */}
          <div className="font-light">
            <p className="tracking-wider text-white/40 uppercase text-xs mb-2">Usuario</p>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-semibold border border-white/10">
                {getUserInitial(profile?.full_name)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {profile?.full_name || 'Usuario'}
                </span>
                <span className="text-xs text-slate-500">
                  {formatRole(profile?.role)}
                </span>
              </div>
            </div>
          </div>

          {/* Theme Toggle - Mobile */}
          <div className="font-light">
            <p className="tracking-wider text-white/40 uppercase text-xs mb-2">Apariencia</p>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 w-fit"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-slate-300">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Modo Oscuro</span>
                </>
              )}
            </button>
          </div>

          {/* Logout - Mobile */}
          <div className="font-light">
            <p className="tracking-wider text-white/40 uppercase text-xs mb-2">Sesión</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 w-fit text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>

          <div className="font-light">
            <p className="tracking-wider text-white/40 uppercase text-xs mb-2">FleetTech</p>
            <p className="text-lg tracking-wide text-white/80">OS Logístico Inteligente</p>
          </div>
        </div>
      </div>

      {/* Animated Hamburger Button */}
      <div
        className="fixed z-50 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 bg-gradient-to-br from-brand-500 to-brand-900 rounded-full cursor-pointer w-14 h-14 md:w-16 md:h-16 top-6 right-6 lg:hidden border border-white/20 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
        onClick={toggleMenu}
        role="button"
        tabIndex={0}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
          }
        }}
        style={
          showBurger
            ? { clipPath: 'circle(50% at 50% 50%)', opacity: 1 }
            : { clipPath: 'circle(0% at 50% 50%)', opacity: 0 }
        }
      >
        <span
          ref={topLineRef}
          className="block w-7 h-0.5 bg-white rounded-full origin-center"
        ></span>
        <span
          ref={bottomLineRef}
          className="block w-7 h-0.5 bg-white rounded-full origin-center"
        ></span>
      </div>
    </>
  );
};

export default Navbar;
