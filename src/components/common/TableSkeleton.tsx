import React from 'react';

const TableSkeleton: React.FC = () => {
    return (
        <div className="w-full animate-pulse">
            <div className="h-10 bg-white/5 rounded-t-xl mb-1"></div>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border-b border-white/5">
                    <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                </div>
            ))}
        </div>
    );
};

export default TableSkeleton;
