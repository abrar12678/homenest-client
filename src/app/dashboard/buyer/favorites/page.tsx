"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  HiHeart,
  HiSearch,
  HiStar,
  HiLocationMarker,
  HiPhotograph,
  HiX,
} from "react-icons/hi";
import { getFavorites, toggleFavorite } from "@/lib/api";
import { formatPrice, getStarRating, getPropertyTypeLabel, getPropertyTypeColor } from "@/lib/utils";
import type { IProperty } from "@/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getFavorites();
      const data = res.data?.data;
      setFavorites(Array.isArray(data) ? data : data?.properties || []);
    } catch {
      toast.error("Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFavorites();
  }, []);

  const handleRemove = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const prevFavorites = [...favorites];
    setFavorites((prev) => prev.filter((f) => f._id !== propertyId));
    setRemovingId(propertyId);

    try {
      await toggleFavorite(propertyId);
      toast.success("Removed from favorites.");
    } catch {
      // Revert on error
      setFavorites(prevFavorites);
      toast.error("Failed to remove favorite. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <div>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <HiHeart className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-dark">
                My Favorites
              </h1>
              <p className="text-sm text-muted">
                Properties you&apos;ve saved for later
              </p>
            </div>
            {!loading && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-600">
                {favorites.length}
              </span>
            )}
          </div>
        </motion.div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
              >
                <Skeleton height={200} className="w-full" />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton height={20} width={100} />
                    <Skeleton height={22} width={60} borderRadius={12} />
                  </div>
                  <Skeleton height={16} width="80%" />
                  <div className="flex items-center gap-2">
                    <Skeleton height={14} width={100} />
                    <Skeleton height={14} width={80} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && favorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
            className="bg-white rounded-2xl border border-slate-100 p-10 md:p-16 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <HiHeart className="w-10 h-10 text-rose-300" />
            </div>
            <h3 className="text-lg font-bold text-dark mb-2">
              No favorites yet
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto mb-6">
              Start exploring and save the properties you love. They&apos;ll
              appear right here.
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-sm"
            >
              <HiSearch className="w-4 h-4" />
              Explore Properties
            </Link>
          </motion.div>
        )}

        {/* Favorites Grid */}
        {!loading && favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {favorites.map((property, idx) => {
                const imageUrl = property.images?.[0] || "";
                const stars = getStarRating(property.rating);
                const isRemoving = removingId === property._id;

                return (
                  <motion.div
                    key={property._id}
                    custom={idx}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: "easeOut" as const } }}
                    layout
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                  >
                    <Link
                      href={`/properties/${property._id}`}
                      className="block"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                            <HiPhotograph className="w-10 h-10 text-slate-400" />
                          </div>
                        )}

                        {/* Property Type Badge */}
                        <span
                          className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold ${getPropertyTypeColor(
                            property.propertyType
                          )}`}
                        >
                          {getPropertyTypeLabel(property.propertyType)}
                        </span>

                        {/* Heart overlay */}
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                          <HiHeart className="w-4 h-4 text-rose-500" />
                        </div>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      {/* Price & Remove */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-lg font-bold text-secondary">
                          {formatPrice(property.price, property.priceType)}
                        </span>
                        <button
                          onClick={(e) => handleRemove(e, property._id)}
                          disabled={isRemoving}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                          title="Remove from favorites"
                        >
                          {isRemoving ? (
                            <svg
                              className="animate-spin h-3.5 w-3.5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                          ) : (
                            <HiX className="w-4 h-4" />
                          )}
                          Remove
                        </button>
                      </div>

                      {/* Title */}
                      <Link href={`/properties/${property._id}`}>
                        <h3 className="text-sm font-semibold text-dark line-clamp-1 mb-1 hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                      </Link>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-muted mb-3">
                        <HiLocationMarker className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs truncate">
                          {property.location.area},{" "}
                          {property.location.city}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 pt-3 border-t border-slate-100">
                        {stars.map((star, i) => (
                          <HiStar
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              star === "full" ? "text-accent" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted ml-1.5">
                          {property.rating} ({property.reviewCount} review
                          {property.reviewCount !== 1 ? "s" : ""})
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}