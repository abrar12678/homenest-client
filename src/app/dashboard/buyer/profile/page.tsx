"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiShieldCheck,
  HiCalendar,
  HiCamera,
  HiPencil,
  HiCheck,
} from "react-icons/hi";
import { getMe, updateProfile, uploadImage } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

/* ─── Validation Schema ─── */

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  phone: z.string(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/* ─── Component ─── */

export default function BuyerProfilePage() {
  const { user, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Form ── */

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
    },
  });

  /* ── Pre-populate form when user loads ── */

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        phone: user.phone ?? "",
      });
    }
  }, [user, reset]);

  /* ── Refresh user from server ── */

  const refreshUser = async () => {
    try {
      setFetchingUser(true);
      const res = await getMe();
      const userData =
        res.data?.data?.user ?? res.data?.data;
      if (userData) {
        setUser(userData);
      }
    } catch {
      // Silently fail — user data in store is still valid
    } finally {
      setFetchingUser(false);
    }
  };

  /* ── Avatar Upload ── */

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        setUploadingAvatar(true);
        const uploadRes = await uploadImage(base64);
        const avatarUrl =
          uploadRes.data?.data?.url ?? uploadRes.data?.url;
        if (avatarUrl) {
          await updateProfile({ avatar: avatarUrl });
          await refreshUser();
          toast.success("Avatar updated successfully!");
        }
      } catch {
        toast.error("Failed to upload avatar. Please try again.");
      } finally {
        setUploadingAvatar(false);
        // Reset file input so same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsDataURL(file);
  };

  /* ── Save Profile ── */

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      await updateProfile({
        name: data.name,
        phone: data.phone || undefined,
      });
      await refreshUser();
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading State ── */

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton circle width={40} height={40} />
          <div>
            <Skeleton height={24} width={160} />
            <Skeleton height={16} width={240} className="mt-1.5" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex flex-col items-center">
              <Skeleton circle width={96} height={96} />
              <Skeleton height={20} width={120} className="mt-4" />
              <Skeleton height={14} width={80} className="mt-1.5" />
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
            <Skeleton height={24} width={180} className="mb-6" />
            <div className="space-y-4">
              <Skeleton height={44} />
              <Skeleton height={44} />
              <Skeleton height={44} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Role Badge ── */

  const roleBadge: Record<string, { label: string; className: string }> = {
    user: {
      label: "Buyer",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    agent: {
      label: "Agent",
      className: "bg-secondary/10 text-secondary border-secondary/20",
    },
    admin: {
      label: "Admin",
      className: "bg-accent/10 text-accent border-accent/20",
    },
  };

  const currentRole = roleBadge[user.role] ?? roleBadge.user;

  /* ── Render ── */

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HiUser className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-dark">
              My Profile
            </h1>
            <p className="text-sm text-muted">
              Manage your personal information
            </p>
          </div>
        </div>

        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-auto"
          >
            <HiPencil className="w-4 h-4 mr-1.5" />
            Edit Profile
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Avatar & Account Info ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: "easeOut" as const,
          }}
          className="space-y-6"
        >
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Camera overlay */}
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-2xl bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer disabled:opacity-0"
                  title="Change avatar"
                >
                  {uploadingAvatar ? (
                    <svg
                      className="animate-spin h-6 w-6 text-white"
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
                    <HiCamera className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                aria-label="Upload avatar"
              />

              <h2 className="text-lg font-bold text-dark mt-4">
                {user.name}
              </h2>
              <p className="text-sm text-muted">{user.email}</p>

              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <>
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
                    Uploading...
                  </>
                ) : (
                  <>
                    <HiCamera className="w-3.5 h-3.5" />
                    Change Photo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Account Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-dark uppercase tracking-wide mb-4">
              Account Info
            </h3>
            <div className="space-y-4">
              {/* Role */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <HiShieldCheck className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted">Role</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${currentRole.className}`}
                  >
                    {currentRole.label}
                  </span>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <HiCalendar className="w-4.5 h-4.5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted">Member Since</p>
                  <p className="text-sm font-medium text-dark">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <HiMail className="w-4.5 h-4.5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted">Email</p>
                  <p className="text-sm font-medium text-dark">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Right: Profile Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: "easeOut" as const,
          }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-dark">
                {isEditing ? "Edit Profile" : "Profile Details"}
              </h3>
              {isEditing && (
                <button
                  onClick={() => {
                    reset({
                      name: user.name ?? "",
                      phone: user.phone ?? "",
                    });
                    setIsEditing(false);
                  }}
                  className="text-sm text-muted hover:text-dark transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              /* ── Edit Form ── */
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  error={errors.name?.message}
                  {...register("name")}
                />

                <Input
                  label="Email Address"
                  name="email"
                  value={user.email}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />

                <Input
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  error={errors.phone?.message}
                  {...register("phone")}
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    isLoading={saving}
                    disabled={!isDirty}
                  >
                    <HiCheck className="w-4 h-4 mr-1.5" />
                    Save Changes
                  </Button>
                  {saving && (
                    <span className="text-sm text-muted">
                      Updating profile...
                    </span>
                  )}
                </div>
              </form>
            ) : (
              /* ── Read-Only View ── */
              <div className="space-y-5">
                {/* Name */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 sm:w-40 shrink-0">
                    <HiUser className="w-4 h-4 text-muted" />
                    <span className="text-sm font-medium text-muted">
                      Full Name
                    </span>
                  </div>
                  <p className="text-sm text-dark font-medium">
                    {user.name || "—"}
                  </p>
                </div>

                {/* Email */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 sm:w-40 shrink-0">
                    <HiMail className="w-4 h-4 text-muted" />
                    <span className="text-sm font-medium text-muted">
                      Email
                    </span>
                  </div>
                  <p className="text-sm text-dark font-medium">
                    {user.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3">
                  <div className="flex items-center gap-2 sm:w-40 shrink-0">
                    <HiPhone className="w-4 h-4 text-muted" />
                    <span className="text-sm font-medium text-muted">
                      Phone
                    </span>
                  </div>
                  <p className="text-sm text-dark font-medium">
                    {user.phone || "Not provided"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Background Refresh Indicator ── */}
      {fetchingUser && (
        <div className="fixed bottom-6 right-6 z-50 bg-dark text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
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
          Syncing...
        </div>
      )}
    </div>
  );
}