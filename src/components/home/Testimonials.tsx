"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiStar } from "react-icons/hi";
import { getStats } from "@/lib/api";
import { truncateText } from "@/lib/utils";

interface TestimonialItem {
  name: string;
  role: string;
  rating: number;
  initials: string;
  gradient: string;
  borderColor: string;
  text: string;
}

const gradients = [
  { gradient: "from-blue-500 to-blue-600", border: "border-l-blue-500" },
  { gradient: "from-emerald-500 to-emerald-600", border: "border-l-emerald-500" },
  { gradient: "from-amber-500 to-amber-600", border: "border-l-amber-500" },
];

// Fallback testimonials when DB has no reviews yet
const fallbackTestimonials: TestimonialItem[] = [
  {
    name: "HomeNest User",
    role: "Property Explorer",
    rating: 5,
    initials: "HN",
    gradient: "from-blue-500 to-blue-600",
    borderColor: "border-l-blue-500",
    text: "HomeNest provides a great platform for finding properties. The listings are well-organized and the search filters make it easy to find exactly what you need.",
  },
  {
    name: "Verified Agent",
    role: "Property Agent",
    rating: 5,
    initials: "VA",
    gradient: "from-emerald-500 to-emerald-600",
    borderColor: "border-l-emerald-500",
    text: "Listing on HomeNest has been a great experience. The platform is professional and helps connect agents with genuine buyers effectively.",
  },
  {
    name: "Satisfied Client",
    role: "Home Buyer",
    rating: 4,
    initials: "SC",
    gradient: "from-amber-500 to-amber-600",
    borderColor: "border-l-amber-500",
    text: "Found the perfect property through HomeNest. The detailed listings and reviews helped us make an informed decision quickly and confidently.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(fallbackTestimonials);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getStats()
      .then((res) => {
        const data = res.data?.data;
        if (data?.recentTestimonials && data.recentTestimonials.length > 0) {
          const items: TestimonialItem[] = data.recentTestimonials.slice(0, 3).map((review: any, idx: number) => {
            const colors = gradients[idx % gradients.length];
            const nameParts = review.userName.split(" ");
            const initials = nameParts.length >= 2
              ? (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
              : review.userName.substring(0, 2).toUpperCase();
            return {
              name: review.userName,
              role: review.propertyTitle ? `Reviewed: ${truncateText(review.propertyTitle, 30)}` : "Verified Reviewer",
              rating: review.rating,
              initials,
              gradient: colors.gradient,
              borderColor: colors.border,
              text: review.comment,
            };
          });
          setTestimonials(items);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.span
            className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Testimonials
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-dark mb-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            What Our Clients Say
          </motion.h2>
          <motion.p
            className="text-muted max-w-xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Real experiences from people who found their ideal properties
          </motion.p>
        </div>

        {/* Testimonial Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name + t.text}
              className={`group relative bg-white rounded-2xl p-7 border border-slate-100 border-l-4 ${t.borderColor} hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col hover:border-slate-200`}
              variants={cardVariants}
            >
              {/* Decorative Quote Mark */}
              <div
                className={`text-6xl font-serif leading-none bg-gradient-to-br ${t.gradient} bg-clip-text text-transparent opacity-20 mb-2`}
              >
                &ldquo;
              </div>

              {/* Star Rating */}
              <div className="flex gap-0.5 mb-4 group-hover:gap-1 transition-all duration-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <HiStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < t.rating ? "text-amber-400" : "text-slate-200"
                    }`}
                  />
                ))}
              </div>

              {/* Quote Text */}
              <p className="text-sm text-dark/80 leading-relaxed mb-6 flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Divider */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3">
                  {/* Avatar with Initials */}
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md`}
                  >
                    {t.initials}
                  </div>

                  {/* Author Info */}
                  <div>
                    <p className="text-sm font-bold text-dark">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}