"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiCalendar,
  HiHome,
  HiEye,
  HiStar,
  HiPhotograph,
  HiPencil,
  HiCheck,
  HiX,
  HiShieldCheck,
  HiLocationMarker,
  HiClipboardList,
  HiChartBar,
} from "react-icons/hi";
import {
  getMyProperties,
  getReceivedInquiries,
  getMe,
  updateProfile,
  uploadImage,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import {
  formatDate,
  formatNumber,
  getStarRating,
  getPropertyTypeLabel,
} from "@/lib/utils";
import type { IProperty, IInquiry } from "@/types";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function SellerProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [inquiries, setInquiries] = useState<IInquiry[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshingUser, setRefreshingUser] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  });

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      setRefreshingUser(true);
      const res = await getMe();
      const freshUser = res.data.data?.user || res.data.data;
      if (freshUser) {
        setUser(freshUser);
        reset({ name: freshUser.name || "", phone: freshUser.phone || "" });
      }
    } catch {
      // Silently fail — keep existing user data
    } finally {
      setRefreshingUser(false);
    }
  }, [setUser, reset]);

  // Fetch agent stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const [propsRes, inqRes] = await Promise.all([
        getMyProperties(),
        getReceivedInquiries({ page: "1", limit: "100" }),
      ]);
      setProperties(
        propsRes.data.data?.properties || propsRes.data.data || []
      );
      const inqData = inqRes.data.data;
      setInquiries(
        Array.isArray(inqData?.inquiries)
          ? inqData.inquiries
          : Array.isArray(inqData)
            ? inqData
            : []
      );
    } catch {
      toast.error("Failed to load agent stats.");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    refreshUser();
    fetchStats();
  }, [refreshUser]);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({ name: user.name || "", phone: user.phone || "" });
    }
  }, [user, reset]);

  // Computed stats
  const totalListings = properties.length;
  const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
  const avgRating =
    properties.length > 0
      ? (
          properties.reduce((sum, p) => sum + (p.rating || 0), 0) /
          properties.length
        ).toFixed(1)
      : "0.0";
  const stars = getStarRating(parseFloat(avgRating));

  const approvedCount = properties.filter(
    (p) => p.status === "approved" || !p.status
  ).length;
  const pendingCount = properties.filter((p) => p.status === "pending").length;
  const rejectedCount = properties.filter(
    (p) => p.status === "rejected"
  ).length;

  const totalInquiries = inquiries.length;
  const repliedInquiries = inquiries.filter(
    (i) => i.status === "replied"
  ).length;
  const responseRate =
    totalInquiries > 0
      ? Math.round((repliedInquiries / totalInquiries) * 100)
      : 0;

  const featuredCount = properties.filter((p) => p.isFeatured).length;

  // Property type breakdown
  const typeBreakdown: Record<string, number> = {};
  properties.forEach((p) => {
    const label = getPropertyTypeLabel(p.propertyType);
    typeBreakdown[label] = (typeBreakdown[label] || 0) + 1;
  });

  const topProperty =
    properties.length > 0
      ? [...properties].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
      : null;

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      const updateData: { name?: string; phone?: string } = {};
      if (data.name && data.name !== user?.name) updateData.name = data.name;
      if (data.phone !== user?.phone) updateData.phone = data.phone || "";

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save.");
        setIsEditing(false);
        return;
      }

      const res = await updateProfile(updateData);
      const updatedUser = res.data.data?.user || res.data.data;
      if (updatedUser) {
        setUser(updatedUser);
      }
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB.");
      return;
    }

    try {
      setUploadingAvatar(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const uploadRes = await uploadImage(base64);
          const imageUrl =
            uploadRes.data.data?.url || uploadRes.data.data;
          if (imageUrl) {
            const profileRes = await updateProfile({ avatar: imageUrl });
            const updatedUser =
              profileRes.data.data?.user || profileRes.data.data;
            if (updatedUser) {
              setUser(updatedUser);
            }
            toast.success("Avatar updated successfully!");
          }
        } catch {
          toast.error("Failed to upload avatar.");
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingAvatar(false);
      toast.error("Failed to read image file.");
    }

    e.target.value = "";
  };

  // Loading skeleton
  if (refreshingUser) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 md:p-8 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-28 h-28 rounded-full bg-slate-200 mx-auto md:mx-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 bg-slate-200 rounded-lg" />
              <div className="h-4 w-64 bg-slate-200 rounded-lg" />
              <div className="h-4 w-40 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white border border-slate-100 animate-pulse"
            />
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-dark">
            Agent Profile
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Manage your personal information and view performance
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-2xl hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20 cursor-pointer"
          >
            <HiPencil className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </motion.div>

      {/* Profile Card */}
      <motion.div
        custom={0}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Cover Banner */}
        <div className="h-32 md:h-40 bg-gradient-to-r from-primary via-primary-dark to-primary-light relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
        </div>

        {/* Avatar + Info */}
        <div className="px-6 md:px-8 pb-6 md:pb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-14 md:-mt-16 relative z-10">
            {/* Avatar */}
            <div className="relative self-center md:self-end">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <HiUser className="w-12 h-12 text-primary/40" />
                  </div>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
                  title="Change avatar"
                >
                  {uploadingAvatar ? (
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
                  ) : (
                    <HiPhotograph className="w-4 h-4" />
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Name + Role + Date */}
            <div className="flex-1 text-center md:text-left mb-2 md:mb-0">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h2 className="text-xl md:text-2xl font-bold text-dark">
                  {user?.name || "Agent"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary/10 text-primary">
                  <HiShieldCheck className="w-3 h-3" />
                  Verified Agent
                </span>
              </div>
              <p className="text-sm text-muted mt-0.5">
                Member since {formatDate(user?.createdAt)}
              </p>
            </div>

            {/* Edit/Cancel buttons */}
            {isEditing && (
              <div className="flex items-center gap-2 self-center md:self-end">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    reset({
                      name: user?.name || "",
                      phone: user?.phone || "",
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-muted text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <HiX className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer shadow-sm shadow-primary/20"
                >
                  {saving ? (
                    <>
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <HiCheck className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Profile Details / Edit Form */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
                Full Name
              </label>
              {isEditing ? (
                <div>
                  <input
                    {...register("name")}
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <HiUser className="w-4 h-4 text-muted shrink-0" />
                  <p className="text-sm font-medium text-dark">
                    {user?.name || "N/A"}
                  </p>
                </div>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
                Email Address
              </label>
              <div className="flex items-center gap-2.5">
                <HiMail className="w-4 h-4 text-muted shrink-0" />
                <p className="text-sm font-medium text-dark">
                  {user?.email || "N/A"}
                </p>
              </div>
              {isEditing && (
                <p className="text-[11px] text-muted mt-1">
                  Email cannot be changed
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
                Phone Number
              </label>
              {isEditing ? (
                <div>
                  <input
                    {...register("phone")}
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <HiPhone className="w-4 h-4 text-muted shrink-0" />
                  <p className="text-sm font-medium text-dark">
                    {user?.phone || "Not provided"}
                  </p>
                </div>
              )}
            </div>

            {/* Join Date */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
                Member Since
              </label>
              <div className="flex items-center gap-2.5">
                <HiCalendar className="w-4 h-4 text-muted shrink-0" />
                <p className="text-sm font-medium text-dark">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" as const }}
      >
        <h2 className="text-lg font-bold text-dark mb-4">
          Performance Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Listings */}
          <motion.div
            custom={1}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <HiHome className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted font-medium">
                  Total Listings
                </p>
                {loadingStats ? (
                  <div className="h-7 w-12 bg-slate-200 rounded-lg animate-pulse mt-1" />
                ) : (
                  <p className="text-xl font-bold text-dark">
                    {formatNumber(totalListings)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Total Views */}
          <motion.div
            custom={2}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <HiEye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted font-medium">Total Views</p>
                {loadingStats ? (
                  <div className="h-7 w-16 bg-slate-200 rounded-lg animate-pulse mt-1" />
                ) : (
                  <p className="text-xl font-bold text-dark">
                    {formatNumber(totalViews)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Avg Rating */}
          <motion.div
            custom={3}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <HiStar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted font-medium">Avg Rating</p>
                {loadingStats ? (
                  <div className="h-7 w-12 bg-slate-200 rounded-lg animate-pulse mt-1" />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <p className="text-xl font-bold text-dark">{avgRating}</p>
                    <div className="flex items-center gap-0.5">
                      {stars.slice(0, 3).map((star, i) => (
                        <HiStar
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            star === "full"
                              ? "text-accent"
                              : star === "half"
                                ? "text-accent/50"
                                : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Response Rate */}
          <motion.div
            custom={4}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <HiChartBar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted font-medium">
                  Response Rate
                </p>
                {loadingStats ? (
                  <div className="h-7 w-12 bg-slate-200 rounded-lg animate-pulse mt-1" />
                ) : (
                  <p className="text-xl font-bold text-dark">
                    {responseRate}%
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Detailed Breakdown — Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listing Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" as const }}
          className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm"
        >
          <h3 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
            <HiClipboardList className="w-5 h-5 text-primary" />
            Listing Breakdown
          </h3>
          {loadingStats ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-slate-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Approved */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-dark">
                    Approved / Live
                  </span>
                </div>
                <span className="text-sm font-bold text-green-700">
                  {approvedCount}
                </span>
              </div>
              {/* Pending */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium text-dark">Pending</span>
                </div>
                <span className="text-sm font-bold text-amber-700">
                  {pendingCount}
                </span>
              </div>
              {/* Rejected */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-dark">Rejected</span>
                </div>
                <span className="text-sm font-bold text-red-700">
                  {rejectedCount}
                </span>
              </div>
              {/* Featured */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/40 border border-amber-200/40">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <span className="text-sm font-medium text-dark">Featured</span>
                </div>
                <span className="text-sm font-bold text-amber-700">
                  {featuredCount}
                </span>
              </div>
              {/* Inquiries */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-dark">
                    Total Inquiries
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-700">
                  {totalInquiries}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Property Types + Top Property */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" as const }}
          className="space-y-6"
        >
          {/* Property Types */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
              <HiLocationMarker className="w-5 h-5 text-secondary" />
              Property Types
            </h3>
            {loadingStats ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 bg-slate-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : Object.keys(typeBreakdown).length > 0 ? (
              <div className="space-y-2.5">
                {Object.entries(typeBreakdown).map(([type, count]) => {
                  const pct =
                    totalListings > 0
                      ? Math.round((count / totalListings) * 100)
                      : 0;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-dark">
                          {type}
                        </span>
                        <span className="text-xs text-muted">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">
                No listings yet
              </p>
            )}
          </div>

          {/* Top Performing Property */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
              <HiChartBar className="w-5 h-5 text-accent" />
              Top Performing Property
            </h3>
            {loadingStats ? (
              <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ) : topProperty ? (
              <Link
                href={`/properties/${topProperty._id}`}
                className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  {topProperty.images?.[0] ? (
                    <Image
                      src={topProperty.images[0]}
                      alt={topProperty.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                      <HiHome className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-dark line-clamp-1 group-hover:text-primary transition-colors">
                    {topProperty.title}
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    {topProperty.location?.area}
                    {topProperty.location?.area && topProperty.location?.city
                      ? ", "
                      : ""}
                    {topProperty.location?.city}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                    <span className="flex items-center gap-0.5">
                      <HiEye className="w-3.5 h-3.5" />
                      {formatNumber(topProperty.views)} views
                    </span>
                    <span className="flex items-center gap-0.5">
                      <HiStar className="w-3.5 h-3.5 text-accent" />
                      {topProperty.rating}
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <p className="text-sm text-muted text-center py-4">
                No properties listed yet
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}