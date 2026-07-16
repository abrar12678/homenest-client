"use client";

import Link from 'next/link';
import Image from 'next/image';
import { HiLocationMarker, HiStar, HiOutlineViewGrid, HiHome, HiOutlineCube, HiHeart } from 'react-icons/hi';
import { formatPrice, getStarRating, getPropertyTypeLabel, getPropertyTypeColor } from '@/lib/utils';
import type { IProperty } from '@/types';

interface PropertyCardProps {
  property: IProperty;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const stars = getStarRating(property.rating);
  const imageUrl = property.images?.[0] || '';

  return (
    <Link href={`/properties/${property._id}`} className="block h-full group">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-slate-300/40 hover:-translate-y-2 hover:border-slate-200 hover:scale-[1.01]">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-[1.15] transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiOutlineViewGrid className="w-12 h-12 text-slate-300" />
            </div>
          )}

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Type badge */}
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm z-10 transition-transform duration-300 group-hover:scale-105 ${getPropertyTypeColor(
              property.propertyType
            )}`}
          >
            {getPropertyTypeLabel(property.propertyType)}
          </span>

          {/* Featured badge */}
          {property.isFeatured && (
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-accent to-amber-400 text-white shadow-md z-10 transition-transform duration-300 group-hover:scale-105">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-secondary">
              {formatPrice(property.price, property.priceType)}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold uppercase tracking-wider">
              {property.priceType}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-dark line-clamp-1 mb-1.5 group-hover:text-primary transition-all duration-300">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-muted mb-3">
            <HiLocationMarker className="w-3.5 h-3.5 shrink-0 text-primary/50" />
            <span className="text-xs truncate">
              {property.location?.area}{property.location?.area && property.location?.city ? ', ' : ''}{property.location?.city}
            </span>
          </div>

          {/* Short Description */}
          <p className="text-xs text-muted line-clamp-2 mb-3 leading-relaxed">
            {property.shortDescription}
          </p>

          {/* Specs */}
          <div className="flex items-center gap-3 text-xs text-muted mb-4 py-3 border-y border-slate-50">
            {property.bedrooms !== undefined && property.bedrooms > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1">
                <HiHome className="w-3.5 h-3.5 text-primary/60" />
                <span className="font-medium">{property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {property.bathrooms !== undefined && property.bathrooms > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1">
                <HiOutlineCube className="w-3.5 h-3.5 text-primary/60" />
                <span className="font-medium">{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1">
                <HiOutlineViewGrid className="w-3.5 h-3.5 text-primary/60" />
                <span className="font-medium">{property.area} sqft</span>
              </div>
            )}
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-auto">
            {/* Rating */}
            <div className="flex items-center gap-1">
              {stars.map((star, i) => (
                <HiStar
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    star === 'full' ? 'text-accent' : 'text-gray-200'
                  }`}
                />
              ))}
              <span className="text-xs text-muted ml-1 font-medium">
                {property.rating} ({property.reviewCount})
              </span>
            </div>

            <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2.5 transition-all duration-300">
              View Details
              <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}