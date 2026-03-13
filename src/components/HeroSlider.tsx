import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Play, Pause } from 'lucide-react';
import { Button } from './UI';
import { Globe3D } from './Globe3D';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  video_url: string;
  cta_text: string;
  cta_link: string;
}

export const HeroSlider = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/content/hero')
      .then(res => res.json())
      .then(data => setSlides(data));
  }, []);

  useEffect(() => {
    if (isPlaying && slides.length > 0) {
      const interval = 50; // Update progress every 50ms
      const duration = 8000; // 8 seconds per slide
      const step = (interval / duration) * 100;

      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrent((c) => (c + 1) % slides.length);
            return 0;
          }
          return prev + step;
        });
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, slides.length, current]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };
  
  const prev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
    setProgress(0);
  };

  if (slides.length === 0 || !slides[current]) return <div className="h-screen bg-deep-black" />;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-deep-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Parallax Video Background */}
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "linear" }}
            className="absolute inset-0"
          >
            <video
              key={slides[current].video_url}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              src={slides[current].video_url}
            />
          </motion.div>
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-deep-black/80 via-transparent to-deep-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep-black/60 via-transparent to-transparent" />
          
          {/* Content Container */}
          <div className="relative z-20 h-full flex flex-col lg:flex-row items-center justify-center px-6 max-w-7xl mx-auto gap-12">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.15 } }
              }}
              className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1"
            >
              <motion.div
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
                className="flex items-center gap-4 mb-8 bg-gold-primary/10 px-6 py-3 rounded-full border border-gold-primary/20"
              >
                <span className="text-gold-primary uppercase tracking-[0.4em] text-xs md:text-sm font-bold">
                  Princess Travel Consult
                </span>
              </motion.div>
              
              <motion.h1
                variants={{
                  hidden: { y: 40, opacity: 0, filter: "blur(10px)" },
                  visible: { y: 0, opacity: 1, filter: "blur(0px)" }
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 leading-[0.9] tracking-tighter"
              >
                {slides[current].title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 1 ? 'gold-text-gradient' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </motion.h1>
              
              <motion.p
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
                className="text-lg md:text-xl text-white/60 max-w-xl mb-12 font-light leading-relaxed"
              >
                {slides[current].subtitle}
              </motion.p>
              
              <motion.div
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
                className="flex flex-col sm:flex-row gap-6"
              >
                <Button size="lg" icon={ArrowRight} className="min-w-[200px]">
                  {slides[current].cta_text}
                </Button>
                <Button variant="outline" size="lg" className="min-w-[200px] backdrop-blur-md">
                  Recruit Talent
                </Button>
              </motion.div>
            </motion.div>

            {/* 3D Globe Animation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              className="flex-1 w-full h-[400px] lg:h-[600px] relative"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full max-w-[500px] max-h-[500px]">
                  <Globe3D color={
                    ['#d4af37', '#e5e4e2', '#b76e79', '#90e0ef', '#c084fc'][current % 5]
                  } />
                </div>
              </div>
              
              {/* Floating Picture Animations */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 w-32 h-40 rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-20 hidden md:block"
              >
                <img 
                  src={`https://picsum.photos/seed/${slides[current].id + 10}/400/500`} 
                  alt="Travel" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 20, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 left-10 w-24 h-32 rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-20 hidden md:block"
              >
                <img 
                  src={`https://picsum.photos/seed/${slides[current].id + 20}/400/500`} 
                  alt="Destination" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Interactive Navigation & Progress */}
      <div className="absolute bottom-12 left-0 w-full px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 z-30">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold-primary hover:border-gold-primary hover:text-deep-black transition-all group"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </button>
          
          <div className="flex gap-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className="group relative py-4"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold transition-colors ${i === current ? 'text-gold-primary' : 'text-white/30'}`}>
                    0{i + 1}
                  </span>
                  <div className="h-[2px] w-12 md:w-20 bg-white/10 relative overflow-hidden">
                    {i === current && (
                      <motion.div 
                        className="absolute inset-0 bg-gold-primary origin-left"
                        style={{ scaleX: progress / 100 }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gold-primary/0 group-hover:bg-gold-primary/20 transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={prev}
            className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={next}
            className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-deep-black to-transparent z-10" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-deep-black to-transparent z-10" />
      
      {/* Side Indicators */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-12 text-[10px] uppercase tracking-[0.5em] text-white/20 vertical-text rotate-180 z-20">
        <span>International Recruitment</span>
        <span>Global Mobility</span>
      </div>
    </div>
  );
};

