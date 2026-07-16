"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPropertyById, getReviews, getProperties, addReview, checkFavorite, toggleFavorite, createInquiry, scheduleVisit, createDeal } from '@/lib/api';
import PropertyCard from '@/components/properties/PropertyCard';
import { useAuthStore } from '@/lib/store';

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
  HiHeart,
  HiPhone,
  HiMail,
  HiCash,
  HiCreditCard,
  HiX,
  HiShieldCheck,
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<IProperty | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [related, setRelated] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  // Modal states
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  // Contact owner form
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Visit form
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitPhone, setVisitPhone] = useState('');
  const [visitNote, setVisitNote] = useState('');
  const [visitSubmitting, setVisitSubmitting] = useState(false);

  // Offer form
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerPhone, setOfferPhone] = useState('');
  const [offerFinancing, setOfferFinancing] = useState('cash');
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  // Role checks
  const isAdmin = user?.role === 'admin';
  const isBuyer = user?.role === 'user';
  const isAgent = user?.role === 'agent';

  // Redirect to login if not authenticated
  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!id) return;
    const frame = requestAnimationFrame(() => setLoading(true));
    Promise.all([
      getPropertyById(id).catch(() => null),
      getReviews(id).catch(() => null),
    ])
      .then(([propRes, revRes]) => {
        const propData = propRes?.data?.data?.property || propRes?.data?.property || propRes?.data?.data || propRes?.data;
        if (!propData || !propData.title) {
          setNotFound(true);
          return;
        }
        setProperty(propData);
        setReviews(revRes?.data?.data?.reviews || revRes?.data?.data || []);

        // Check if favorited (only for buyers)
        if (isAuthenticated && isBuyer) {
          checkFavorite(id).then((favRes) => {
            if (favRes?.data?.data?.isFavorited) {
              setIsFavorited(true);
            }
          }).catch(() => {});
        }

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

  const handleToggleFavorite = async () => {
    if (!requireAuth()) return;
    if (isAdmin) return;
    if (!id) return;

    const prev = isFavorited;
    setIsFavorited(!prev);
    setTogglingFav(true);

    try {
      await toggleFavorite(id);
      toast.success(!prev ? "Added to favorites!" : "Removed from favorites.");
    } catch {
      setIsFavorited(prev);
    } finally {
      setTogglingFav(false);
    }
  };

  // Owner info helpers
  const ownerName = typeof property?.postedBy === 'object' ? property.postedBy.name : 'Agent';
  const ownerEmail = typeof property?.postedBy === 'object' ? property.postedBy.email : '';
  const ownerAvatar = typeof property?.postedBy === 'object' ? property.postedBy.avatar : '';
  const ownerPhone = typeof property?.postedBy === 'object' ? property.postedBy.phone : '';
  const propertyLocation = property?.location
    ? `${property.location.area}${property.location.area && property.location.city ? ', ' : ''}${property.location.city}`
    : '';

  const isOwnProperty = user && property && typeof property.postedBy !== 'object'
    ? false
    : user && typeof property?.postedBy === 'object' && property.postedBy.email === user.email;

  // Can show action buttons: only buyers (user role), not own property, not admin
  const canShowActions = !isOwnProperty && !isAdmin && isBuyer;

  // Contact Owner submit
  const handleContactSubmit = async () => {
    if (!contactMessage.trim()) {
      toast.warning("Please write a message.");
      return;
    }
    if (contactMessage.trim().length < 10) {
      toast.warning("Message must be at least 10 characters.");
      return;
    }
    try {
      setContactSubmitting(true);
      await createInquiry({ propertyId: id!, message: contactMessage.trim() });
      toast.success("Your message has been sent to the owner!");
      setContactMessage('');
      setContactModalOpen(false);
    } catch {
      // handled by interceptor
    } finally {
      setContactSubmitting(false);
    }
  };

  // Schedule Visit submit
  const handleVisitSubmit = async () => {
    if (!visitDate) { toast.warning("Please select a date."); return; }
    if (!visitTime) { toast.warning("Please select a time slot."); return; }
    if (!visitPhone.trim() || !/^[+\-\s()0-9]{7,20}$/.test(visitPhone.trim())) {
      toast.warning("Please enter a valid phone number.");
      return;
    }
    try {
      setVisitSubmitting(true);
      await scheduleVisit({
        propertyId: id!,
        preferredDate: visitDate,
        preferredTime: visitTime,
        name: user?.name || '',
        phone: visitPhone.trim(),
        message: visitNote.trim() || undefined,
      });
      toast.success("Visit scheduled successfully!");
      setVisitDate('');
      setVisitTime('');
      setVisitPhone('');
      setVisitNote('');
      setVisitModalOpen(false);
    } catch {
      // handled by interceptor
    } finally {
      setVisitSubmitting(false);
    }
  };

  // Make Offer submit
  const handleOfferSubmit = async () => {
    if (!offerAmount || !Number(offerAmount) || Number(offerAmount) <= 0) {
      toast.warning("Please enter a valid offer amount.");
      return;
    }
    if (!offerPhone.trim() || !/^[+\-\s()0-9]{7,20}$/.test(offerPhone.trim())) {
      toast.warning("Please enter a valid phone number.");
      return;
    }
    if (!offerMessage.trim() || offerMessage.trim().length < 10) {
      toast.warning("Please write a message (at least 10 characters).");
      return;
    }
    try {
      setOfferSubmitting(true);
      await createDeal({
        propertyId: id!,
        offerAmount: Number(offerAmount),
        message: offerMessage.trim(),
        financingMethod: offerFinancing,
        phone: offerPhone.trim(),
      });
      toast.success("Your offer has been submitted! The agent will review it.");
      setOfferAmount('');
      setOfferMessage('');
      setOfferPhone('');
      setOfferFinancing('cash');
      setBuyModalOpen(false);
    } catch {
      // handled by interceptor
    } finally {
      setOfferSubmitting(false);
    }
  };

  // Time slots for visit
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  ];

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split("T")[0];

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
            <HiOutlineViewGrid className="w-10 h-10 text-muted" />
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

            {/* SOLD badge */}
            {(property as any).status === 'sold' && (
              <span className="absolute top-4 right-20 px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white shadow-lg">
                SOLD
              </span>
            )}

            {/* Favorite Button — only for buyers (user role) */}
            {isBuyer && (
              <button
                onClick={handleToggleFavorite}
                disabled={togglingFav}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200 cursor-pointer disabled:opacity-70"
              >
                <HiHeart className={`w-5 h-5 transition-colors ${isFavorited ? 'text-rose-500' : 'text-gray-400'}`} />
              </button>
            )}
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
                  <span>{propertyLocation}</span>
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

            {/* Reviews — hidden for admin */}
            {!isAdmin && (
              <div>
                <h2 className="text-xl font-bold text-dark mb-4">
                  Reviews ({reviews.length})
                </h2>

                {/* Review Form — only for logged-in buyers (user role) */}
                {isAuthenticated && isBuyer ? (
                  <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
                    <h3 className="text-sm font-semibold text-dark mb-3">Write a Review</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="cursor-pointer"
                        >
                          <HiStar
                            className={`w-6 h-6 transition-colors ${
                              star <= reviewRating ? 'text-accent' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-muted ml-2">{reviewRating}/5</span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Share your experience with this property..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-vertical transition-all duration-200 mb-3"
                    />
                    <button
                      onClick={async () => {
                        if (!reviewComment.trim()) { toast.warning("Please write a comment."); return; }
                        try {
                          setSubmittingReview(true);
                          await addReview({ propertyId: id!, rating: reviewRating, comment: reviewComment.trim() });
                          toast.success("Review submitted!");
                          setReviewComment('');
                          setReviewRating(5);
                          const revRes = await getReviews(id!);
                          setReviews(revRes.data.data?.reviews || revRes.data.data || []);
                        } catch { toast.error("Failed to submit review."); }
                        finally { setSubmittingReview(false); }
                      }}
                      disabled={submittingReview}
                      className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                ) : isAuthenticated && !isBuyer ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center mb-6">
                    <p className="text-sm text-amber-700 font-medium">Please login as a user/buyer to write a review.</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-5 text-center mb-6">
                    <p className="text-sm text-muted mb-2">Please login to write a review.</p>
                    <button onClick={() => router.push('/login')} className="text-sm font-semibold text-primary hover:underline cursor-pointer">Login Now</button>
                  </div>
                )}

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
            )}
          </div>

          {/* Right sidebar - Agent Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-dark mb-4">Posted By</h3>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold overflow-hidden shrink-0">
                  {typeof property.postedBy === 'object' && property.postedBy.avatar ? (
                    <img src={property.postedBy.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <HiUser />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-dark">
                    {typeof property.postedBy === 'object' ? property.postedBy.name : 'Agent'}
                  </p>
                  <p className="text-xs text-muted capitalize">
                    {typeof property.postedBy === 'object' ? property.postedBy.role : 'agent'}
                  </p>
                </div>
              </div>

              {/* Owner contact info */}
              {typeof property.postedBy === 'object' && (
                <div className="space-y-2 mb-5">
                  {ownerEmail && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <HiMail className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{ownerEmail}</span>
                    </div>
                  )}
                  {ownerPhone && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <HiPhone className="w-4 h-4 text-primary shrink-0" />
                      <span>{ownerPhone}</span>
                    </div>
                  )}
                </div>
              )}

              {isOwnProperty ? (
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted">This is your own property listing.</p>
                </div>
              ) : canShowActions ? (
                <div className="space-y-3">
                  {/* Make an Offer — only for buyers (user role) */}
                  {isBuyer && (
                    <button
                      onClick={() => { if (requireAuth()) setBuyModalOpen(true); }}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 text-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <HiCash className="w-4 h-4" />
                      Make an Offer
                    </button>
                  )}
                  <button
                    onClick={() => { if (requireAuth()) setContactModalOpen(true); }}
                    className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <HiMail className="w-4 h-4" />
                    Contact Owner
                  </button>
                  <button
                    onClick={() => { if (requireAuth()) setVisitModalOpen(true); }}
                    className="w-full py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-all duration-300 text-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <HiCalendar className="w-4 h-4" />
                    Schedule a Visit
                  </button>
                </div>
              ) : isAdmin ? (
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted">Admin view — action buttons are hidden.</p>
                </div>
              ) : null}
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

      {/* ─── CONTACT OWNER MODAL ─── */}
      <AnimatePresence>
        {contactModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => !contactSubmitting && setContactModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <HiMail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-dark">Contact Owner</h2>
                      <p className="text-xs text-muted">Send a message to the property owner</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setContactModalOpen(false)}
                    disabled={contactSubmitting}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-dark hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  {/* Property info */}
                  <div className="bg-slate-50 rounded-xl p-3.5">
                    <p className="text-xs text-muted mb-1">Regarding Property</p>
                    <p className="text-sm font-semibold text-dark line-clamp-1">{property.title}</p>
                  </div>

                  {/* Owner card */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shrink-0 overflow-hidden">
                      {ownerAvatar ? (
                        <img src={ownerAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        ownerName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-dark">{ownerName}</p>
                      {ownerEmail && (
                        <p className="text-xs text-muted truncate">{ownerEmail}</p>
                      )}
                      {ownerPhone && (
                        <p className="text-xs text-muted">{ownerPhone}</p>
                      )}
                    </div>
                  </div>

                  {isAuthenticated && user && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-muted">
                        Sending as <span className="font-semibold text-dark">{user.name}</span>
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Hi, I'm interested in this property. Could you provide more details about..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      disabled={!isAuthenticated || contactSubmitting}
                      maxLength={1000}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-between mt-1.5">
                      <p className="text-xs text-muted">Minimum 10 characters</p>
                      <p className="text-xs text-muted">{contactMessage.length}/1000</p>
                    </div>
                  </div>

                  <button
                    onClick={handleContactSubmit}
                    disabled={contactSubmitting || !isAuthenticated}
                    className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {contactSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <HiMail className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── SCHEDULE VISIT MODAL ─── */}
      <AnimatePresence>
        {visitModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => !visitSubmitting && setVisitModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <HiCalendar className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-dark">Schedule a Visit</h2>
                      <p className="text-xs text-muted">Pick a date & time to visit the property</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVisitModalOpen(false)}
                    disabled={visitSubmitting}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-dark hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  <div className="bg-slate-50 rounded-xl p-3.5">
                    <p className="text-xs text-muted mb-1">Property</p>
                    <p className="text-sm font-semibold text-dark line-clamp-1">{property.title}</p>
                    {propertyLocation && (
                      <div className="flex items-center gap-1 text-xs text-muted mt-1">
                        <HiLocationMarker className="w-3 h-3" />
                        <span>{propertyLocation}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                      <HiCalendar className="w-4 h-4 text-primary" />
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => { setVisitDate(e.target.value); setVisitTime(""); }}
                      min={today}
                      max={maxDateStr}
                      disabled={!isAuthenticated || visitSubmitting}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-muted mt-1.5">You can schedule up to 3 months in advance</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                      Preferred Time <span className="text-red-500">*</span>
                    </label>
                    {visitDate ? (
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setVisitTime(slot)}
                            disabled={!isAuthenticated || visitSubmitting}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                              visitTime === slot
                                ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                                : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-muted">Please select a date first to see available time slots.</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                      <HiPhone className="w-4 h-4 text-primary" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={visitPhone}
                      onChange={(e) => setVisitPhone(e.target.value)}
                      placeholder="e.g. +880 1234-567890"
                      disabled={!isAuthenticated || visitSubmitting}
                      maxLength={20}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-muted mt-1.5">The agent will use this to contact you</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                      <HiMail className="w-4 h-4 text-primary" />
                      Additional Note <span className="text-muted font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={visitNote}
                      onChange={(e) => setVisitNote(e.target.value)}
                      placeholder="Any specific questions or requests..."
                      disabled={!isAuthenticated || visitSubmitting}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-muted mt-1 text-right">{visitNote.length}/500</p>
                  </div>

                  <button
                    onClick={handleVisitSubmit}
                    disabled={visitSubmitting || !isAuthenticated}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {visitSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <HiCheckCircle className="w-4 h-4" />
                        Confirm Visit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAKE AN OFFER MODAL ─── */}
      <AnimatePresence>
        {buyModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => !offerSubmitting && setBuyModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <HiCash className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-dark">Make an Offer</h2>
                      <p className="text-xs text-muted">Submit your offer to the property owner</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBuyModalOpen(false)}
                    disabled={offerSubmitting}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-dark hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  {/* Property info */}
                  <div className="bg-slate-50 rounded-xl p-3.5">
                    <p className="text-xs text-muted mb-1">Property</p>
                    <p className="text-sm font-semibold text-dark line-clamp-1">{property.title}</p>
                    <p className="text-lg font-bold text-secondary mt-1">
                      Listed Price: {formatPrice(property.price, property.priceType)}
                    </p>
                    {propertyLocation && (
                      <div className="flex items-center gap-1 text-xs text-muted mt-1">
                        <HiLocationMarker className="w-3 h-3" />
                        <span>{propertyLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* Offer Amount */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                      <HiCash className="w-4 h-4 text-emerald-600" />
                      Your Offer Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">&#x09F3;</span>
                      <input
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder={String(property.price)}
                        disabled={!isAuthenticated || offerSubmitting}
                        min={1}
                        className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    {offerAmount && Number(offerAmount) > 0 && property.price > 0 && (
                      <p className={`text-xs mt-1.5 font-medium ${Number(offerAmount) <= property.price ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {Number(offerAmount) <= property.price
                          ? `${Math.round(((property.price - Number(offerAmount)) / property.price) * 100)}% below listing price`
                          : `${Math.round(((Number(offerAmount) - property.price) / property.price) * 100)}% above listing price`}
                      </p>
                    )}
                  </div>

                  {/* Financing Method */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                      <HiCreditCard className="w-4 h-4 text-primary" />
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'cash', label: 'Cash Payment', desc: 'Full cash payment' },
                        { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct bank transfer' },
                        { value: 'loan', label: 'Bank Loan', desc: 'Financed by bank loan' },
                        { value: 'mortgage', label: 'Mortgage', desc: 'Mortgage financing' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setOfferFinancing(opt.value)}
                          disabled={!isAuthenticated || offerSubmitting}
                          className={`py-2.5 px-3 rounded-xl text-left transition-all duration-200 cursor-pointer border ${
                            offerFinancing === opt.value
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm"
                              : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <p className="text-xs font-semibold">{opt.label}</p>
                          <p className="text-[10px] text-muted mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                      <HiPhone className="w-4 h-4 text-primary" />
                      Your Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={offerPhone}
                      onChange={(e) => setOfferPhone(e.target.value)}
                      placeholder="e.g. +880 1234-567890"
                      disabled={!isAuthenticated || offerSubmitting}
                      maxLength={20}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-muted mt-1.5">The agent will contact you on this number</p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-dark mb-2">
                      <HiMail className="w-4 h-4 text-primary" />
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      placeholder="I'd like to make an offer on this property. I'm very interested and ready to proceed..."
                      disabled={!isAuthenticated || offerSubmitting}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-between mt-1.5">
                      <p className="text-xs text-muted">Minimum 10 characters</p>
                      <p className="text-xs text-muted">{offerMessage.length}/500</p>
                    </div>
                  </div>

                  <button
                    onClick={handleOfferSubmit}
                    disabled={offerSubmitting || !isAuthenticated}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {offerSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting Offer...
                      </>
                    ) : (
                      <>
                        <HiCash className="w-4 h-4" />
                        Submit Offer
                      </>
                    )}
                  </button>

                  {/* Buying Process Info */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                    <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
                      <HiShieldCheck className="w-3.5 h-3.5" />
                      How the buying process works
                    </p>
                    <ol className="text-[11px] text-blue-700 space-y-1 list-decimal list-inside">
                      <li>You submit an offer with your proposed price</li>
                      <li>Agent reviews and may counter-offer</li>
                      <li>Once accepted, pay earnest money via Stripe</li>
                      <li>Agent verifies payment and finalizes the sale</li>
                    </ol>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}