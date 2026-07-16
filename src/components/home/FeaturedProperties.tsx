"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { getFeaturedProperties } from '@/lib/api';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyCardSkeleton from '@/components/ui/PropertyCardSkeleton';
import type { IProperty } from '@/types';

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProperties()
      .then((res) => {
        setProperties(res.data?.data?.properties || res.data?.data || []);
      })
      .catch(() => {
        setProperties([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 md:py-20 bg-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-3">
            Top Reviewed Properties
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            Most reviewed and highest-rated properties from our platform — updated in real-time
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : properties.length > 0
              ? properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))
              : Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-white rounded-xl shadow-md p-6 text-center h-full flex flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-16 h-16 bg-neutral rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted">Properties will appear here as reviews come in</p>
                  </motion.div>
                ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <Link href="/properties">
            <motion.span
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              whileHover={{ x: 4 }}
            >
              View All Properties
              <HiArrowRight className="w-5 h-5" />
            </motion.span>
          </Link>
        </div>
      </div>
    </section>
  );
}