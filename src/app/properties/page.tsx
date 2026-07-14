"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProperties } from '@/lib/api';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyFilters from '@/components/properties/PropertyFilters';
import PropertyCardSkeleton from '@/components/ui/PropertyCardSkeleton';
import Button from '@/components/ui/Button';
import { HiChevronLeft, HiChevronRight, HiOutlineViewGrid } from 'react-icons/hi';
import type { IProperty, IFilterParams } from '@/types';

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<IFilterParams>({
    page: '1',
    limit: '12',
  });

  // Sync filters from URL on mount
  useEffect(() => {
    const params: IFilterParams = { page: '1', limit: '12' };
    const sp = searchParams;
    if (sp.get('city')) params.city = sp.get('city')!;
    if (sp.get('type')) params.type = sp.get('type')!;
    if (sp.get('search')) params.search = sp.get('search')!;
    if (sp.get('sortBy')) params.sortBy = sp.get('sortBy')!;
    if (sp.get('bedrooms')) params.bedrooms = sp.get('bedrooms')!;
    if (sp.get('minRating')) params.minRating = sp.get('minRating')!;
    if (sp.get('minPrice')) params.minPrice = sp.get('minPrice')!;
    if (sp.get('maxPrice')) params.maxPrice = sp.get('maxPrice')!;
    if (sp.get('page')) params.page = sp.get('page')!;
    setFilters(params);
  }, [searchParams]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      // Build clean params
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.city) params.city = filters.city;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      params.page = filters.page || '1';
      params.limit = filters.limit || '12';

      const res = await getProperties(params);
      const data = res.data?.data;
      setProperties(data?.properties || []);
      setTotalPages(data?.totalPages || 1);
      setTotal(data?.total || 0);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const updateURL = (newFilters: IFilterParams) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val && val !== '' && key !== 'limit') {
        params.set(key, val);
      }
    });
    // Don't set page=1 if it's not the first page
    const q = params.toString();
    router.push(`/properties${q ? `?${q}` : ''}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: '1' }));
  };

  const handleApply = () => {
    updateURL(filters);
  };

  const handleReset = () => {
    const empty: IFilterParams = { page: '1', limit: '12' };
    setFilters(empty);
    router.push('/properties');
  };

  const goToPage = (page: number) => {
    const newFilters = { ...filters, page: String(page) };
    setFilters(newFilters);
    updateURL(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPage = Number(filters.page) || 1;

  return (
    <main className="pt-20 pb-16 bg-neutral min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">
            Explore Properties
          </h1>
          <p className="text-muted">
            {loading ? 'Searching properties...' : total > 0 ? `${total} properties found` : 'Find your perfect property from our verified listings'}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <PropertyFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            onApply={handleApply}
          />
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineViewGrid className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-2">
              No properties found
            </h3>
            <p className="text-muted mb-6">
              No properties found matching your criteria. Try adjusting your filters.
            </p>
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <HiChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>

            <div className="hidden sm:flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show first, last, current, and neighbors
                  return (
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                  );
                })
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && page - prev > 1;
                  return (
                    <span key={page} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="px-2 text-muted">...</span>
                      )}
                      <button
                        onClick={() => goToPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'bg-white text-dark hover:bg-gray-100 shadow-sm'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  );
                })}
            </div>

            <span className="sm:hidden text-sm text-muted px-3">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
              <HiChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <main className="pt-20 pb-16 bg-neutral min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-5 w-48 bg-gray-200 rounded-lg animate-pulse mt-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}