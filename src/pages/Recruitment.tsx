import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Users, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button, SectionHeader, GlassCard } from '../components/UI';

export default function Recruitment() {
  return (
    <div className="pt-32 min-h-screen">
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            subtitle="Global Talent Sourcing"
            title="International Recruitment Services"
          />
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Princess Travel Consult is your premier partner for international recruitment. We specialize in connecting Ghanaian professionals with top-tier employers across the globe. Our rigorous selection process ensures that we only present the most qualified candidates to our partners.
              </p>
              <div className="space-y-6">
                {[
                  { title: "Healthcare Recruitment", desc: "Placing nurses, doctors, and healthcare assistants in leading hospitals worldwide." },
                  { title: "Tech & Engineering", desc: "Connecting software developers, engineers, and IT specialists with global tech hubs." },
                  { title: "Hospitality & Tourism", desc: "Sourcing talent for world-class hotels, resorts, and cruise lines." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="text-gold-primary w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                      <p className="text-white/50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800" 
                alt="Recruitment" 
                className="rounded-[2rem] shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -left-10 glass-card p-8 max-w-xs">
                <Award className="text-gold-primary w-12 h-12 mb-4" />
                <h4 className="text-2xl font-bold mb-2">Certified Agency</h4>
                <p className="text-white/50 text-sm">Recognized by international labor organizations for ethical recruitment practices.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Candidate Sourcing", desc: "We maintain a vast database of pre-screened, high-potential professionals across various industries." },
              { icon: Briefcase, title: "Employer Branding", desc: "We help global employers build their brand in the Ghanaian market to attract top talent." },
              { icon: Award, title: "Skill Assessment", desc: "Our comprehensive testing and interview process ensures candidates meet international standards." }
            ].map((feature, i) => (
              <GlassCard key={i}>
                <feature.icon className="text-gold-primary w-12 h-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-charcoal/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Ready to Hire Ghanaian Talent?</h2>
          <p className="text-white/60 text-xl max-w-2xl mx-auto mb-12">
            Partner with us to access a pool of skilled, motivated, and culturally adaptable professionals ready to contribute to your organization's success.
          </p>
          <Button size="lg" icon={ArrowRight}>Partner With Us</Button>
        </div>
      </section>
    </div>
  );
}
