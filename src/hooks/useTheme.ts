import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Verificar localStorage primero
    const savedTheme = localStorage.getItem('fleettech-theme') as Theme | null;
    if (savedTheme) return savedTheme;
    
    // Si no hay guardado, usar preferencia del sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    localStorage.setItem('fleettech-theme', theme);
    console.log('🎨 Tema cambiado a:', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      console.log('🔄 Toggle: de', prev, 'a', newTheme);
      return newTheme;
    });
  };

  return { theme, toggleTheme };
};
