"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiShieldCheck,
  HiLightBulb,
  HiHeart,
  HiGlobe,
  HiChevronRight,
  HiCheckCircle,
  HiOfficeBuilding,
} from 'react-icons/hi';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const values = [
  {
    title: 'Trust & Transparency',
    description:
      'We believe in honest and transparent dealings. Every property listed on our platform is verified, and every interaction is built on trust between property seekers and owners.',
    icon: HiShieldCheck,
    color: 'from-blue-50 to-blue-100/50',
    iconColor: 'bg-blue-100 text-primary',
    borderHover: 'hover:border-primary/30',
  },
  {
    title: 'Innovation',
    description:
      'We continuously improve our platform with the latest technology to make property search smarter, faster, and more enjoyable for everyone in Bangladesh.',
    icon: HiLightBulb,
    color: 'from-amber-50 to-amber-100/50',
    iconColor: 'bg-amber-100 text-accent',
    borderHover: 'hover:border-accent/30',
  },
  {
    title: 'Customer First',
    description:
      'Our users are at the heart of everything we do. We listen, adapt, and deliver solutions that genuinely solve real estate challenges faced by Bangladeshis.',
    icon: HiHeart,
    color: 'from-red-50 to-red-100/50',
    iconColor: 'bg-red-100 text-red-500',
    borderHover: 'hover:border-red-300',
  },
  {
    title: 'Local Expertise',
    description:
      "With deep understanding of Bangladesh's real estate landscape, we provide insights and guidance tailored to local markets, neighborhoods, and communities.",
    icon: HiGlobe,
    color: 'from-green-50 to-green-100/50',
    iconColor: 'bg-green-100 text-secondary',
    borderHover: 'hover:border-secondary/30',
  },
];

const team = [
  {
    name: 'Aminul Haque',
    role: 'Founder & CEO',
    bio: 'Former real estate consultant with 15+ years of experience in Bangladesh property market. Passionate about making property search accessible to all.',
    initials: 'AH',
    gradient: 'from-primary to-primary-light',
  },
  {
    name: 'Nadia Rahman',
    role: 'Head of Operations',
    bio: 'Operations specialist with expertise in scaling tech platforms. Ensures every listing meets our quality standards and users get the best experience.',
    initials: 'NR',
    gradient: 'from-secondary to-secondary-light',
  },
  {
    name: 'Tanvir Ahmed',
    role: 'Chief Technology Officer',
    bio: 'Full-stack engineer with a passion for building scalable platforms. Leads our engineering team in delivering a seamless property search experience.',
    initials: 'TA',
    gradient: 'from-purple-500 to-purple-400',
  },
  {
    name: 'Samira Begum',
    role: 'Head of Customer Success',
    bio: 'Customer experience champion who ensures every user interaction with HomeNest is positive, helpful, and results in finding the right property.',
    initials: 'SB',
    gradient: 'from-accent to-amber-400',
  },
];

const milestones = [
  { number: '2023', label: 'Founded in Dhaka', icon: '🚀' },
  { number: '10K+', label: 'Properties Listed', icon: '🏠' },
  { number: '5K+', label: 'Active Users', icon: '👥' },
  { number: '50+', label: 'Cities Covered', icon: '📍' },
];

export default function AboutPage() {
  return (
    <main className="pt-20 pb-0 bg-white">
      {/* Hero / Page Header */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light py-20 md:py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <nav className="flex justify-center items-center gap-2 text-sm text-blue-200 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <HiChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">About</span>
            </nav>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              About HomeNest
            </h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Bangladesh&apos;s trusted platform connecting property seekers with verified
              listings across the country
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                <HiOfficeBuilding className="w-3.5 h-3.5" />
                Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6 leading-tight">
                Building a Better Way to Find Homes
              </h2>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>
                  HomeNest was founded in 2023 with a simple yet powerful vision: to
                  transform the way Bangladeshis find and list properties. Born out of
                  frustration with unverified listings and opaque dealings in the real
                  estate market, our founders set out to build a platform that
                  prioritizes trust, transparency, and user experience.
                </p>
                <p>
                  Starting from a small office in Dhaka, we have grown into a
                  platform trusted by thousands of property seekers and hundreds of
                  agents across Bangladesh. Our commitment to verifying every listing
                  and providing exceptional customer service has made us the go-to
                  destination for property search.
                </p>
                <p>
                  Today, HomeNest covers major cities including Dhaka, Chittagong,
                  Sylhet, Rajshahi, Khulna, and Comilla, with plans to expand to
                  every corner of Bangladesh.
                </p>
              </div>
            </motion.div>

            {/* Right — Milestones */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {milestones.map((item, idx) => (
                <motion.div
                  key={item.label}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                >
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <div className="text-2xl font-bold text-dark mb-1">{item.number}</div>
                  <div className="text-sm text-muted">{item.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Mission — Gradient Border Card */}
      <section className="py-20 md:py-24 bg-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-white rounded-2xl p-8 md:p-12 overflow-hidden"
          >
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 rounded-2xl p-[2px] overflow-hidden">
              <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,#1E40AF,#059669,#F59E0B,#7C3AED,#1E40AF)]" />
            </div>
            <div className="absolute inset-[2px] bg-white rounded-2xl" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-6">
                <HiCheckCircle className="w-3.5 h-3.5" />
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6 leading-tight">
                Making Property Search Simple,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Transparent & Trustworthy
                </span>{' '}
                for Everyone
              </h2>
              <p className="text-muted leading-relaxed text-lg">
                We aim to be the bridge between property seekers and property owners,
                creating a marketplace where every transaction is fair, every listing
                is authentic, and every user finds exactly what they are looking for.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
                {[
                  { label: 'Verified Listings', desc: 'Every property is personally verified by our team' },
                  { label: 'Fair Pricing', desc: 'Transparent pricing with no hidden charges or fees' },
                  { label: '24/7 Support', desc: 'Dedicated team to help you at every step' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <HiCheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-dark text-sm mb-1">{item.label}</h3>
                    <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-4">
              <HiHeart className="w-3.5 h-3.5" />
              Core Values
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-3">
              What We Stand For
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              The principles that guide everything we do at HomeNest
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {values.map((value, idx) => (
              <motion.div
                key={value.title}
                className={`group bg-gradient-to-br ${value.color} border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${value.borderHover}`}
                variants={fadeInUp}
                custom={idx}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${value.iconColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">{value.title}</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 md:py-24 bg-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold mb-4">
              <HiGlobe className="w-3.5 h-3.5" />
              Our Team
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-3">
              Meet the People Behind HomeNest
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              The passionate individuals working to improve your property search experience
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {team.map((member, idx) => (
              <motion.div
                key={member.name}
                className="group bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
                variants={fadeInUp}
                custom={idx}
              >
                <div className="relative inline-block mb-5">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform duration-300`}
                  >
                    {member.initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <HiCheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-dark mb-1">{member.name}</h3>
                <p className="text-sm font-medium text-primary mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-muted leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </main>
  );
}