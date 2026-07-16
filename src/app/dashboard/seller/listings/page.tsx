"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  HiPlusCircle,
  HiTrash,
  HiEye,
  HiStar,
  HiLocationMarker,
  HiPhotograph,
  HiLightningBolt,
  HiSearch,
} from "react-icons/hi";
import {
  getMyProperties,
  deleteProperty,
  createPaymentIntent,
  confirmPayment,
} from "@/lib/api";
import {
  formatPrice,
  formatDate,
  formatNumber,
  getPropertyTypeLabel,
  getPropertyTypeColor,
} from "@/lib/utils";
import type { IProperty } from "@/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export default function MyListingsPage() {
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [featuringId, setFeaturingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await getMyProperties();
      setProperties(res.data.data?.properties || res.data.data || []);
    } catch {
      toast.error("Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProperties();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${title}"? This cannot be undone.`,
      )
    )
      return;
    try {
      setDeletingId(id);
      await deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success("Property deleted successfully.");
    } catch {
      toast.error("Failed to delete property.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFeature = async (property: IProperty) => {
    if (
      !window.confirm(
        `Feature "${property.title}" for ৳500? A payment will be processed.`,
      )
    )
      return;
    try {
      setFeaturingId(property._id);
      toast.info("Processing payment...");

      const intentRes = await createPaymentIntent(property._id, 500);
      const { paymentIntentId } = intentRes.data.data;

      // Simulate payment confirmation
      await confirmPayment(property._id, paymentIntentId);

      toast.success("Property featured successfully!");
      // Update local state
      setProperties((prev) =>
        prev.map((p) =>
          p._id === property._id ? { ...p, isFeatured: true } : p,
        ),
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg =
        error?.response?.data?.message || "Payment failed. Try again.";
      toast.error(msg);
    } finally {
      setFeaturingId(null);
    }
  };

  const statusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
    }
  };

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.area.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Loading skeletons
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-slate-200 rounded-lg" />
                  <div className="h-6 w-16 bg-slate-200 rounded-lg" />
                </div>
                <div className="h-4 w-3/4 bg-slate-200 rounded-lg" />
                <div className="h-3 w-1/2 bg-slate-200 rounded-lg" />
                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <div className="h-3 w-24 bg-slate-200 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                    <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1E293B]">
            My Listings
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {properties.length} total{" "}
            {properties.length === 1 ? "property" : "properties"}
          </p>
        </div>
        <Link
          href="/properties/new"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1E40AF] text-white text-sm font-semibold rounded-2xl hover:bg-[#1E3A8A] transition-colors shadow-sm shadow-[#1E40AF]/20 self-start sm:self-auto"
        >
          <HiPlusCircle className="w-4.5 h-4.5" />
          Add New Property
        </Link>
      </motion.div>

      {/* Search */}
      {properties.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" as const }}
          className="relative max-w-md"
        >
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by title, city, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm text-[#1E293B] placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] transition-all"
          />
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && properties.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 md:p-16 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#1E40AF]/10 to-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <HiPhotograph className="w-10 h-10 text-[#1E40AF]/40" />
          </div>
          <h3 className="text-lg font-bold text-[#1E293B] mb-2">
            No properties listed yet
          </h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6">
            You haven&apos;t added any properties yet. Start by listing your
            first property and reach thousands of potential buyers.
          </p>
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#1E40AF] text-white text-sm font-semibold rounded-2xl hover:bg-[#1E3A8A] transition-colors shadow-sm shadow-[#1E40AF]/20"
          >
            <HiPlusCircle className="w-4.5 h-4.5" />
            Add Your First Property
          </Link>
        </motion.div>
      )}

      {/* No Search Results */}
      {!loading && properties.length > 0 && filtered.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center">
          <p className="text-sm text-[#64748B]">
            No properties match &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Property Cards Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((property, idx) => {
            const imageUrl = property.images?.[0] || "";
            return (
              <motion.div
                key={property._id}
                custom={idx}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Image */}
                <Link href={`/properties/${property._id}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <HiPhotograph className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                    {/* Badges row */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {property.isFeatured && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#F59E0B] text-white shadow-sm">
                          ⚡ Featured
                        </span>
                      )}
                      {statusBadge(property.status)}
                    </div>
                    <span
                      className={`absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${getPropertyTypeColor(property.propertyType)}`}
                    >
                      {getPropertyTypeLabel(property.propertyType)}
                    </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                  {/* Price + Title */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-base font-bold text-[#059669]">
                        {formatPrice(property.price, property.priceType)}
                      </p>
                      <Link href={`/properties/${property._id}`}>
                        <h3 className="text-sm font-semibold text-[#1E293B] line-clamp-1 hover:text-[#1E40AF] transition-colors">
                          {property.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-[#64748B] mb-3">
                    <HiLocationMarker className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs truncate">
                      {property.location.area}, {property.location.city}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs text-[#64748B] mb-4">
                    {property.bedrooms !== undefined && (
                      <span>{property.bedrooms} Beds</span>
                    )}
                    {property.area && <span>{property.area} sqft</span>}
                    <span className="flex items-center gap-0.5">
                      <HiEye className="w-3.5 h-3.5" />
                      {formatNumber(property.views)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <HiStar className="w-3.5 h-3.5 text-[#F59E0B]" />
                      {property.rating}
                      <span className="text-slate-400">
                        ({property.reviewCount})
                      </span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-[#64748B]/70">
                      {formatDate(property.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/properties/${property._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-primary bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200/60"
                      >
                        <HiEye className="w-3.5 h-3.5" />
                        View
                      </Link>
                      {!property.isFeatured && (
                        <button
                          onClick={() => handleFeature(property)}
                          disabled={featuringId === property._id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50 cursor-pointer border border-amber-200/60"
                          title="Feature for ৳500"
                        >
                          <HiLightningBolt className="w-3.5 h-3.5" />
                          {featuringId === property._id
                            ? "Processing…"
                            : "Feature ৳500"}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDelete(property._id, property.title)
                        }
                        disabled={deletingId === property._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer border border-red-200/60"
                      >
                        {deletingId === property._id ? (
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
                          <HiTrash className="w-3.5 h-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
