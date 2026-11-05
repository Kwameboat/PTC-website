import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, MapPin, Briefcase, Building2, Filter, ArrowRight } from 'lucide-react';
import { Button, SectionHeader } from '../components/UI';
import { useJobs, postedAgo } from '../lib/jobs';

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const { jobs, loading } = useJobs();

  const term = searchTerm.trim().toLowerCase();
  const filteredJobs = jobs.filter((job) =>
    [job.title, job.country, job.industry, job.job_type].some((v) => (v ?? '').toLowerCase().includes(term)),
  );

  return (
    <div className="pt-24 sm:pt-32 min-h-screen">
      <section className="px-5 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            subtitle="Career Portal"
            title="Global Opportunities Await"
          />

          {/* Search & Filter Bar */}
          <div className="glass-card p-3 sm:p-4 mb-8 sm:mb-12 flex flex-col md:flex-row gap-3 sm:gap-4">
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
            <div className="flex gap-3 sm:gap-4">
              <button className="shrink-0 px-5 sm:px-6 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
                <Filter size={18} /> Filters
              </button>
              <Button className="flex-1 md:flex-none whitespace-nowrap">Search Jobs</Button>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid gap-4 sm:gap-6">
            {filteredJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-white/10 transition-all group cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
                  <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gold-primary/10 flex items-center justify-center group-hover:bg-gold-primary/20 transition-colors">
                    <Building2 className="text-gold-primary w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/50">
                      <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gold-primary" /> {job.country}</span>
                      <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-gold-primary" /> {job.industry}</span>
                      {job.job_type && <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-white/70 tracking-wider uppercase">{job.job_type}</span>}
                    </div>
                    {job.description && <p className="text-white/50 text-sm mt-3 max-w-2xl line-clamp-2">{job.description}</p>}
                    {job.deadline && <p className="text-xs text-white/30 mt-2 uppercase tracking-widest">Apply by {job.deadline}</p>}
                  </div>
                </div>
                
                <div className="mt-5 lg:mt-0 flex items-center justify-between lg:justify-end gap-4 sm:gap-12 border-t lg:border-t-0 border-white/5 pt-5 lg:pt-0">
                  <div className="text-left lg:text-right">
                    <p className="text-lg sm:text-xl font-bold text-gold-primary whitespace-nowrap">{job.salary}</p>
                    <p className="text-xs text-white/30 uppercase tracking-widest mt-1">Posted {postedAgo(job.created_at)}</p>
                  </div>
                  <Link to="/contact"><Button icon={ArrowRight} className="whitespace-nowrap px-5! sm:px-8!">Apply Now</Button></Link>
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <div className="text-center py-20 glass-card text-white/40">Loading openings…</div>
            )}

            {!loading && jobs.length === 0 && (
              <div className="text-center py-20 glass-card">
                <p className="text-white/50 text-lg">No openings right now. Check back soon, or send us your CV.</p>
              </div>
            )}

            {!loading && jobs.length > 0 && filteredJobs.length === 0 && (
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
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">Can't Find Your Dream Job?</h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                Our database is constantly updated with new opportunities. Upload your CV and our recruitment experts will reach out when a matching role becomes available.
              </p>
              <Button variant="outline" size="lg">Upload Your CV</Button>
            </div>
            <div className="glass-card p-8 sm:p-12 text-center border-dashed border-2 border-gold-primary/30">
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
