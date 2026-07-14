"use client";

import { useState } from 'react';
import { HiSearch, HiFilter } from 'react-icons/hi';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import type { IFilterParams } from '@/types';

interface PropertyFiltersProps {
  filters: IFilterParams;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
  onApply: () => void;
}

export default function PropertyFilters({
  filters,
  onFilterChange,
  onReset,
  onApply,
}: PropertyFiltersProps) {
  const [showMobile, setShowMobile] = useState(false);

  const cityOptions = [
    { value: '', label: 'All Cities' },
    { value: 'dhaka', label: 'Dhaka' },
    { value: 'chittagong', label: 'Chittagong' },
    { value: 'sylhet', label: 'Sylhet' },
    { value: 'rajshahi', label: 'Rajshahi' },
    { value: 'khulna', label: 'Khulna' },
    { value: 'comilla', label: 'Comilla' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' },
  ];

  const priceOptions = [
    { value: '', label: 'Any Price' },
    { value: '0-20000', label: 'Under ৳20,000' },
    { value: '20000-50000', label: '৳20,000 - ৳50,000' },
    { value: '50000-100000', label: '৳50,000 - ৳1,00,000' },
    { value: '100000-99999999', label: 'Over ৳1,00,000' },
  ];

  const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5+' },
  ];

  const ratingOptions = [
    { value: '', label: 'Any Rating' },
    { value: '3', label: '3+ Stars' },
    { value: '4', label: '4+ Stars' },
    { value: '4.5', label: '4.5+ Stars' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const filterContent = (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search by name or area..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Select
          name="city"
          label="City"
          options={cityOptions}
          value={filters.city || ''}
          onChange={(e) => onFilterChange('city', e.target.value)}
        />
        <Select
          name="type"
          label="Property Type"
          options={typeOptions}
          value={filters.type || ''}
          onChange={(e) => onFilterChange('type', e.target.value)}
        />
        <Select
          name="price"
          label="Price Range"
          options={priceOptions}
          value={
            filters.minPrice && filters.maxPrice
              ? `${filters.minPrice}-${filters.maxPrice}`
              : ''
          }
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              const [min, max] = val.split('-');
              onFilterChange('minPrice', min);
              onFilterChange('maxPrice', max);
            } else {
              onFilterChange('minPrice', '');
              onFilterChange('maxPrice', '');
            }
          }}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Select
          name="bedrooms"
          label="Bedrooms"
          options={bedroomOptions}
          value={filters.bedrooms || ''}
          onChange={(e) => onFilterChange('bedrooms', e.target.value)}
        />
        <Select
          name="rating"
          label="Rating"
          options={ratingOptions}
          value={filters.minRating || ''}
          onChange={(e) => onFilterChange('minRating', e.target.value)}
        />
        <Select
          name="sortBy"
          label="Sort By"
          options={sortOptions}
          value={filters.sortBy || ''}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="primary" size="md" onClick={onApply} className="flex-1">
          Apply Filters
        </Button>
        <Button variant="ghost" size="md" onClick={onReset} className="flex-1">
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Mobile toggle */}
      <button
        onClick={() => setShowMobile(!showMobile)}
        className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-gray-200 text-sm font-medium text-dark mb-4 w-full justify-center cursor-pointer"
      >
        <HiFilter className="w-5 h-5" />
        {showMobile ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Desktop filters */}
      <div className="hidden md:block bg-white rounded-xl shadow-md p-6">
        {filterContent}
      </div>

      {/* Mobile filters */}
      {showMobile && (
        <div className="md:hidden bg-white rounded-xl shadow-md p-4">
          {filterContent}
        </div>
      )}
    </div>
  );
}