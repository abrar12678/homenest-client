import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import PropertyTypes from '@/components/home/PropertyTypes';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import Newsletter from '@/components/home/Newsletter';
import CTA from '@/components/home/CTA';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Stats />
      <HowItWorks />
      <FeaturedProperties />
      <PropertyTypes />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <Newsletter />
      <CTA />
    </main>
  );
}