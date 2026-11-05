import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { openWhatsApp } from '../lib/whatsapp';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Users, Menu, X, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from './UI';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/recruitment', label: 'Recruitment' },
  { to: '/travel', label: 'Travel' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/about', label: 'About' },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the menu when the page changes, and stop the page scrolling behind it.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <>
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${solid ? 'bg-deep-black/90 backdrop-blur-md py-3 lg:py-4' : 'bg-transparent py-4 sm:py-6 lg:py-8'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0" aria-label="Princess Travel Consult home">
          <img src="/logo-mark-160.png" alt="" width={48} height={48} className={`shrink-0 rounded-full shadow-lg shadow-gold-primary/10 transition-all duration-500 ${solid ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-12 sm:h-12'}`} />
          <span className="flex flex-col min-w-0">
            <span className="text-lg sm:text-xl font-display font-bold tracking-tighter leading-none group-hover:text-gold-primary transition-colors">PRINCESS</span>
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] text-gold-primary leading-none shimmer-text whitespace-nowrap">TRAVEL CONSULT</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `transition-colors hover:text-gold-primary ${isActive ? 'text-gold-primary' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/contact" className="hidden sm:block">
            <Button size="sm">Contact Us</Button>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="lg:hidden w-11 h-11 rounded-full border border-white/15 flex items-center justify-center hover:border-gold-primary hover:text-gold-primary transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

    </nav>

      {/* Phone / tablet menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-40 bg-deep-black pt-[4.25rem] overflow-y-auto overscroll-contain"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col min-h-full">
              <ul className="flex flex-col">
                {NAV_LINKS.map((l, i) => (
                  <motion.li
                    key={l.to}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <NavLink
                      to={l.to}
                      end={l.to === '/'}
                      className={({ isActive }) => `flex items-center justify-between py-4 border-b border-white/5 text-2xl sm:text-3xl font-display font-bold ${isActive ? 'text-gold-primary' : 'text-white'}`}
                    >
                      {l.label}
                      <ArrowRight size={20} className="text-white/30" />
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 grid sm:grid-cols-2 gap-3 pb-8">
                <Link to="/contact" className="block">
                  <Button className="w-full">Contact Us</Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  icon={MessageCircle}
                  onClick={() => openWhatsApp('mobile_menu')}
                >
                  WhatsApp Us
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const Footer = () => (
  <footer className="bg-deep-black pt-16 md:pt-20 pb-28 md:pb-10 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-5 sm:px-6">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-14 md:mb-20">
        <div className="sm:col-span-2">
          <Link to="/" className="flex items-center gap-4 mb-6 group" aria-label="Princess Travel Consult home">
            <img src="/logo-mark-160.png" alt="" width={64} height={64} className="w-16 h-16 rounded-full" />
            <span className="flex flex-col">
            <span className="text-xl font-display font-bold tracking-tighter leading-none group-hover:text-gold-primary transition-colors">PRINCESS</span>
            <span className="text-xs font-bold tracking-[0.3em] text-gold-primary leading-none shimmer-text">TRAVEL CONSULT</span>
            </span>
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
          <ul className="space-y-1 text-white/50 text-sm">
            <li><Link to="/about" className="inline-block py-2 hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/recruitment" className="inline-block py-2 hover:text-white transition-colors">Recruitment Services</Link></li>
            <li><Link to="/travel" className="inline-block py-2 hover:text-white transition-colors">Travel Advisory</Link></li>
            <li><Link to="/jobs" className="inline-block py-2 hover:text-white transition-colors">Job Portal</Link></li>
            <li><Link to="/contact" className="inline-block py-2 hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-gold-primary">Contact</h4>
          <ul className="space-y-4 text-white/50 text-sm">
            <li className="flex items-center gap-3"><Clock size={18} className="text-gold-primary shrink-0" /> Mon - Fri: 9am - 5pm</li>
            <li className="flex items-center gap-3"><Users size={18} className="text-gold-primary shrink-0" /> <a href="mailto:info@princesstravel.com" className="inline-block py-2 break-all hover:text-white transition-colors">info@princesstravel.com</a></li>
            <li className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="text-gold-primary font-bold">Tel/WhatsApp:</span> <a href="tel:+233554794957" className="inline-block py-2 whitespace-nowrap hover:text-white transition-colors">+233 55 479 4957</a></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 md:pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30 uppercase tracking-widest text-center md:text-left">
        <p>© 2026 Princess Travel Consult. All Rights Reserved.</p>
        <div className="flex gap-6 sm:gap-8">
          <a href="#" className="py-2">Privacy Policy</a>
          <a href="#" className="py-2">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
      <Footer />
      
      {/* Floating CTA */}
      <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 sm:right-6 md:bottom-8 md:right-8 z-30 flex flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg text-white"
          onClick={() => openWhatsApp('floating_button')}
          aria-label="Chat with us on WhatsApp"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </motion.button>
      </div>
    </div>
  );
};
