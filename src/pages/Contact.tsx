import React from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { Button, SectionHeader, GlassCard } from '../components/UI';

export default function Contact() {
  return (
    <div className="pt-32 min-h-screen">
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            subtitle="Get In Touch"
            title="We're Here to Help Your Journey"
          />
          
          <div className="grid lg:grid-cols-3 gap-12 mb-20">
            <GlassCard className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold-primary/10 flex items-center justify-center mx-auto mb-6">
                <Phone className="text-gold-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Call Us</h3>
              <p className="text-white/50 mb-2">+233 55 479 4957</p>
              <p className="text-white/50">(WhatsApp Available)</p>
            </GlassCard>

            <GlassCard className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold-primary/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="text-gold-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Email Us</h3>
              <p className="text-white/50 mb-2">info@princesstravel.com</p>
              <p className="text-white/50">recruitment@princesstravel.com</p>
            </GlassCard>

            <GlassCard className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold-primary/10 flex items-center justify-center mx-auto mb-6">
                <MapPin className="text-gold-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Location</h3>
              <p className="text-white/50 mb-2">Accra, Ghana</p>
              <p className="text-white/50">Online Support Available 24/7</p>
            </GlassCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div className="glass-card p-8 md:p-12">
              <h3 className="text-3xl font-display font-bold mb-8">Send Us a Message</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Full Name</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold-primary transition-colors" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Email Address</label>
                    <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold-primary transition-colors" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Subject</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold-primary transition-colors appearance-none">
                    <option className="bg-charcoal">Job Inquiry</option>
                    <option className="bg-charcoal">Recruitment Partnership</option>
                    <option className="bg-charcoal">Travel Advisory</option>
                    <option className="bg-charcoal">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Message</label>
                  <textarea rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold-primary transition-colors" placeholder="How can we help you?"></textarea>
                </div>
                <Button className="w-full" icon={Send}>Send Message</Button>
              </form>
            </div>

            <div className="flex flex-col justify-between">
              <div className="glass-card p-8 mb-8">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="text-gold-primary" /> Office Hours
                </h4>
                <div className="space-y-3 text-white/60">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-white">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-white">10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-white">Closed</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 bg-gold-primary/10 border-gold-primary/20">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="text-gold-primary" /> Live Chat
                </h4>
                <p className="text-white/60 mb-6 leading-relaxed">
                  Need an immediate answer? Our team is available on WhatsApp for quick inquiries and support.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-deep-black"
                  onClick={() => window.open('https://wa.me/233554794957', '_blank')}
                >
                  Chat on WhatsApp
                </Button>
              </div>

              <div className="rounded-2xl overflow-hidden h-64 mt-8 grayscale hover:grayscale-0 transition-all duration-500 border border-white/10">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127066.2533513364!2d-0.25912035!3d5.5912087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0xbed14ed8650e2dd3!2sAccra%2C%20Ghana!5e0!3m2!1sen!2sus!4v1710320000000!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
