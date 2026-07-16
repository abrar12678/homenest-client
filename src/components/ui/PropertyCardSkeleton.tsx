"use client";

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-full flex flex-col">
      <Skeleton height={200} className="w-full !rounded-none" />
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-center gap-2">
          <Skeleton height={22} width="45%" borderRadius={6} />
          <Skeleton height={20} width="60px" borderRadius={12} />
        </div>
        <Skeleton height={16} width="80%" />
        <div className="flex items-center gap-2">
          <Skeleton circle width={14} height={14} />
          <Skeleton height={14} width="50%" />
        </div>
        <Skeleton height={14} width="90%" count={2} />
        <div className="flex gap-2 py-3 border-y border-slate-50">
          <Skeleton height={28} width={70} borderRadius={8} />
          <Skeleton height={28} width={70} borderRadius={8} />
          <Skeleton height={28} width={70} borderRadius={8} />
        </div>
        <div className="flex justify-between items-center mt-auto pt-2">
          <Skeleton height={14} width={90} />
          <Skeleton height={14} width={80} />
        </div>
      </div>
    </div>
  );
}