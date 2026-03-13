import React from 'react';
import { Award, Users, ShieldCheck, Globe, CheckCircle2 } from 'lucide-react';
import { SectionHeader, GlassCard } from '../components/UI';

export default function About() {
  return (
    <div className="pt-32 min-h-screen">
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            subtitle="Our Story"
            title="Bridging the Gap Between Talent & Opportunity"
          />
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <p className="text-white/60 text-lg leading-relaxed mb-6">
                Princess Travel Consult was founded with a clear mission: to empower Ghanaian professionals by connecting them with life-changing career opportunities on the global stage. We recognized the immense talent within our borders and the growing demand for skilled labor worldwide.
              </p>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                As a registered Ghanaian company, we have built a reputation for integrity, transparency, and excellence. We don't just find jobs; we build careers and facilitate seamless global mobility.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-4xl font-display font-bold text-gold-primary mb-2">10+</h4>
                  <p className="text-white/40 uppercase tracking-widest text-xs">Years Experience</p>
                </div>
                <div>
                  <h4 className="text-4xl font-display font-bold text-gold-primary mb-2">500+</h4>
                  <p className="text-white/40 uppercase tracking-widest text-xs">Successful Placements</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                alt="Our Team" 
                className="rounded-[2rem] shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -top-10 -right-10 w-40 h-40 gold-gradient rounded-full flex items-center justify-center p-4 text-center">
                <span className="text-deep-black font-bold leading-tight">Accra's Most Trusted Agency</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              { icon: ShieldCheck, title: "Our Mission", desc: "To provide ethical, transparent, and efficient recruitment and travel services that transform lives." },
              { icon: Globe, title: "Our Vision", desc: "To be the leading bridge between African talent and the global workforce, recognized for excellence." },
              { icon: Award, title: "Our Values", desc: "Integrity, Excellence, Transparency, and Candidate-First approach in everything we do." }
            ].map((item, i) => (
              <GlassCard key={i}>
                <item.icon className="text-gold-primary w-12 h-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>

          <div className="bg-charcoal/50 rounded-[2rem] p-12 md:p-20">
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">Why Choose Us?</h3>
            <div className="grid md:grid-cols-2 gap-12">
              {[
                { title: "Expert Knowledge", desc: "Our team has deep expertise in international labor laws, visa requirements, and recruitment trends." },
                { title: "Direct Partnerships", desc: "We work directly with employers, cutting out middlemen and ensuring better terms for candidates." },
                { title: "Comprehensive Support", desc: "From CV optimization to post-arrival orientation, we support you through the entire journey." },
                { title: "Ethical Practices", desc: "We adhere to strict ethical guidelines, ensuring fair treatment for both candidates and employers." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-gold-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-gold-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
