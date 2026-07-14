"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPropertyById, getReviews, getProperties } from '@/lib/api';
import PropertyCard from '@/components/properties/PropertyCard';

import Button from '@/components/ui/Button';
import {
  formatPrice,
  formatDate,
  formatNumber,
  getStarRating,
  getPropertyTypeLabel,
  getPropertyTypeColor,
} from '@/lib/utils';
import type { IProperty, IReview } from '@/types';
import {
  HiArrowLeft,
  HiLocationMarker,
  HiStar,
  HiHome,
  HiOutlineCube,
  HiOutlineViewGrid,
  HiCalendar,
  HiEye,
  HiCheckCircle,
  HiUser,
  HiOutlineViewGrid as HiGrid,
} from 'react-icons/hi';

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<IProperty | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [related, setRelated] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const frame = requestAnimationFrame(() => setLoading(true));
    Promise.all([
      getPropertyById(id).catch(() => null),
      getReviews(id).catch(() => null),
    ])
      .then(([propRes, revRes]) => {
        const propData = propRes?.data?.data || propRes?.data;
        if (!propData) {
          setNotFound(true);
          return;
        }
        setProperty(propData);
        setReviews(revRes?.data?.data?.reviews || revRes?.data?.data || []);

        // Fetch related properties
        return getProperties({
          type: propData.propertyType,
          limit: '4',
          page: '1',
        }).catch(() => null);
      })
      .then((relRes) => {
        const relData = relRes?.data?.data?.properties || relRes?.data?.data || [];
        setRelated(relData.filter((p: IProperty) => p._id !== id).slice(0, 4));
      })
      .finally(() => setLoading(false));
    return () => cancelAnimationFrame(frame);
  }, [id]);

  if (loading) {
    return (
      <main className="pt-20 pb-16 min-h-screen bg-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded-lg mb-6" />
            <div className="h-96 bg-gray-200 rounded-xl mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
                <div className="h-6 w-1/2 bg-gray-200 rounded-lg" />
                <div className="h-48 bg-gray-200 rounded-xl" />
              </div>
              <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !property) {
    return (
      <main className="pt-20 pb-16 min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiGrid className="w-10 h-10 text-muted" />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-2">Property Not Found</h2>
          <p className="text-muted mb-6">
            The property you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/properties">
            <Button variant="primary">
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-16 min-h-screen bg-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <button
          onClick={() => router.push('/properties')}
          className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-6 cursor-pointer"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Explore
        </button>

        {/* Image Gallery */}
        <div className="mb-8">
          {/* Main Image */}
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-200 mb-3">
            {property.images?.[selectedImage] ? (
              <Image
                src={property.images[selectedImage]}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <HiOutlineViewGrid className="w-16 h-16 text-gray-400" />
              </div>
            )}

            {/* Type badge */}
            <span
              className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-sm font-semibold ${getPropertyTypeColor(
                property.propertyType
              )}`}
            >
              {getPropertyTypeLabel(property.propertyType)}
            </span>
          </div>

          {/* Thumbnails */}
          {property.images && property.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors cursor-pointer ${
                    selectedImage === idx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`View ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and price */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-2xl md:text-3xl font-bold text-secondary">
                  {formatPrice(property.price, property.priceType)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-secondary capitalize">
                  {property.priceType}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-dark mb-3">
                {property.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                <div className="flex items-center gap-1.5">
                  <HiLocationMarker className="w-4 h-4" />
                  <span>{property.location.area}, {property.location.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HiCalendar className="w-4 h-4" />
                  <span>{formatDate(property.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HiEye className="w-4 h-4" />
                  <span>{formatNumber(property.views)} views</span>
                </div>
              </div>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {property.bedrooms !== undefined && property.bedrooms > 0 && (
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <HiHome className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold text-dark">{property.bedrooms}</p>
                  <p className="text-xs text-muted">Bedrooms</p>
                </div>
              )}
              {property.bathrooms !== undefined && property.bathrooms > 0 && (
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <HiOutlineCube className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold text-dark">{property.bathrooms}</p>
                  <p className="text-xs text-muted">Bathrooms</p>
                </div>
              )}
              {property.area && (
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <HiOutlineViewGrid className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold text-dark">{formatNumber(property.area)}</p>
                  <p className="text-xs text-muted">Sq. Ft.</p>
                </div>
              )}
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <HiStar className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-xl font-bold text-dark">{property.rating}</p>
                <p className="text-xs text-muted">{property.reviewCount} Reviews</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-dark mb-4">Description</h2>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {property.fullDescription}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-dark mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm text-dark shadow-sm"
                    >
                      <HiCheckCircle className="w-4 h-4 text-secondary" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-bold text-dark mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const reviewStars = getStarRating(review.rating);
                    return (
                      <div
                        key={review._id}
                        className="bg-white rounded-xl p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-dark">
                                {review.userName}
                              </p>
                              <p className="text-xs text-muted">
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {reviewStars.map((s: string, i: number) => (
                              <HiStar
                                key={i}
                                className={`w-4 h-4 ${
                                  s === 'full' ? 'text-accent' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                  <p className="text-muted">No reviews yet. Be the first to review this property.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-dark mb-4">Posted By</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                  <HiUser />
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark">
                    {property.postedBy}
                  </p>
                  <p className="text-xs text-muted">Property Owner</p>
                </div>
              </div>
              <Button variant="primary" fullWidth className="mb-3">
                Contact Owner
              </Button>
              <Button variant="outline" fullWidth>
                Schedule a Visit
              </Button>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-dark mb-6">
              Similar Properties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}