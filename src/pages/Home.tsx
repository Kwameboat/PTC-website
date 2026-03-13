import React from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Briefcase, 
  Plane, 
  ShieldCheck, 
  ArrowUpRight,
  CheckCircle2,
  MapPin,
  Building2
} from 'lucide-react';
import { HeroSlider } from '../components/HeroSlider';
import { Button, SectionHeader, GlassCard } from '../components/UI';
import { FutureBridge3D } from '../components/FutureBridge3D';

const StatsSection = () => (
  <section className="section-padding bg-charcoal">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
      {[
        { label: "Placements", value: "500+" },
        { label: "Countries", value: "12+" },
        { label: "Partners", value: "45+" },
        { label: "Success Rate", value: "98%" }
      ].map((stat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="text-center"
        >
          <h3 className="text-4xl md:text-5xl font-display font-bold text-gold-primary mb-2">{stat.value}</h3>
          <p className="text-white/50 uppercase tracking-widest text-xs">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

const ServicesSection = () => (
  <section className="section-padding relative overflow-hidden">
    <div className="absolute top-0 right-0 w-1/2 h-full bg-gold-primary/5 blur-[120px] -z-10" />
    <div className="max-w-7xl mx-auto">
      <SectionHeader 
        subtitle="Our Expertise"
        title="World-Class Recruitment & Global Mobility"
      />
      
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: Briefcase,
            title: "International Recruitment",
            desc: "Connecting skilled Ghanaian professionals with top-tier employers across Europe, Middle East, and North America."
          },
          {
            icon: Plane,
            title: "Global Mobility",
            desc: "Comprehensive relocation support, ensuring a seamless transition for candidates and their families."
          },
          {
            icon: ShieldCheck,
            title: "Visa & Compliance",
            desc: "Expert guidance through complex international documentation and legal requirements."
          }
        ].map((service, i) => (
          <GlassCard key={i}>
            <service.icon className="text-gold-primary w-12 h-12 mb-6" />
            <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
            <p className="text-white/60 leading-relaxed mb-6">{service.desc}</p>
            <a href="#" className="inline-flex items-center text-gold-primary font-bold group">
              Learn More <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </GlassCard>
        ))}
      </div>
    </div>
  </section>
);

const JobsSection = () => (
  <section className="section-padding bg-charcoal/50">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
        <SectionHeader 
          subtitle="Opportunities"
          title="Featured Global Openings"
        />
        <Button variant="outline" className="mb-12">View All Jobs</Button>
      </div>

      <div className="space-y-4">
        {[
          { title: "Senior Software Engineer", country: "Germany", industry: "Tech", type: "Full-time" },
          { title: "Registered Nurse", country: "United Kingdom", industry: "Healthcare", type: "Contract" },
          { title: "Hospitality Manager", country: "Dubai, UAE", industry: "Tourism", type: "Full-time" }
        ].map((job, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/10 cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-gold-primary/20 flex items-center justify-center">
                <Building2 className="text-gold-primary w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold">{job.title}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {job.country}</span>
                  <span className="flex items-center gap-1"><Briefcase size={14} /> {job.industry}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-6">
              <span className="text-gold-primary font-medium">{job.type}</span>
              <Button size="sm">Apply Now</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSlider />
      <StatsSection />
      
      <section className="section-padding">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <SectionHeader 
              subtitle="The Bridge to Your Future"
              title="Empowering Ghanaian Talent on the Global Stage"
            />
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              At Princess Travel Consult, we believe that talent knows no borders. As a registered Ghanaian company, we specialize in identifying high-potential professionals and connecting them with life-changing career opportunities abroad.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                "Certified International Recruitment Experts",
                "Direct Partnerships with Global Employers",
                "End-to-End Relocation & Visa Support",
                "Ethical & Transparent Sourcing Processes"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-gold-primary w-5 h-5" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <Button size="lg">Our Story</Button>
          </div>
          <div className="lg:w-1/2 relative min-h-[500px] flex items-center justify-center">
            <React.Suspense fallback={<div className="w-64 h-64 rounded-full border-2 border-gold-primary/20 animate-pulse" />}>
              <FutureBridge3D />
            </React.Suspense>
          </div>
        </div>
      </section>

      <ServicesSection />
      <JobsSection />

      {/* CTA Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="gold-gradient p-12 md:p-20 rounded-[2rem] text-deep-black text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Globe className="w-[800px] h-[800px] absolute -top-1/2 -left-1/4" />
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 relative z-10">Ready to Start Your Global Journey?</h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto font-medium relative z-10">
              Whether you are a job seeker looking for overseas opportunities or an employer seeking top-tier talent, we are your best partner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button variant="secondary" size="lg" className="bg-deep-black text-white hover:bg-deep-black/90">Apply as Candidate</Button>
              <Button variant="outline" size="lg" className="border-deep-black text-deep-black hover:bg-deep-black hover:text-white">Hire Global Talent</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
