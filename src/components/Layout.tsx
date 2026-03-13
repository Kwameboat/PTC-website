import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Clock, Users } from 'lucide-react';
import { Button } from './UI';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-deep-black/80 backdrop-blur-md py-4' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex flex-col group">
          <span className="text-xl font-display font-bold tracking-tighter leading-none group-hover:text-gold-primary transition-colors">PRINCESS</span>
          <span className="text-xs font-bold tracking-[0.3em] text-gold-primary leading-none shimmer-text">TRAVEL CONSULT</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
          <Link to="/" className="hover:text-gold-primary transition-colors">Home</Link>
          <Link to="/recruitment" className="hover:text-gold-primary transition-colors">Recruitment</Link>
          <Link to="/travel" className="hover:text-gold-primary transition-colors">Travel</Link>
          <Link to="/jobs" className="hover:text-gold-primary transition-colors">Jobs</Link>
          <Link to="/about" className="hover:text-gold-primary transition-colors">About</Link>
        </div>

        <Link to="/contact">
          <Button size="sm">Contact Us</Button>
        </Link>
      </div>
    </nav>
  );
};

export const Footer = () => (
  <footer className="bg-deep-black pt-20 pb-10 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-2">
          <Link to="/" className="flex flex-col mb-6 group">
            <span className="text-xl font-display font-bold tracking-tighter leading-none group-hover:text-gold-primary transition-colors">PRINCESS</span>
            <span className="text-xs font-bold tracking-[0.3em] text-gold-primary leading-none shimmer-text">TRAVEL CONSULT</span>
          </Link>
          <p className="text-white/50 max-w-md leading-relaxed mb-8">
            Your best partner in international recruitment. We bridge the gap between Ghanaian talent and global opportunities with integrity and excellence.
          </p>
          <div className="flex gap-4">
            {['FB', 'TW', 'IG', 'LI'].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold-primary hover:text-deep-black transition-all cursor-pointer text-xs font-bold">
                {i}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-gold-primary">Quick Links</h4>
          <ul className="space-y-4 text-white/50 text-sm">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/recruitment" className="hover:text-white transition-colors">Recruitment Services</Link></li>
            <li><Link to="/travel" className="hover:text-white transition-colors">Travel Advisory</Link></li>
            <li><Link to="/jobs" className="hover:text-white transition-colors">Job Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-gold-primary">Contact</h4>
          <ul className="space-y-4 text-white/50 text-sm">
            <li className="flex items-center gap-3"><Clock size={18} className="text-gold-primary shrink-0" /> Mon - Fri: 9am - 5pm</li>
            <li className="flex items-center gap-3"><Users size={18} className="text-gold-primary shrink-0" /> info@princesstravel.com</li>
            <li className="flex items-center gap-3"><span className="text-gold-primary font-bold">Tel/WhatsApp:</span> +233 55 479 4957</li>
          </ul>
        </div>
      </div>
      
      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30 uppercase tracking-widest">
        <p>© 2026 Princess Travel Consult. All Rights Reserved.</p>
        <div className="flex gap-8">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
      <Footer />
      
      {/* Floating CTA */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg text-white"
          onClick={() => window.open('https://wa.me/233554794957', '_blank')}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </motion.button>
      </div>
    </div>
  );
};
