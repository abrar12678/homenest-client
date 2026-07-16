"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { createProperty, uploadImage } from "@/lib/api";
import {
  HiArrowLeft,
  HiHome,
  HiPhotograph,
  HiLocationMarker,
  HiCheckCircle,
  HiX,
  HiChevronRight,
  HiUpload,
} from "react-icons/hi";
import { toast } from "react-toastify";

export default function AddPropertyPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <AddPropertyForm />;
}

const propertySchema = z.object({
  title: z.string().min(1, "Property title is required"),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(200, "Short description must be 200 characters or less"),
  fullDescription: z.string().min(1, "Full description is required"),
  propertyType: z.enum(["apartment", "villa", "commercial", "land"], {
    message: "Please select a property type",
  }),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 1,
      "Price must be a valid number greater than 0"
    ),
  priceType: z.enum(["monthly", "total"], {
    message: "Please select a price type",
  }),
  location: z.object({
    city: z.string().min(1, "City is required"),
    area: z.string().min(1, "Area is required"),
  }),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  area: z.string().optional(),
  images: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

/* ---------- Helpers ---------- */

function inputClass(hasError: boolean) {
  return `w-full pl-11 pr-4 py-3 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ${
    hasError
      ? "border-red-400 bg-red-50/50"
      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
  }`;
}

function textareaClass(hasError: boolean) {
  return `w-full px-4 py-3 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-vertical transition-all duration-200 ${
    hasError
      ? "border-red-400 bg-red-50/50"
      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
  }`;
}

function selectClass(hasError: boolean) {
  return `w-full pl-11 pr-10 py-3 border rounded-2xl text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 appearance-none cursor-pointer ${
    hasError
      ? "border-red-400 bg-red-50/50"
      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
  }`;
}

function numberInputClass(hasError: boolean) {
  return `w-full px-4 py-3 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ${
    hasError
      ? "border-red-400 bg-red-50/50"
      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
  }`;
}

/* ---------- Amenities ---------- */

const AMENITIES = [
  "WiFi",
  "Parking",
  "AC",
  "Elevator",
  "Security",
  "Generator",
  "Gym",
  "Swimming Pool",
  "CCTV",
  "Gas",
  "Water Supply",
  "Balcony",
  "Roof Top",
  "Garden",
];

/* ---------- Component ---------- */

function AddPropertyForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      fullDescription: "",
      propertyType: undefined,
      price: "",
      priceType: undefined,
      location: { city: "", area: "" },
      bedrooms: "",
      bathrooms: "",
      area: "",
      images: "",
    },
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (uploadedImages.length + files.length > 5) {
      toast.warning("Maximum 5 images allowed.");
      return;
    }
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB).`);
          continue;
        }
        const reader = new FileReader();
        const base64: string = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const res = await uploadImage(base64);
        const url = res.data.data?.url;
        if (url) {
          setUploadedImages((prev) => [...prev, url]);
          toast.success(`${file.name} uploaded.`);
        }
      }
    } catch {
      toast.error("Image upload failed. You can still use URL input below.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: PropertyFormData) => {
    setError("");
    try {
      const payload: Record<string, unknown> = {
        title: data.title,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        propertyType: data.propertyType,
        price: Number(data.price),
        priceType: data.priceType,
        location: {
          city: data.location.city,
          area: data.location.area,
        },
      };

      // Optional fields — only include if present and valid
      if (data.bedrooms && data.bedrooms.trim() !== "") {
        const num = Number(data.bedrooms);
        if (num >= 1) payload.bedrooms = num;
      }
      if (data.bathrooms && data.bathrooms.trim() !== "") {
        const num = Number(data.bathrooms);
        if (num >= 1) payload.bathrooms = num;
      }
      if (data.area && data.area.trim() !== "") {
        const num = Number(data.area);
        if (num >= 1) payload.area = num;
      }

      // Amenities
      if (selectedAmenities.length > 0) {
        payload.amenities = selectedAmenities;
      }

      // Images — merge uploaded files + URL input
      const allImages: string[] = [...uploadedImages];
      if (data.images && data.images.trim()) {
        const urlImages = data.images.split(",").map((url) => url.trim()).filter(Boolean);
        allImages.push(...urlImages);
      }
      if (allImages.length > 0) {
        payload.images = allImages;
      }

      await createProperty(payload);
      toast.success("Property listed successfully!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create property. Please try again.";
      setError(message);
    }
  };

  const selectArrow = (
    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );

  return (
    <main className="pt-20 pb-16 bg-neutral min-h-screen">
      {/* Hero / Page Header */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light py-20 md:py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          >
            {/* Breadcrumb */}
            <nav className="flex justify-center items-center gap-2 text-sm text-blue-200 mb-6">
              <Link
                href="/"
                className="hover:text-white transition-colors"
              >
                Home
              </Link>
              <HiChevronRight className="w-4 h-4" />
              <Link
                href="/properties"
                className="hover:text-white transition-colors"
              >
                Properties
              </Link>
              <HiChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">Add Property</span>
            </nav>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              List Your Property
            </h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Share your property with thousands of seekers across Bangladesh.
              Fill in the details below to get started.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
          >
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors mb-8"
            >
              <HiArrowLeft className="w-4 h-4" />
              Back to Properties
            </Link>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" as const }}
            className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <HiHome className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-dark">
                  Property Details
                </h2>
                <p className="text-sm text-muted">
                  Provide accurate information to attract the right tenants
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error Banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 flex items-center gap-2 overflow-hidden"
                  >
                    <svg
                      className="w-5 h-5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ---- Basic Information ---- */}
              <div>
                <h3 className="text-sm font-bold text-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  Basic Information
                </h3>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Property Title <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <HiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        type="text"
                        placeholder="e.g. Modern 3BR Apartment in Gulshan"
                        className={inputClass(!!errors.title)}
                        {...register("title")}
                      />
                    </div>
                    {errors.title && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Short Description{" "}
                      <span className="text-red-500">*</span>
                      <span className="text-xs text-muted font-normal ml-1">
                        (max 200 chars)
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="A brief summary of your property..."
                      className={textareaClass(!!errors.shortDescription)}
                      maxLength={200}
                      {...register("shortDescription")}
                    />
                    {errors.shortDescription && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.shortDescription.message}
                      </p>
                    )}
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Full Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Provide a detailed description including nearby landmarks, condition, furnishing, etc."
                      className={textareaClass(!!errors.fullDescription)}
                      {...register("fullDescription")}
                    />
                    {errors.fullDescription && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.fullDescription.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* ---- Type & Pricing ---- */}
              <div>
                <h3 className="text-sm font-bold text-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  Type &amp; Pricing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <HiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                      <select
                        className={selectClass(!!errors.propertyType)}
                        defaultValue=""
                        {...register("propertyType")}
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="commercial">Commercial</option>
                        <option value="land">Land</option>
                      </select>
                      {selectArrow}
                    </div>
                    {errors.propertyType && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.propertyType.message}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Price (BDT) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">
                        ৳
                      </span>
                      <input
                        type="number"
                        min={1}
                        placeholder="15000"
                        className="w-full pl-9 pr-4 py-3 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 border-slate-200 bg-slate-50/50 hover:border-slate-300"
                        {...register("price")}
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Price Type */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Price Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className={selectClass(!!errors.priceType)}
                        defaultValue=""
                        {...register("priceType")}
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        <option value="monthly">Monthly</option>
                        <option value="total">Total</option>
                      </select>
                      {selectArrow}
                    </div>
                    {errors.priceType && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.priceType.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* ---- Location ---- */}
              <div>
                <h3 className="text-sm font-bold text-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  Location
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <HiLocationMarker className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        type="text"
                        placeholder="e.g. Dhaka"
                        className={inputClass(!!errors.location?.city)}
                        {...register("location.city")}
                      />
                    </div>
                    {errors.location?.city && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.location.city.message}
                      </p>
                    )}
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Area <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <HiLocationMarker className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        type="text"
                        placeholder="e.g. Gulshan, Banani"
                        className={inputClass(!!errors.location?.area)}
                        {...register("location.area")}
                      />
                    </div>
                    {errors.location?.area && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.location.area.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* ---- Property Details ---- */}
              <div>
                <h3 className="text-sm font-bold text-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  Property Details{" "}
                  <span className="text-xs font-normal text-muted normal-case tracking-normal">
                    (optional)
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 3"
                      className={numberInputClass(false)}
                      {...register("bedrooms")}
                    />
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 2"
                      className={numberInputClass(false)}
                      {...register("bathrooms")}
                    />
                  </div>

                  {/* Area (sq ft) */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Area (sq ft)
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 1200"
                      className={numberInputClass(false)}
                      {...register("area")}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* ---- Amenities ---- */}
              <div>
                <h3 className="text-sm font-bold text-dark uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center">
                    5
                  </span>
                  Amenities{" "}
                  <span className="text-xs font-normal text-muted normal-case tracking-normal">
                    (optional)
                  </span>
                </h3>
                <p className="text-xs text-muted mb-4">
                  Click to toggle amenities available at your property
                </p>

                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <motion.button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                            : "bg-slate-50 text-muted border-slate-200 hover:border-primary/30 hover:text-primary"
                        }`}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        {isSelected ? (
                          <HiCheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        )}
                        {amenity}
                        {isSelected && (
                          <HiX className="w-3.5 h-3.5 ml-0.5 opacity-70" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {selectedAmenities.length > 0 && (
                  <p className="mt-3 text-xs text-muted">
                    <HiCheckCircle className="w-3.5 h-3.5 inline text-secondary mr-1" />
                    {selectedAmenities.length} amenit
                    {selectedAmenities.length === 1 ? "y" : "ies"} selected
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* ---- Images ---- */}
              <div>
                <h3 className="text-sm font-bold text-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                    6
                  </span>
                  Images{" "}
                  <span className="text-xs font-normal text-muted normal-case tracking-normal">
                    (optional)
                  </span>
                </h3>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="block w-full cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      <HiUpload className="w-5 h-5 text-muted" />
                      <span className="text-sm text-muted">
                        {uploading ? "Uploading..." : "Click to upload images (max 5, 10MB each)"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                {/* Uploaded Image Previews */}
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <HiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* URL fallback */}
                <div className="relative">
                  <HiPhotograph className="absolute left-3.5 top-3.5 w-5 h-5 text-muted" />
                  <textarea
                    rows={2}
                    placeholder="Or paste image URLs separated by commas"
                    className="w-full pl-11 pr-4 py-3 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-vertical transition-all duration-200 border-slate-200 bg-slate-50/50 hover:border-slate-300"
                    {...register("images")}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  Upload images or paste URLs. Uploaded: {uploadedImages.length}/5
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:from-primary-dark hover:to-primary transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
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
                      Creating listing...
                    </span>
                  ) : (
                    "Publish Property"
                  )}
                </motion.button>

                <Link
                  href="/properties"
                  className="text-sm text-muted hover:text-dark transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}