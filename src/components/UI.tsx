import { motion, HTMLMotionProps } from "motion/react";
import { LucideIcon } from "lucide-react";
import React from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "gold-gradient text-deep-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]",
    secondary: "bg-white text-deep-black hover:bg-white/90",
    outline: "border-2 border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-deep-black",
    ghost: "text-white hover:bg-white/10"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-10 py-4 text-lg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
      {Icon && <Icon className="ml-2 w-5 h-5" />}
    </motion.button>
  );
};

export const SectionHeader = ({ 
  title, 
  subtitle, 
  centered = false 
}: { 
  title: string; 
  subtitle?: string; 
  centered?: boolean 
}) => (
  <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
    <motion.span 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-gold-primary uppercase tracking-[0.2em] text-sm font-bold mb-4 block"
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-4xl md:text-5xl lg:text-6xl font-display leading-tight"
    >
      {title}
    </motion.h2>
  </div>
);

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "" 
}) => (
  <motion.div
    whileHover={{ y: -10 }}
    className={`glass-card p-8 transition-all duration-500 hover:border-gold-primary/30 ${className}`}
  >
    {children}
  </motion.div>
);
