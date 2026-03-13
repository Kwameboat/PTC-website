import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Briefcase, 
  Users, 
  FileText, 
  Settings,
  Plus,
  Trash2,
  Save,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Button } from './components/UI';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hero');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, activeTab]);

  const fetchData = async () => {
    try {
      const resHero = await fetch('/api/content/hero');
      if (resHero.ok) setHeroSlides(await resHero.json());
      
      const resJobs = await fetch('/api/content/jobs');
      if (resJobs.ok) setJobs(await resJobs.json());
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError(data.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-black p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-deep-black font-bold text-2xl">P</span>
            </div>
            <h1 className="text-2xl font-display font-bold">Admin Portal</h1>
            <p className="text-white/50 text-sm mt-2">Princess Travel Consult CMS</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold-primary font-bold mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold-primary outline-none transition-colors"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold-primary font-bold mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold-primary outline-none transition-colors"
                placeholder="Enter password"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 gold-gradient rounded flex items-center justify-center">
            <span className="text-deep-black font-bold">P</span>
          </div>
          <span className="font-display font-bold">CMS ADMIN</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'hero', label: 'Hero Slider', icon: ImageIcon },
            { id: 'jobs', label: 'Job Listings', icon: Briefcase },
            { id: 'applications', label: 'Applications', icon: Users },
            { id: 'blog', label: 'Blog Posts', icon: FileText },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-gold-primary text-deep-black font-bold' : 'text-white/50 hover:bg-white/5'}`}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              onClick={() => navigate('/enhance-logo')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gold-primary hover:bg-gold-primary/10 transition-all"
            >
              <Sparkles size={18} />
              <span className="text-sm font-bold">Logo Enhancer</span>
            </button>
          </div>
        </nav>

        <button 
          onClick={() => setIsLoggedIn(false)}
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all mt-auto"
        >
          <LogOut size={18} />
          <span className="text-sm">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-display font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-white/50 text-sm">Manage your website content here.</p>
          </div>
          <Button icon={Plus} size="sm">Add New</Button>
        </header>

        <div className="glass-card overflow-hidden">
          {activeTab === 'hero' && (
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/50">
                <tr>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">CTA Text</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {heroSlides.map((slide) => (
                  <tr key={slide.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-gold-primary">{slide.order_index}</td>
                    <td className="px-6 py-4 font-medium">{slide.title}</td>
                    <td className="px-6 py-4 text-white/50">{slide.cta_text}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:text-gold-primary transition-colors"><Save size={16} /></button>
                        <button className="p-2 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'jobs' && (
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/50">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{job.title}</td>
                    <td className="px-6 py-4 text-white/50">{job.country}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-[10px] font-bold uppercase">{job.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:text-gold-primary transition-colors"><Save size={16} /></button>
                        <button className="p-2 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(activeTab === 'applications' || activeTab === 'blog' || activeTab === 'settings') && (
            <div className="p-20 text-center text-white/30">
              <p>Content management for {activeTab} is coming soon in the next update.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
