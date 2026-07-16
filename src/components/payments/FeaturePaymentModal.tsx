"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";
import {
  HiX,
  HiShieldCheck,
  HiCreditCard,
  HiExclamationCircle,
  HiCheckCircle,
  HiStar,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { createPaymentIntent, confirmPayment } from "@/lib/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface FeaturePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  amountBDT: number;
  onSuccess: () => void;
}

export default function FeaturePaymentModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  amountBDT,
  onSuccess,
}: FeaturePaymentModalProps) {
  const [step, setStep] = useState<"payment" | "processing" | "success">("payment");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const usdAmount = (amountBDT / 120).toFixed(2);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("payment");
      setClientSecret("");
      setPaymentIntentId("");
      setElements(null);
      setPaymentError("");
      setCardComplete(false);
      createIntent();
    }
  }, [isOpen]);

  const createIntent = async () => {
    setLoading(true);
    try {
      const res = await createPaymentIntent(propertyId, amountBDT);
      const data = res.data.data || res.data;
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch {
      // handled by interceptor
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Initialize Stripe Elements when we have a client secret
  useEffect(() => {
    if (!clientSecret || !isOpen) return;

    let mounted = true;

    (async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe || !mounted) return;

        setStripeInstance(stripe);

        const els = stripe.elements({
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#2563eb",
              colorBackground: "#ffffff",
              colorText: "#1e293b",
              colorDanger: "#ef4444",
              fontFamily: "'Inter', system-ui, sans-serif",
              borderRadius: "12px",
            },
          },
        });

        const paymentElement = els.create("payment", {
          layout: "tabs",
        });

        paymentElement.mount("#feature-stripe-element");
        paymentElement.on("change", (e: any) => {
          setCardComplete(e.complete);
          if (e.error?.message) {
            setPaymentError(e.error.message);
          } else {
            setPaymentError("");
          }
        });

        if (mounted) {
          setElements(els);
        }
      } catch (err: any) {
        console.error("Stripe init error:", err);
        if (mounted) {
          toast.error("Failed to initialize payment.");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [clientSecret, isOpen]);

  const handlePay = async () => {
    if (!stripeInstance || !elements) return;

    setLoading(true);
    setPaymentError("");
    setStep("processing");

    try {
      const { error, paymentIntent } = await stripeInstance.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/seller/listings`,
        },
        redirect: "if_required",
      });

      if (error) {
        setPaymentError(error.message || "Payment failed.");
        setStep("payment");
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        await confirmPayment(propertyId, paymentIntentId);
        setStep("success");
        toast.success("Property featured successfully!");
        onSuccess();
      }
    } catch {
      toast.error("Payment processing failed. Please try again.");
      setStep("payment");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && step !== "processing" && onClose()}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
        >
          {step !== "processing" && step !== "success" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer z-20"
            >
              <HiX className="w-4 h-4 text-slate-600" />
            </button>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <HiCheckCircle className="w-9 h-9 text-amber-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-dark mb-2">Property Featured!</h3>
              <p className="text-sm text-muted mb-6">
                Your property will now appear in the featured section on the homepage.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* Processing */}
          {step === "processing" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <HiCreditCard className="w-9 h-9 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Processing Payment...</h3>
              <p className="text-sm text-muted">Please wait while we process your payment.</p>
            </div>
          )}

          {/* Payment */}
          {step === "payment" && (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <HiStar className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-dark">Feature Property</h2>
                    <p className="text-xs text-muted">Secure payment via Stripe</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Property</span>
                  <span className="text-sm font-medium text-dark truncate max-w-[200px]">{propertyTitle}</span>
                </div>
                <div className="border-t border-amber-200/60 my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Feature Fee</span>
                  <span className="text-lg font-bold text-primary">৳{amountBDT.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted">Approx. USD</span>
                  <span className="text-sm text-slate-500">${usdAmount}</span>
                </div>
              </div>

              <div className="mb-4">
                <div id="feature-stripe-element" />
              </div>

              {paymentError && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 rounded-lg p-3">
                  <HiExclamationCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted mb-4">
                <HiShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>

              <button
                onClick={handlePay}
                disabled={loading || !cardComplete}
                className="w-full py-3.5 px-4 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <HiStar className="w-4 h-4" />
                    Pay ৳{amountBDT.toLocaleString()} Now
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}