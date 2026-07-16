"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HiPlusCircle,
  HiPencil,
  HiTrash,
  HiX,
  HiEye,
  HiStar,
  HiLocationMarker,
  HiPhotograph,
  HiLightningBolt,
  HiSearch,
  HiChevronDown,
  HiUpload,
} from "react-icons/hi";
import {
  getMyProperties,
  deleteProperty,
  updateProperty,
  uploadImage,
} from "@/lib/api";
import {
  formatPrice,
  formatDate,
  formatNumber,
  getPropertyTypeLabel,
  getPropertyTypeColor,
} from "@/lib/utils";
import type { IProperty } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";
import FeaturePaymentModal from "@/components/payments/FeaturePaymentModal";

type StatusFilter = "all" | "approved" | "pending" | "rejected";
type SortOption =
  | "newest"
  | "oldest"
  | "most-views"
  | "highest-price"
  | "lowest-price";

type EditPropertyFormValues = z.infer<typeof editPropertySchema>;

const editPropertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  shortDescription: z
    .string()
    .min(1, "Required")
    .max(200, "Max 200 characters"),
  fullDescription: z.string().min(1, "Required"),
  propertyType: z.enum(["apartment", "villa", "commercial", "land"]),
  price: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 1,
    "Invalid price"
  ),
  priceType: z.enum(["monthly", "total"]),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  areaSize: z.string().optional(),
  amenities: z.string().optional(),
});

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.06,
      ease: "easeOut" as const,
    },
  }),
};

const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

