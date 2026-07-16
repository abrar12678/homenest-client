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
} from "react-icons/hi";
import { toast } from "react-toastify";
import { createDealPaymentIntent, confirmDealPayment as confirmDealPaymentAPI } from "@/lib/api";
import { formatPrice, formatNumber } from "@/lib/utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  dealTitle: string;
  finalAmount: number;
  onSuccess: (deal: any) => void;
}

const BDT_TO_USD = 0.0083;
const EARNEST_PERCENTAGE = 2;
const MIN_EARNEST = 5000;
const MAX_EARNEST = 500000;

export default function StripePaymentModal({
  isOpen,
  onClose,
  dealId,
  dealTitle,
  finalAmount,
  onSuccess,
}: StripePaymentModalProps) {
  const [step, setStep] = useState<"amount" | "payment" | "processing" | "success">("amount");
  const [earnestAmount, setEarnestAmount] = useState<number>(
    Math.max(Math.round(finalAmount * (EARNEST_PERCENTAGE / 100)), MIN_EARNEST)
  );
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("amount");
      setClientSecret("");
      setPaymentIntentId("");
      setElements(null);
      setPaymentError("");
      setCardComplete(false);
      setCustomAmount("");
      setEarnestAmount(Math.max(Math.round(finalAmount * (EARNEST_PERCENTAGE / 100)), MIN_EARNEST));
    }
  }, [isOpen, finalAmount]);

  // Initialize Stripe when we have a client secret
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

        paymentElement.mount("#stripe-payment-element");
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
          toast.error("Failed to initialize payment. Please try again.");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [clientSecret, isOpen]);

  const handleCreateIntent = async () => {
    setLoading(true);
    try {
      const amountToUse = customAmount ? Number(customAmount) : earnestAmount;
      const res = await createDealPaymentIntent(dealId, amountToUse);
      const data = res.data.data || res.data;
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setStep("payment");
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!stripeInstance || !elements) return;

    setLoading(true);
    setPaymentError("");

    try {
      const { error, paymentIntent } = await stripeInstance.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/buyer/deals`,
        },
        redirect: "if_required",
      });

      if (error) {
        setPaymentError(error.message || "Payment failed. Please try again.");
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded — confirm on server
        const confirmRes = await confirmDealPaymentAPI(dealId, paymentIntentId);
        const confirmData = confirmRes.data.data || confirmRes.data;
        setStep("success");
        toast.success("Payment successful!");
        onSuccess(confirmData.deal);
      }
    } catch {
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const effectiveAmount = customAmount ? Number(customAmount) : earnestAmount;
  const earnestUSD = (effectiveAmount * BDT_TO_USD).toFixed(2);

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
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
        >
          {/* Close button */}
          {step !== "processing" && step !== "success" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer z-20"
            >
              <HiX className="w-4 h-4 text-slate-600" />
            </button>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <HiCheckCircle className="w-9 h-9 text-emerald-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-dark mb-2">Payment Successful!</h3>
              <p className="text-sm text-muted mb-1">Your earnest money has been received.</p>
              <p className="text-sm text-muted mb-6">
                The agent will verify the payment and proceed with the deal.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-muted mb-1">Transaction ID</p>
                <p className="text-xs font-mono text-dark break-all">{paymentIntentId}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <HiCreditCard className="w-9 h-9 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Processing Payment...</h3>
              <p className="text-sm text-muted">Please wait while we process your payment.</p>
            </div>
          )}

          {/* Payment Step (Stripe Elements) */}
          {step === "payment" && (
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <HiCreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-dark">Pay Earnest Money</h2>
                    <p className="text-xs text-muted">Secure payment via Stripe</p>
                  </div>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Property</span>
                  <span className="text-sm font-medium text-dark truncate max-w-[200px]">{dealTitle}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Deal Amount</span>
                  <span className="text-sm font-semibold text-dark">{formatPrice(finalAmount, "total")}</span>
                </div>
                <div className="border-t border-blue-200/60 my-2" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Earnest Money</span>
                  <span className="text-lg font-bold text-primary">
                    ৳{formatNumber(effectiveAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Approx. USD</span>
                  <span className="text-sm text-slate-500">${earnestUSD}</span>
                </div>
              </div>

              {/* Stripe Payment Element */}
              <div className="mb-4">
                <div id="stripe-payment-element" />
              </div>

              {/* Error */}
              {paymentError && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 rounded-lg p-3">
                  <HiExclamationCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-center gap-2 text-xs text-muted mb-4">
                <HiShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayNow}
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
                    <HiShieldCheck className="w-4 h-4" />
                    Pay ৳{formatNumber(effectiveAmount)} Now
                  </>
                )}
              </button>
            </div>
          )}

          {/* Amount Selection Step */}
          {step === "amount" && (
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <HiCreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-dark">Pay Earnest Money</h2>
                    <p className="text-xs text-muted">Secure your deal with a deposit</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <HiExclamationCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">What is Earnest Money?</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Earnest money is a good-faith deposit showing your commitment to purchase.
                      It will be applied toward the final property price. Minimum: ৳{MIN_EARNEST.toLocaleString()},
                      Maximum: ৳{MAX_EARNEST.toLocaleString()}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Deal Summary */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-muted mb-1">Property</p>
                <p className="text-sm font-medium text-dark mb-3 truncate">{dealTitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Accepted Deal Amount</span>
                  <span className="text-base font-bold text-dark">{formatPrice(finalAmount, "total")}</span>
                </div>
              </div>

              {/* Suggested Amount */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-dark mb-2">
                  Suggested Earnest Money ({EARNEST_PERCENTAGE}% of deal)
                </label>
                <div className="bg-blue-50 border-2 border-primary/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-primary">
                      ৳{formatNumber(earnestAmount)}
                    </p>
                    <p className="text-xs text-muted">≈ ${(earnestAmount * BDT_TO_USD).toFixed(2)} USD</p>
                  </div>
                  <button
                    onClick={() => {
                      setCustomAmount("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      !customAmount
                        ? "bg-primary text-white"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    Use This
                  </button>
                </div>
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-dark mb-2">
                  Or Enter Custom Amount (BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">৳</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={String(earnestAmount)}
                    min={MIN_EARNEST}
                    max={MAX_EARNEST}
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                {customAmount && Number(customAmount) > 0 && (
                  <p className="text-xs text-muted mt-1">
                    ≈ ${(Number(customAmount) * BDT_TO_USD).toFixed(2)} USD
                  </p>
                )}
                {customAmount && (Number(customAmount) < MIN_EARNEST || Number(customAmount) > MAX_EARNEST) && (
                  <p className="text-xs text-red-500 mt-1">
                    Amount must be between ৳{MIN_EARNEST.toLocaleString()} and ৳{MAX_EARNEST.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Security */}
              <div className="flex items-center gap-2 text-xs text-muted mb-6">
                <HiShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Payments are processed securely through Stripe. We never store your card details.</span>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleCreateIntent}
                disabled={loading || (customAmount && (Number(customAmount) < MIN_EARNEST || Number(customAmount) > MAX_EARNEST))}
                className="w-full py-3.5 px-4 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Initializing...
                  </>
                ) : (
                  <>
                    <HiCreditCard className="w-4 h-4" />
                    Continue to Payment
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