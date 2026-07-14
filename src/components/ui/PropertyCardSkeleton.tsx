"use client";

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
      <Skeleton height={220} className="w-full" />
      <div className="p-4 flex flex-col flex-1 gap-3">
        <Skeleton height={24} width="60%" />
        <Skeleton height={16} width="80%" />
        <Skeleton height={16} width="50%" />
        <div className="flex gap-4 mt-2">
          <Skeleton height={16} width={60} />
          <Skeleton height={16} width={60} />
          <Skeleton height={16} width={60} />
        </div>
        <div className="flex justify-between items-center mt-auto pt-3">
          <Skeleton height={16} width={80} />
          <Skeleton height={32} width={100} borderRadius={12} />
        </div>
      </div>
    </div>
  );
}