export default function MyListingsPage() {
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Edit modal state
  const [editingProperty, setEditingProperty] = useState<IProperty | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmState, setConfirmState] = useState<{open: boolean; title: string; message: string; onConfirm: () => void; confirmText?: string; variant?: "danger"|"warning"|"info"; loading?: boolean}>({open: false, title: "", message: "", onConfirm: () => {}});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EditPropertyFormValues>({
    resolver: zodResolver(editPropertySchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      fullDescription: "",
      propertyType: "apartment",
      price: "",
      priceType: "total",
      city: "",
      area: "",
      bedrooms: "",
      bathrooms: "",
      areaSize: "",
      amenities: "",
    },
  });

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyProperties();
      setProperties(res.data.data?.properties || res.data.data || []);
    } catch {
      toast.error("Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // ---------- Delete handler ----------
  const handleDelete = (id: string, title: string) => {
    setConfirmState({
      open: true,
      title: "Delete Property",
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          setDeletingId(id);
          await deleteProperty(id);
          setProperties((prev) => prev.filter((p) => p._id !== id));
          toast.success("Property deleted successfully.");
        } catch {
          toast.error("Failed to delete property.");
        } finally {
          setDeletingId(null);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  // ---------- Feature handler ----------
  const [featureModalProperty, setFeatureModalProperty] = useState<IProperty | null>(null);

  const handleFeature = (property: IProperty) => {
    setFeatureModalProperty(property);
  };

  // ---------- Edit modal handlers ----------
  const openEditModal = useCallback((property: IProperty) => {
    setEditingProperty(property);
    setEditImages(property.images || []);

    setValue("title", property.title);
    setValue("shortDescription", property.shortDescription);
    setValue("fullDescription", property.fullDescription);
    setValue("propertyType", property.propertyType);
    setValue("price", String(property.price));
    setValue("priceType", property.priceType);
    setValue("city", property.location?.city || "");
    setValue("area", property.location?.area || "");
    setValue("bedrooms", property.bedrooms !== undefined ? String(property.bedrooms) : "");
    setValue("bathrooms", property.bathrooms !== undefined ? String(property.bathrooms) : "");
    setValue("areaSize", property.area ? String(property.area) : "");
    setValue("amenities", (property.amenities || []).join(", "));
  }, [setValue]);

  const closeEditModal = useCallback(() => {
    setEditingProperty(null);
    setEditImages([]);
    reset();
  }, [reset]);

  const handleImageRemove = useCallback((index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleImageAdd = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    try {
      setUploadingImage(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        try {
          const res = await uploadImage(base64);
          const url =
            res.data?.data?.url ||
            res.data?.url ||
            res.data?.data?.image?.url ||
            "";

          if (url) {
            setEditImages((prev) => [...prev, url]);
            toast.success("Image uploaded successfully.");
          } else {
            toast.error("Failed to get image URL from response.");
          }
        } catch {
          toast.error("Failed to upload image.");
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingImage(false);
      toast.error("Failed to read the file.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const onSubmitEdit = useCallback(
    async (data: EditPropertyFormValues) => {
      if (!editingProperty) return;

      try {
        setSaving(true);

        const payload = {
          title: data.title,
          shortDescription: data.shortDescription,
          fullDescription: data.fullDescription,
          propertyType: data.propertyType,
          price: Number(data.price),
          priceType: data.priceType,
          location: {
            city: data.city,
            area: data.area,
          },
          bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
          bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
          area: data.areaSize ? Number(data.areaSize) : undefined,
          amenities: data.amenities
            ? data.amenities
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
            : [],
          images: editImages,
        };

        await updateProperty(editingProperty._id, payload);

        // Update local state with the edited data
        setProperties((prev) =>
          prev.map((p) =>
            p._id === editingProperty._id
              ? {
                  ...p,
                  ...payload,
                }
              : p
          )
        );

        toast.success("Property updated successfully.");
        closeEditModal();
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: { message?: string } };
        };
        const msg =
          error?.response?.data?.message || "Failed to update property.";
        toast.error(msg);
      } finally {
        setSaving(false);
      }
    },
    [editingProperty, editImages, closeEditModal]
  );

  // ---------- Status badge ----------
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

  // ---------- Computed values ----------
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: properties.length,
      approved: 0,
      pending: 0,
      rejected: 0,
    };
    properties.forEach((p) => {
      if (p.status && counts[p.status] !== undefined) {
        counts[p.status]++;
      }
    });
    return counts;
  }, [properties]);

  const statusTabs: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
  ];

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Most Views", value: "most-views" },
    { label: "Highest Price", value: "highest-price" },
    { label: "Lowest Price", value: "lowest-price" },
  ];

  const filtered = useMemo(() => {
    let result = [...properties];

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location?.city?.toLowerCase().includes(q) ||
          p.location?.area?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "most-views":
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "highest-price":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "lowest-price":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [properties, statusFilter, searchQuery, sortBy]);

  // ---------- Input class helper ----------
  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  const errorTextClass = "text-xs text-red-500 mt-1";

  // =========================================
  // Loading skeleton
  // =========================================
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-20 bg-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
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
                    <div className="h-8 w-16 bg-slate-200 rounded-xl" />
                    <div className="h-8 w-16 bg-slate-200 rounded-xl" />
                    <div className="h-8 w-16 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================
  // Main render
  // =========================================
  return (
    <>
    <div className="space-y-6">
      {/* ========== Header ========== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-dark">
            My Listings
          </h1>
          <p className="text-sm text-muted mt-0.5">
            {properties.length} total{" "}
            {properties.length === 1 ? "property" : "properties"}
          </p>
        </div>
        <Link
          href="/properties/new"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-2xl hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20 self-start sm:self-auto cursor-pointer"
        >
          <HiPlusCircle className="w-5 h-5" />
          Add New Property
        </Link>
      </motion.div>

      {/* ========== Filter Bar ========== */}
      {properties.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: 0.1,
            ease: "easeOut" as const,
          }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  statusFilter === tab.value
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted hover:text-dark"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {tab.label}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      statusFilter === tab.value
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-200 text-muted"
                    }`}
                  >
                    {statusCounts[tab.value] || 0}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========== Empty State: No properties ========== */}
      {!loading && properties.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 md:p-16 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <HiPhotograph className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">
            No properties listed yet
          </h3>
          <p className="text-sm text-muted max-w-md mx-auto mb-6">
            You haven&apos;t added any properties yet. Start by listing your
            first property and reach thousands of potential buyers.
          </p>
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-2xl hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20 cursor-pointer"
          >
            <HiPlusCircle className="w-5 h-5" />
            Add Your First Property
          </Link>
        </motion.div>
      )}

      {/* ========== Empty State: No filter results ========== */}
      {!loading && properties.length > 0 && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" as const }}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center"
        >
          <HiSearch className="w-10 h-10 text-muted/40 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-dark mb-1.5">
            No properties match your filters
          </h3>
          <p className="text-sm text-muted">
            Try adjusting your search query or status filter.
          </p>
        </motion.div>
      )}

      {/* ========== Property Cards Grid ========== */}
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
                <Link
                  href={`/properties/${property._id}`}
                  className="block cursor-pointer"
                >
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
                      <p className="text-base font-bold text-secondary">
                        {formatPrice(property.price, property.priceType)}
                      </p>
                      <Link
                        href={`/properties/${property._id}`}
                        className="cursor-pointer"
                      >
                        <h3 className="text-sm font-semibold text-dark line-clamp-1 hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-muted mb-3">
                    <HiLocationMarker className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs truncate">
                      {property.location?.area}
                      {property.location?.area && property.location?.city
                        ? ", "
                        : ""}
                      {property.location?.city}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs text-muted mb-4">
                    {property.bedrooms !== undefined && (
                      <span>{property.bedrooms} Beds</span>
                    )}
                    {property.area && <span>{property.area} sqft</span>}
                    <span className="flex items-center gap-0.5">
                      <HiEye className="w-3.5 h-3.5" />
                      {formatNumber(property.views)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <HiStar className="w-3.5 h-3.5 text-accent" />
                      {property.rating}
                      <span className="text-slate-400">
                        ({property.reviewCount})
                      </span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-muted/70">
                      {formatDate(property.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(property)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200/60"
                        title="Edit property"
                      >
                        <HiPencil className="w-3.5 h-3.5" />
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          handleDelete(property._id, property.title)
                        }
                        disabled={deletingId === property._id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer border border-red-200/60"
                        title="Delete property"
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

      {/* ========== Edit Property Modal ========== */}
      <AnimatePresence>
        {editingProperty && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50"
              onClick={closeEditModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Card */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-bold text-dark">
                  Edit Property
                </h2>
                <button
                  onClick={closeEditModal}
                  className="p-1.5 rounded-xl text-muted hover:text-dark hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form
                onSubmit={handleSubmit(onSubmitEdit)}
                className="p-6 space-y-5"
              >
                {/* Title */}
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    placeholder="Property title"
                    {...register("title")}
                    className={`${inputClass} ${errors.title ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}`}
                  />
                  {errors.title && (
                    <p className={errorTextClass}>{errors.title.message}</p>
                  )}
                </div>

                {/* City / Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      type="text"
                      placeholder="City"
                      {...register("city")}
                      className={`${inputClass} ${errors.city ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}`}
                    />
                    {errors.city && (
                      <p className={errorTextClass}>{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Area</label>
                    <input
                      type="text"
                      placeholder="Area / Neighborhood"
                      {...register("area")}
                      className={`${inputClass} ${errors.area ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}`}
                    />
                    {errors.area && (
                      <p className={errorTextClass}>{errors.area.message}</p>
                    )}
                  </div>
                </div>

                {/* Property Type / Price Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Property Type</label>
                    <select
                      {...register("propertyType")}
                      className={inputClass}
                    >
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Price Type</label>
                    <select
                      {...register("priceType")}
                      className={inputClass}
                    >
                      <option value="total">Total</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className={labelClass}>Price</label>
                  <input
                    type="text"
                    placeholder="Enter price (numbers only)"
                    {...register("price")}
                    className={`${inputClass} ${errors.price ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}`}
                  />
                  {errors.price && (
                    <p className={errorTextClass}>{errors.price.message}</p>
                  )}
                </div>

                {/* Bedrooms / Bathrooms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      Bedrooms{" "}
                      <span className="text-muted font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3"
                      {...register("bedrooms")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Bathrooms{" "}
                      <span className="text-muted font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2"
                      {...register("bathrooms")}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Area Size */}
                <div>
                  <label className={labelClass}>
                    Area Size (sqft){" "}
                    <span className="text-muted font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1200"
                    {...register("areaSize")}
                    className={inputClass}
                  />
                </div>

                {/* Amenities */}
                <div>
                  <label className={labelClass}>
                    Amenities{" "}
                    <span className="text-muted font-normal">
                      (optional, comma-separated)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Parking, Pool, Gym, Security"
                    {...register("amenities")}
                    className={inputClass}
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className={labelClass}>Short Description</label>
                  <input
                    type="text"
                    placeholder="Brief description (max 200 characters)"
                    {...register("shortDescription")}
                    className={`${inputClass} ${errors.shortDescription ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}`}
                  />
                  {errors.shortDescription && (
                    <p className={errorTextClass}>
                      {errors.shortDescription.message}
                    </p>
                  )}
                </div>

                {/* Full Description */}
                <div>
                  <label className={labelClass}>Full Description</label>
                  <textarea
                    placeholder="Detailed property description..."
                    rows={4}
                    {...register("fullDescription")}
                    className={`${inputClass} resize-y min-h-[100px] ${errors.fullDescription ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}`}
                  />
                  {errors.fullDescription && (
                    <p className={errorTextClass}>
                      {errors.fullDescription.message}
                    </p>
                  )}
                </div>

                {/* Images Section */}
                <div>
                  <label className={labelClass}>Images</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group/thumb"
                      >
                        <Image
                          src={img}
                          alt={`Property image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                          title="Remove image"
                        >
                          <HiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {uploadingImage && (
                      <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 text-primary"
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
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageAdd}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <HiUpload className="w-4 h-4" />
                    {uploadingImage ? "Uploading..." : "Add Image"}
                  </button>
                  <p className="text-[11px] text-muted mt-1.5">
                    {editImages.length} image{editImages.length !== 1 ? "s" : ""}{" "}
                    uploaded. Max 5MB per image.
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-dark hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {saving && (
                      <svg
                        className="animate-spin h-4 w-4"
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
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmModal
        isOpen={confirmState.open}
        onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
        loading={!!deletingId}
      />
    </div>

      {/* Feature Payment Modal */}
      {featureModalProperty && (
        <FeaturePaymentModal
          isOpen={!!featureModalProperty}
          onClose={() => setFeatureModalProperty(null)}
          propertyId={featureModalProperty._id}
          propertyTitle={featureModalProperty.title}
          amountBDT={500}
          onSuccess={() => {
            setProperties((prev) =>
              prev.map((p) =>
                p._id === featureModalProperty._id
                  ? { ...p, isFeatured: true }
                  : p
              )
            );
            setFeatureModalProperty(null);
          }}
        />
      )}
    </>
  );
}