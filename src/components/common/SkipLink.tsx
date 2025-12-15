import React from 'react';

const SkipLink: React.FC = () => {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:shadow-lg transition-all"
        >
            Saltar al contenido principal
        </a>
    );
};

export default SkipLink;
