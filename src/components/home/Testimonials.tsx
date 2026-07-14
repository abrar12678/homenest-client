"use client";

import { motion } from "framer-motion";
import { HiStar } from "react-icons/hi";

const testimonials = [
  {
    name: "Rahim Uddin",
    role: "Homeowner in Gulshan",
    rating: 5,
    initials: "RU",
    gradient: "from-blue-500 to-blue-600",
    borderColor: "border-l-blue-500",
    quoteColor: "text-blue-500",
    text: "HomeNest made finding our dream apartment in Dhanmondi incredibly easy. The verified listings gave us complete peace of mind, and the whole process was smoother than we ever imagined.",
  },
  {
    name: "Fatima Akhter",
    role: "Property Agent",
    rating: 5,
    initials: "FA",
    gradient: "from-emerald-500 to-emerald-600",
    borderColor: "border-l-emerald-500",
    quoteColor: "text-emerald-500",
    text: "As a property agent, listing on HomeNest has been fantastic. The platform is professional and I get genuine inquiries. My listings get much more visibility compared to other platforms.",
  },
  {
    name: "Karim Hossain",
    role: "Business Owner",
    rating: 4,
    initials: "KH",
    gradient: "from-amber-500 to-amber-600",
    borderColor: "border-l-amber-500",
    quoteColor: "text-amber-500",
    text: "The search and filter options are amazing. I found the perfect commercial space for my business within a week! The customer support team was also very helpful throughout the process.",
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
              key={t.name}
              className={`group relative bg-white rounded-2xl p-7 border border-slate-100 border-l-4 ${t.borderColor} hover:shadow-xl transition-all duration-300 flex flex-col`}
              variants={cardVariants}
            >
              {/* Decorative Quote Mark */}
              <div
                className={`text-6xl font-serif leading-none bg-gradient-to-br ${t.gradient} bg-clip-text text-transparent opacity-20 mb-2`}
              >
                &ldquo;
              </div>

              {/* Star Rating */}
              <div className="flex gap-0.5 mb-4">
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