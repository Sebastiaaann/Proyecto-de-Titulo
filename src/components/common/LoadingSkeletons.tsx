import React from 'react';

const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 animate-pulse">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-white/5 rounded w-1/3 shimmer"></div>
          <div className="h-8 w-8 bg-white/5 rounded-lg shimmer"></div>
        </div>
        <div className="h-8 bg-white/10 rounded w-1/2 shimmer"></div>
        <div className="h-3 bg-white/5 rounded w-2/3 shimmer"></div>
      </div>
    </div>
  );
};

const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="border-b border-white/5 animate-pulse">
      <td className="py-4 px-4">
        <div className="h-6 bg-white/5 rounded w-20 shimmer"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-white/5 rounded w-32 shimmer"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-white/5 rounded w-32 shimmer"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-white/5 rounded w-16 shimmer"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-white/5 rounded w-24 shimmer"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-white/5 rounded w-20 shimmer"></div>
      </td>
    </tr>
  );
};

const ListItemSkeleton: React.FC = () => {
  return (
    <div className="glass-card p-4 rounded-xl border border-white/5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-white/5 rounded-lg shimmer"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4 shimmer"></div>
          <div className="h-3 bg-white/5 rounded w-1/2 shimmer"></div>
        </div>
        <div className="h-8 w-20 bg-white/5 rounded shimmer"></div>
      </div>
    </div>
  );
};

const ChartSkeleton: React.FC = () => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-white/10 rounded w-1/3 shimmer"></div>
        <div className="h-64 bg-white/5 rounded shimmer"></div>
        <div className="flex gap-4">
          <div className="h-4 bg-white/5 rounded w-24 shimmer"></div>
          <div className="h-4 bg-white/5 rounded w-24 shimmer"></div>
        </div>
      </div>
    </div>
  );
};

const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-white/5 rounded shimmer"></div>
      <div className="h-10 bg-white/5 rounded shimmer"></div>
      <div className="h-32 bg-white/5 rounded shimmer"></div>
      <div className="flex gap-3">
        <div className="h-10 bg-white/10 rounded flex-1 shimmer"></div>
        <div className="h-10 bg-white/10 rounded flex-1 shimmer"></div>
      </div>
    </div>
  );
};

export const LoadingSkeletons = {
  Card: CardSkeleton,
  TableRow: TableRowSkeleton,
  ListItem: ListItemSkeleton,
  Chart: ChartSkeleton,
  Form: FormSkeleton,
};

export default LoadingSkeletons;
