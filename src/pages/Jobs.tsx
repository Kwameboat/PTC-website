import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Briefcase, Building2, Filter, ArrowRight } from 'lucide-react';
import { Button, SectionHeader } from '../components/UI';

const JOBS = [
  { id: 1, title: "Senior Software Engineer", country: "Germany", industry: "Tech", type: "Full-time", salary: "€70k - €90k", posted: "2 days ago" },
  { id: 2, title: "Registered Nurse", country: "United Kingdom", industry: "Healthcare", type: "Contract", salary: "£35k - £45k", posted: "1 week ago" },
  { id: 3, title: "Hospitality Manager", country: "Dubai, UAE", industry: "Tourism", type: "Full-time", salary: "$4k - $6k /mo", posted: "3 days ago" },
  { id: 4, title: "Civil Engineer", country: "Canada", industry: "Construction", type: "Full-time", salary: "$80k - $100k", posted: "5 days ago" },
  { id: 5, title: "Customer Service Lead", country: "Poland", industry: "Business", type: "Full-time", salary: "6k - 8k PLN", posted: "1 day ago" },
  { id: 6, title: "Data Analyst", country: "Netherlands", industry: "Tech", type: "Full-time", salary: "€50k - €65k", posted: "4 days ago" },
];

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = JOBS.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-32 min-h-screen">
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            subtitle="Career Portal"
            title="Global Opportunities Await"
          />

          {/* Search & Filter Bar */}
          <div className="glass-card p-4 mb-12 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by role, country, or industry..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-gold-primary transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
                <Filter size={18} /> Filters
              </button>
              <Button>Search Jobs</Button>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid gap-6">
            {filteredJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-white/10 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gold-primary/10 flex items-center justify-center group-hover:bg-gold-primary/20 transition-colors">
                    <Building2 className="text-gold-primary w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gold-primary" /> {job.country}</span>
                      <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-gold-primary" /> {job.industry}</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-white/70 tracking-wider uppercase">{job.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 lg:mt-0 flex items-center justify-between lg:justify-end gap-12 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                  <div className="text-right">
                    <p className="text-xl font-bold text-gold-primary">{job.salary}</p>
                    <p className="text-xs text-white/30 uppercase tracking-widest mt-1">Posted {job.posted}</p>
                  </div>
                  <Button icon={ArrowRight}>Apply Now</Button>
                </div>
              </motion.div>
            ))}
            
            {filteredJobs.length === 0 && (
              <div className="text-center py-20 glass-card">
                <p className="text-white/50 text-lg">No jobs found matching your search criteria.</p>
                <button onClick={() => setSearchTerm('')} className="text-gold-primary font-bold mt-4 hover:underline">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-padding bg-charcoal/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold mb-6">Can't Find Your Dream Job?</h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                Our database is constantly updated with new opportunities. Upload your CV and our recruitment experts will reach out when a matching role becomes available.
              </p>
              <Button variant="outline" size="lg">Upload Your CV</Button>
            </div>
            <div className="glass-card p-12 text-center border-dashed border-2 border-gold-primary/30">
              <div className="w-20 h-20 rounded-full bg-gold-primary/10 flex items-center justify-center mx-auto mb-6">
                <Briefcase className="text-gold-primary w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Talent Pool</h3>
              <p className="text-white/50 mb-8">Join our exclusive network of professionals and get priority access to global openings.</p>
              <Button className="w-full">Join Talent Pool</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
