import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`}></div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between mb-2 md:mb-6">
        <div className="hidden md:block w-full">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[140px] rounded-[1.5rem]" />
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
            <Skeleton className="h-[400px] rounded-[2rem]" />
        </div>
        <div className="lg:col-span-1">
            <Skeleton className="h-[400px] rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
};

export const LoansSkeleton = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
        <div className="max-w-2xl w-full">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
        <Skeleton className="h-14 w-48 rounded-2xl" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-5">
          <Skeleton className="h-12 w-full max-w-md rounded-2xl" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-10 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
