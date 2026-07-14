"use client";

import { motion } from "framer-motion";
import { HiSearch, HiEye, HiKey } from "react-icons/hi";

const steps = [
  {
    number: "01",
    title: "Search Properties",
    description:
      "Browse through thousands of verified listings tailored to your preferences and budget with our advanced filters.",
    icon: HiSearch,
    gradient: "from-primary to-primary-light",
    ringColor: "ring-primary/20",
  },
  {
    number: "02",
    title: "Visit & Inspect",
    description:
      "Schedule visits and inspect your chosen property to ensure it meets your expectations and requirements.",
    icon: HiEye,
    gradient: "from-secondary to-secondary-light",
    ringColor: "ring-secondary/20",
  },
  {
    number: "03",
    title: "Get Your Keys",
    description:
      "Complete the process and move to your new home with confidence, supported by our team every step of the way.",
    icon: HiKey,
    gradient: "from-accent to-accent-light",
    ringColor: "ring-accent/20",
  },
];

const sectionFade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const cardFade = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.2, ease: "easeOut" as const },
  }),
};

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-24 bg-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="text-center mb-16">
          <motion.span
            className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-4"
            variants={sectionFade}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            How It Works
          </motion.span>

          <motion.h2
            className="text-3xl md:text-4xl font-bold text-dark mb-3"
            variants={sectionFade}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Three Simple Steps
          </motion.h2>

          <motion.p
            className="text-muted max-w-xl mx-auto leading-relaxed"
            variants={sectionFade}
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Finding your dream property is easier than you think. Follow these
            three steps and you&apos;ll be settling in no time.
          </motion.p>
        </div>

        {/* ── Steps grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* ── Connecting line (desktop only) ── */}
          <svg
            className="hidden md:block absolute top-[72px] left-[20%] right-[20%] h-4 z-0"
            preserveAspectRatio="none"
            fill="none"
            viewBox="0 0 100 4"
          >
            <line
              x1="0"
              y1="2"
              x2="100"
              y2="2"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
          </svg>

          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              className="relative z-10 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              variants={cardFade}
              custom={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Large numbered circle */}
              <div className="flex items-center justify-center mb-6">
                <div
                  className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg ring-4 ${step.ringColor} group-hover:scale-110 transition-transform duration-300`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                  {/* Step number badge */}
                  <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-dark text-white text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                    {step.number}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-dark text-center mb-3">
                {step.title}
              </h3>

              <p className="text-sm text-muted text-center leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
