"use client";

import Link from 'next/link';
import Image from 'next/image';
import { HiLocationMarker, HiStar, HiOutlineViewGrid, HiHome, HiOutlineCube } from 'react-icons/hi';
import { formatPrice, getStarRating, getPropertyTypeLabel, getPropertyTypeColor } from '@/lib/utils';
import type { IProperty } from '@/types';

interface PropertyCardProps {
  property: IProperty;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const stars = getStarRating(property.rating);
  const imageUrl = property.images?.[0] || '';

  return (
    <Link href={`/properties/${property._id}`} className="block h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <HiOutlineViewGrid className="w-10 h-10 text-gray-400" />
            </div>
          )}

          {/* Type badge */}
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold ${getPropertyTypeColor(
              property.propertyType
            )}`}
          >
            {getPropertyTypeLabel(property.propertyType)}
          </span>

          {/* Featured badge */}
          {property.isFeatured && (
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent text-white">
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
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-muted capitalize">
              {property.priceType}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-dark line-clamp-1 mb-1">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-muted mb-3">
            <HiLocationMarker className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs truncate">
              {property.location.area}, {property.location.city}
            </span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 text-xs text-muted mb-4">
            {property.bedrooms !== undefined && property.bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <HiHome className="w-4 h-4" />
                <span>{property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {property.bathrooms !== undefined && property.bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <HiOutlineCube className="w-4 h-4" />
                <span>{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-1">
                <HiOutlineViewGrid className="w-4 h-4" />
                <span>{property.area} sqft</span>
              </div>
            )}
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            {/* Rating */}
            <div className="flex items-center gap-1">
              {stars.map((star, i) => (
                <HiStar
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    star === 'full' ? 'text-accent' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-muted ml-1">
                ({property.reviewCount})
              </span>
            </div>

            <span className="text-xs font-semibold text-primary group-hover:underline">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}