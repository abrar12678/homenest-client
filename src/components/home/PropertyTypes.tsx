"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HiOfficeBuilding, HiHome, HiShoppingBag, HiTemplate } from "react-icons/hi";

const propertyTypes = [
  {
    type: "apartment",
    title: "Apartment",
    count: "3,500+",
    description: "Modern apartments in prime locations",
    icon: HiOfficeBuilding,
    gradient: "from-blue-500 to-blue-700",
  },
  {
    type: "villa",
    title: "Villa",
    count: "800+",
    description: "Luxurious villas with premium amenities",
    icon: HiHome,
    gradient: "from-violet-500 to-violet-700",
  },
  {
    type: "commercial",
    title: "Commercial",
    count: "1,200+",
    description: "Offices, shops, and business spaces",
    icon: HiShoppingBag,
    gradient: "from-amber-400 to-amber-600",
  },
  {
    type: "land",
    title: "Land",
    count: "600+",
    description: "Residential and commercial land plots",
    icon: HiTemplate,
    gradient: "from-emerald-500 to-emerald-700",
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
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

export default function PropertyTypes() {
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
            Property Types
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-dark mb-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Browse by Category
          </motion.h2>
          <motion.p
            className="text-muted max-w-xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Explore properties based on your specific needs
          </motion.p>
        </div>

        {/* Cards Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {propertyTypes.map((item) => (
            <motion.div key={item.type} variants={cardVariants}>
              <Link href={`/properties?type=${item.type}`} className="block h-full">
                <div className="group relative bg-white rounded-2xl border border-slate-100 p-6 text-center h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer">
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
                  />

                  <div className="relative z-10 flex flex-col items-center">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300`}
                    >
                      <item.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-dark group-hover:text-white mb-1 transition-colors duration-300">
                      {item.title}
                    </h3>

                    {/* Count */}
                    <p className="text-2xl font-extrabold text-primary group-hover:text-white mb-1 transition-colors duration-300">
                      {item.count}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-muted group-hover:text-white/80 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}