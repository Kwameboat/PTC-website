import React from 'react';
import { Plane, ShieldCheck, MapPin, Globe, ArrowRight } from 'lucide-react';
import { Button, SectionHeader, GlassCard } from '../components/UI';

export default function Travel() {
  return (
    <div className="pt-32 min-h-screen">
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            subtitle="Seamless Journeys"
            title="Global Mobility & Travel Advisory"
          />
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&q=80&w=800" 
                alt="Travel Advisory" 
                className="rounded-[2rem] shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Moving to a new country is a life-changing event. At Princess Travel Consult, we provide end-to-end support to ensure your transition is as smooth as possible. From visa processing to local orientation, we are with you every step of the way.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: ShieldCheck, title: "Visa Assistance", desc: "Expert guidance on work permits and residency visas." },
                  { icon: Plane, title: "Flight Booking", desc: "Competitive rates and flexible travel arrangements." },
                  { icon: MapPin, title: "Local Orientation", desc: "Helping you settle into your new home and culture." },
                  { icon: Globe, title: "Travel Insurance", desc: "Comprehensive coverage for your peace of mind." }
                ].map((item, i) => (
                  <div key={i} className="glass-card p-6">
                    <item.icon className="text-gold-primary w-8 h-8 mb-4" />
                    <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                    <p className="text-white/50 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gold-primary/5 rounded-[2rem] p-12 md:p-20">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">Our Relocation Process</h3>
              <div className="space-y-8 text-left mt-12">
                {[
                  { step: "01", title: "Initial Consultation", desc: "We assess your needs and provide a customized relocation plan." },
                  { step: "02", title: "Documentation", desc: "We assist in gathering and verifying all necessary legal documents." },
                  { step: "03", title: "Visa Processing", desc: "Our experts handle the application process with the relevant embassies." },
                  { step: "04", title: "Pre-Departure Briefing", desc: "We prepare you for the cultural and practical aspects of your destination." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <span className="text-4xl font-display font-bold text-gold-primary/20">{item.step}</span>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-white/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Need Travel Advice?</h2>
          <p className="text-white/60 text-xl max-w-2xl mx-auto mb-12">
            Whether you're traveling for work, study, or leisure, our experts are ready to help you navigate the complexities of international travel.
          </p>
          <Button size="lg" icon={ArrowRight}>Book a Consultation</Button>
        </div>
      </section>
    </div>
  );
}
