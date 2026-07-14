"use client";

import { motion } from "framer-motion";
import { HiShieldCheck, HiCurrencyDollar, HiSupport, HiLightningBolt } from "react-icons/hi";

const features = [
  {
    title: "Verified Listings",
    description:
      "Every property is verified by our team for authenticity and accuracy before going live on the platform",
    icon: HiShieldCheck,
    color: "#2563EB",
    bgClass: "bg-blue-50",
  },
  {
    title: "Best Prices",
    description:
      "Get the best deals with our transparent pricing model and absolutely no hidden charges or fees",
    icon: HiCurrencyDollar,
    color: "#059669",
    bgClass: "bg-emerald-50",
  },
  {
    title: "24/7 Support",
    description:
      "Our dedicated team is always available to help you find your perfect home at any time",
    icon: HiSupport,
    color: "#D97706",
    bgClass: "bg-amber-50",
  },
  {
    title: "Easy Process",
    description:
      "From search to move-in, we make the entire process seamless and stress-free for you",
    icon: HiLightningBolt,
    color: "#7C3AED",
    bgClass: "bg-violet-50",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
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

export default function WhyChooseUs() {
  return (
    <section className="py-20 md:py-24 bg-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.span
            className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Choose Us
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-dark mb-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Why Choose HomeNest?
          </motion.h2>
          <motion.p
            className="text-muted max-w-xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            We go above and beyond to make your experience exceptional
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="group bg-white rounded-2xl p-7 text-center border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-default"
              variants={cardVariants}
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl ${feature.bgClass} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-dark mb-2">{feature.title}</h3>

              {/* Description */}
              <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}