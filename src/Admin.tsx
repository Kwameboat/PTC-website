import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Image as ImageIcon,
  Briefcase,
  Settings,
  Plus,
  Trash2,
  Pencil,
  LogOut,
  Sparkles,
  Inbox,
  MessageCircle,
  X,
  ExternalLink,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Button } from './components/UI';
import { useNavigate } from 'react-router-dom';

// ---------------------------------------------------------------------------
// API helper: adds the admin token; a 401 means the session expired.
// ---------------------------------------------------------------------------

type AdminFetch = (url: string, init?: RequestInit) => Promise<Response>;

const errorMessage = async (res: Response, fallback: string) => {
  const data = await res.json().catch(() => ({}));
  return data.message || fallback;
};

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold-primary outline-none transition-colors';
const labelClass = 'block text-xs uppercase tracking-widest text-gold-primary font-bold mb-2';

// ---------------------------------------------------------------------------
// Editable content types
// ---------------------------------------------------------------------------

type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'url';

interface Field {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  hint?: string;
  wide?: boolean;
}

interface ResourceConfig {
  resource: 'jobs' | 'hero-slides';
  singular: string;
  empty: string;
  fields: Field[];
  defaults: Record<string, string | number>;
}

const JOBS: ResourceConfig = {
  resource: 'jobs',
  singular: 'job',
  empty: 'No jobs yet. Click "Add New" to post your first opening.',
  defaults: { status: 'open', job_type: 'Full-time' },
  fields: [
    { key: 'title', label: 'Job title', required: true, placeholder: 'Registered Nurse', wide: true },
    { key: 'country', label: 'Country / city', placeholder: 'United Kingdom' },
    { key: 'industry', label: 'Industry', placeholder: 'Healthcare' },
    { key: 'job_type', label: 'Job type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'] },
    { key: 'salary', label: 'Salary', placeholder: '£35k - £45k' },
    { key: 'deadline', label: 'Application deadline', placeholder: '31 December 2026' },
    { key: 'status', label: 'Status', type: 'select', options: ['open', 'closed'], hint: 'Closed jobs are hidden from the website.' },
    { key: 'description', label: 'Description', type: 'textarea', wide: true, placeholder: 'What the role involves…' },
    { key: 'requirements', label: 'Requirements', type: 'textarea', wide: true, placeholder: 'Qualifications, experience, languages…' },
  ],
};

const SLIDES: ResourceConfig = {
  resource: 'hero-slides',
  singular: 'slide',
  empty: 'No slides yet. The home page hero is empty until you add one.',
  defaults: { order_index: 1, cta_link: '/contact' },
  fields: [
    { key: 'title', label: 'Headline', required: true, placeholder: 'Global Talent, Global Reach', wide: true, hint: 'Every second word is shown in gold.' },
    { key: 'subtitle', label: 'Text under the headline', type: 'textarea', wide: true },
    { key: 'video_url', label: 'Background video URL (.mp4)', type: 'url', wide: true, placeholder: 'https://…/video.mp4' },
    { key: 'cta_text', label: 'Button text', placeholder: 'Apply Now' },
    { key: 'cta_link', label: 'Button link', placeholder: '/contact' },
    { key: 'order_index', label: 'Order', type: 'number', hint: 'Lower numbers show first.' },
  ],
};

// ---------------------------------------------------------------------------
// Add / edit form (modal)
// ---------------------------------------------------------------------------

const EditorModal = ({
  config,
  item,
  onClose,
  onSaved,
  adminFetch,
}: {
  config: ResourceConfig;
  item: any | null; // null = new
  onClose: () => void;
  onSaved: (row: any) => void;
  adminFetch: AdminFetch;
}) => {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const base: Record<string, any> = { ...config.defaults };
    for (const f of config.fields) base[f.key] = item?.[f.key] ?? base[f.key] ?? '';
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const url = item ? `/api/admin/${config.resource}/${item.id}` : `/api/admin/${config.resource}`;
    const res = await adminFetch(url, {
      method: item ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) onSaved(await res.json());
    else setError(await errorMessage(res, 'Could not save. Please try again.'));
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.form
        onSubmit={submit}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-charcoal border border-white/10 w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        role="dialog"
        aria-label={`${item ? 'Edit' : 'Add'} ${config.singular}`}
      >
        <div className="sticky top-0 bg-charcoal flex items-center justify-between px-5 sm:px-8 py-5 border-b border-white/5">
          <h3 className="text-xl font-display font-bold capitalize">
            {item ? 'Edit' : 'Add'} {config.singular}
          </h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 sm:px-8 py-6 grid sm:grid-cols-2 gap-5">
          {config.fields.map((f) => (
            <div key={f.key} className={f.wide || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <label className={labelClass} htmlFor={`f-${f.key}`}>
                {f.label} {f.required && <span className="text-red-400">*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  id={`f-${f.key}`}
                  rows={4}
                  className={inputClass}
                  value={values[f.key] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              ) : f.type === 'select' ? (
                <select
                  id={`f-${f.key}`}
                  className={`${inputClass} capitalize`}
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                >
                  {f.options!.map((o) => (
                    <option key={o} value={o} className="bg-charcoal">{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={`f-${f.key}`}
                  type={f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text'}
                  required={f.required}
                  className={inputClass}
                  value={values[f.key] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              )}
              {f.hint && <p className="text-xs text-white/40 mt-1.5">{f.hint}</p>}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-charcoal px-5 sm:px-8 py-4 border-t border-white/5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
          {error && <p className="text-red-400 text-sm sm:mr-auto">{error}</p>}
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : item ? 'Save changes' : `Add ${config.singular}`}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// List screens
// ---------------------------------------------------------------------------

const useResource = (resource: string, adminFetch: AdminFetch) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch(`/api/admin/${resource}`);
    if (res.ok) {
      setRows(await res.json());
      setError('');
    } else if (res.status !== 401) {
      setError(await errorMessage(res, 'Could not load. Please refresh.'));
    }
    setLoading(false);
  }, [resource, adminFetch]);
  useEffect(() => {
    load();
  }, [load]);
  return { rows, setRows, loading, error, reload: load };
};

const RowActions = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => (
  <div className="flex gap-1">
    <button onClick={onEdit} className="p-2.5 rounded-lg hover:bg-white/10 hover:text-gold-primary transition-colors" aria-label="Edit">
      <Pencil size={16} />
    </button>
    <button onClick={onDelete} className="p-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors" aria-label="Delete">
      <Trash2 size={16} />
    </button>
  </div>
);

const StateMessage = ({ loading, error, empty, count }: { loading: boolean; error: string; empty: string; count: number }) => {
  if (loading && !count) return <p className="p-16 text-center text-white/40 flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Loading…</p>;
  if (error) return <p className="p-16 text-center text-red-400">{error}</p>;
  if (!count) return <p className="p-16 text-center text-white/40">{empty}</p>;
  return null;
};

const useDelete = (config: ResourceConfig, adminFetch: AdminFetch, setRows: React.Dispatch<React.SetStateAction<any[]>>) =>
  async (row: any) => {
    if (!window.confirm(`Delete this ${config.singular}?\n\n"${row.title}"\n\nThis cannot be undone.`)) return;
    const res = await adminFetch(`/api/admin/${config.resource}/${row.id}`, { method: 'DELETE' });
    if (res.ok || res.status === 404) setRows((list) => list.filter((r) => r.id !== row.id));
    else window.alert(await errorMessage(res, 'Could not delete.'));
  };

const JobsTab = ({ adminFetch, editor }: { adminFetch: AdminFetch; editor: EditorControl }) => {
  const { rows, setRows, loading, error } = useResource('jobs', adminFetch);
  const remove = useDelete(JOBS, adminFetch, setRows);
  editor.register(JOBS, (saved) =>
    setRows((list) => (list.some((r) => r.id === saved.id) ? list.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...list])),
  );

  const toggleStatus = async (job: any) => {
    const status = job.status === 'open' ? 'closed' : 'open';
    const res = await adminFetch(`/api/admin/jobs/${job.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const saved = await res.json();
      setRows((list) => list.map((r) => (r.id === saved.id ? saved : r)));
    }
  };

  return (
    <>
      <StateMessage loading={loading} error={error} empty={JOBS.empty} count={rows.length} />
      {rows.length > 0 && (
        <table className="w-full min-w-[680px] text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/50">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Salary</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((job) => (
              <tr key={job.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium">{job.title}</p>
                  <p className="text-xs text-white/40">{[job.industry, job.job_type].filter(Boolean).join(' · ')}</p>
                </td>
                <td className="px-6 py-4 text-white/60">{job.country}</td>
                <td className="px-6 py-4 text-white/60 whitespace-nowrap">{job.salary}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleStatus(job)}
                    title={job.status === 'open' ? 'Click to close (hide from website)' : 'Click to reopen'}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${job.status === 'open' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                  >
                    {job.status === 'open' ? 'Open' : 'Closed'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <RowActions onEdit={() => editor.open(JOBS, job)} onDelete={() => remove(job)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

const SlidesTab = ({ adminFetch, editor }: { adminFetch: AdminFetch; editor: EditorControl }) => {
  const { rows, setRows, loading, error } = useResource('hero-slides', adminFetch);
  const remove = useDelete(SLIDES, adminFetch, setRows);
  const sortSlides = (list: any[]) => [...list].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0) || a.id - b.id);
  editor.register(SLIDES, (saved) =>
    setRows((list) => sortSlides(list.some((r) => r.id === saved.id) ? list.map((r) => (r.id === saved.id ? saved : r)) : [...list, saved])),
  );

  return (
    <>
      <StateMessage loading={loading} error={error} empty={SLIDES.empty} count={rows.length} />
      {rows.length > 0 && (
        <table className="w-full min-w-[680px] text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/50">
            <tr>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Headline</th>
              <th className="px-6 py-4">Button</th>
              <th className="px-6 py-4">Video</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((slide) => (
              <tr key={slide.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-gold-primary">{slide.order_index}</td>
                <td className="px-6 py-4">
                  <p className="font-medium">{slide.title}</p>
                  <p className="text-xs text-white/40 line-clamp-1 max-w-sm">{slide.subtitle}</p>
                </td>
                <td className="px-6 py-4 text-white/60 text-sm">
                  {slide.cta_text} <span className="text-white/30">→ {slide.cta_link}</span>
                </td>
                <td className="px-6 py-4">
                  {slide.video_url ? (
                    <a href={slide.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gold-primary text-sm hover:underline">
                      View <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-white/30 text-sm">None</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <RowActions onEdit={() => editor.open(SLIDES, slide)} onDelete={() => remove(slide)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

const InquiriesTab = ({ adminFetch }: { adminFetch: AdminFetch }) => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [waStats, setWaStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [resInq, resWa] = await Promise.all([adminFetch('/api/admin/inquiries'), adminFetch('/api/admin/whatsapp-stats')]);
      if (resInq.ok) setInquiries(await resInq.json());
      if (resWa.ok) setWaStats(await resWa.json());
      setLoading(false);
    })();
  }, [adminFetch]);

  const updateStatus = async (id: number, status: string) => {
    const res = await adminFetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setInquiries((list) => list.map((q) => (q.id === id ? { ...q, status } : q)));
  };

  const remove = async (q: any) => {
    if (!window.confirm(`Delete the message from ${q.name}?\n\nThis cannot be undone.`)) return;
    const res = await adminFetch(`/api/admin/inquiries/${q.id}`, { method: 'DELETE' });
    if (res.ok || res.status === 404) setInquiries((list) => list.filter((x) => x.id !== q.id));
  };

  return (
    <div>
      {waStats && (
        <div className="grid sm:grid-cols-3 gap-px bg-white/5 border-b border-white/5">
          {[
            { label: 'WhatsApp taps (7 days)', value: waStats.last_7_days },
            { label: 'WhatsApp taps (30 days)', value: waStats.last_30_days },
            { label: 'WhatsApp taps (all time)', value: waStats.total },
          ].map((s) => (
            <div key={s.label} className="bg-deep-black p-6 flex items-center gap-4">
              <MessageCircle className="text-[#25D366]" size={22} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs uppercase tracking-widest text-white/40">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <StateMessage loading={loading} error="" empty="No inquiries yet. Messages from the Contact page will appear here." count={inquiries.length} />
      {inquiries.length > 0 && (
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/50">
            <tr>
              <th className="px-6 py-4">Received</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Message</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4"><span className="sr-only">Delete</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {inquiries.map((q) => (
              <tr key={q.id} className="hover:bg-white/5 transition-colors align-top">
                <td className="px-6 py-4 text-white/50 text-sm whitespace-nowrap">{new Date(q.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <p className="font-medium">{q.name}</p>
                  {q.email && <a href={`mailto:${q.email}`} className="block text-gold-primary hover:underline">{q.email}</a>}
                  {q.phone && <a href={`tel:${q.phone}`} className="block text-white/50">{q.phone}</a>}
                </td>
                <td className="px-6 py-4 text-sm max-w-md">
                  <p className="text-xs uppercase tracking-widest text-gold-primary mb-1">{q.subject}</p>
                  <p className="text-white/70 whitespace-pre-line">{q.message}</p>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={q.status}
                    onChange={(e) => updateStatus(q.id, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm capitalize"
                  >
                    {['new', 'contacted', 'qualified', 'won', 'lost'].map((st) => (
                      <option key={st} value={st} className="bg-charcoal">{st}</option>
                    ))}
                  </select>
                  {q.crm_synced_at && <p className="text-[10px] text-white/30 mt-1">Sent to CRM</p>}
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => remove(q)} className="p-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors" aria-label="Delete inquiry">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const SettingsTab = ({ adminFetch, username, onAccountChanged }: { adminFetch: AdminFetch; username: string; onAccountChanged: (u: string, token: string) => void }) => {
  const [form, setForm] = useState({ currentPassword: '', newUsername: username, newPassword: '', confirm: '' });
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle');
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirm) return setError('The two new passwords do not match.');
    setStatus('saving');
    const res = await adminFetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword, newUsername: form.newUsername }),
    });
    if (res.ok) {
      const data = await res.json();
      onAccountChanged(data.username, data.token);
      setForm({ currentPassword: '', newUsername: data.username, newPassword: '', confirm: '' });
      setStatus('done');
    } else {
      setStatus('idle');
      setError(await errorMessage(res, 'Could not update your login.'));
    }
  };

  return (
    <form onSubmit={submit} className="p-5 sm:p-8 max-w-xl space-y-5">
      <div>
        <h3 className="text-xl font-display font-bold">Admin login</h3>
        <p className="text-white/50 text-sm mt-1">Change the username and password used to sign in here.</p>
      </div>
      <div>
        <label className={labelClass} htmlFor="s-user">Username</label>
        <input id="s-user" className={inputClass} value={form.newUsername} onChange={set('newUsername')} autoComplete="username" />
      </div>
      <div>
        <label className={labelClass} htmlFor="s-new">New password</label>
        <input id="s-new" type="password" required minLength={10} className={inputClass} value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" />
        <p className="text-xs text-white/40 mt-1.5">At least 10 characters.</p>
      </div>
      <div>
        <label className={labelClass} htmlFor="s-confirm">Repeat new password</label>
        <input id="s-confirm" type="password" required className={inputClass} value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
      </div>
      <div className="pt-2 border-t border-white/5">
        <label className={`${labelClass} mt-4`} htmlFor="s-current">Current password</label>
        <input id="s-current" type="password" required className={inputClass} value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {status === 'done' && (
        <p className="text-green-400 text-sm flex items-center gap-2"><CheckCircle size={16} /> Saved. Use your new login next time you sign in.</p>
      )}
      <Button type="submit" disabled={status === 'saving'}>{status === 'saving' ? 'Saving…' : 'Update login'}</Button>
    </form>
  );
};

// Lets a list tab tell the page which form "Add New" should open and how to apply a saved row.
interface EditorControl {
  open: (config: ResourceConfig, item: any | null) => void;
  register: (config: ResourceConfig, onSaved: (row: any) => void) => void;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'hero', label: 'Hero Slider', icon: ImageIcon, subtitle: 'The rotating banner at the top of the home page.' },
  { id: 'jobs', label: 'Job Listings', icon: Briefcase, subtitle: 'Openings shown on the Jobs page and the home page.' },
  { id: 'inquiries', label: 'Inquiries', icon: Inbox, subtitle: 'Messages from the Contact page and WhatsApp activity.' },
  { id: 'settings', label: 'Settings', icon: Settings, subtitle: 'Your admin account.' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!sessionStorage.getItem('adminToken'));
  const [adminName, setAdminName] = useState(() => sessionStorage.getItem('adminUser') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<{ config: ResourceConfig; item: any | null } | null>(null);
  const [savedHandlers] = useState(() => new Map<string, (row: any) => void>());

  const signOut = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  }, []);

  const adminFetch = useCallback<AdminFetch>(
    async (url, init = {}) => {
      const res = await fetch(url, {
        ...init,
        headers: { Authorization: `Bearer ${sessionStorage.getItem('adminToken') ?? ''}`, ...(init.headers || {}) },
      });
      if (res.status === 401) {
        signOut();
        setError('Your session expired. Please sign in again.');
      }
      return res;
    },
    [signOut],
  );

  const editor: EditorControl = {
    open: (config, item) => setEditing({ config, item }),
    register: (config, onSaved) => savedHandlers.set(config.resource, onSaved),
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({ success: false, message: 'Server unavailable' }));
    if (data.success) {
      sessionStorage.setItem('adminToken', data.token);
      sessionStorage.setItem('adminUser', username);
      setAdminName(username);
      setPassword('');
      setIsLoggedIn(true);
      setError('');
    } else {
      setError(data.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-black p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 sm:p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/logo-mark-160.png" alt="" className="w-16 h-16 rounded-full mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold">Admin Portal</h1>
            <p className="text-white/50 text-sm mt-2">Princess Travel Consult CMS</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className={labelClass} htmlFor="login-user">Username</label>
              <input id="login-user" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} placeholder="Enter username" />
            </div>
            <div>
              <label className={labelClass} htmlFor="login-pass">Password</label>
              <input id="login-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Enter password" />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </motion.div>
      </div>
    );
  }

  const tab = TABS.find((t) => t.id === activeTab)!;
  const addConfig = activeTab === 'jobs' ? JOBS : activeTab === 'hero' ? SLIDES : null;

  return (
    <div className="min-h-screen bg-deep-black flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 md:shrink-0 border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-6 flex flex-col md:sticky md:top-0 md:h-screen bg-deep-black">
        <div className="flex items-center justify-between md:justify-start gap-3 mb-4 md:mb-10">
          <div className="flex items-center gap-3">
            <img src="/logo-mark-160.png" alt="" className="w-8 h-8 rounded-full" />
            <span className="font-display font-bold">CMS ADMIN</span>
          </div>
          <button onClick={signOut} className="md:hidden flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-xl text-sm">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Phones: a scrollable row of tabs. Desktop: the sidebar list. */}
        <nav className="flex md:flex-col md:flex-1 gap-2 md:gap-0 md:space-y-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1 md:pb-0">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl whitespace-nowrap transition-all ${activeTab === item.id ? 'bg-gold-primary text-deep-black font-bold' : 'text-white/50 hover:bg-white/5'}`}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}

          <div className="shrink-0 md:pt-4 md:mt-4 md:border-t border-white/5">
            <button
              onClick={() => navigate('/enhance-logo')}
              className="md:w-full flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl whitespace-nowrap text-gold-primary hover:bg-gold-primary/10 transition-all"
            >
              <Sparkles size={18} />
              <span className="text-sm font-bold">Logo Enhancer</span>
            </button>
          </div>
        </nav>

        <div className="hidden md:block mt-auto pt-4 border-t border-white/5">
          {adminName && <p className="px-4 pb-2 text-xs text-white/30">Signed in as {adminName}</p>}
          <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10">
        <header className="flex flex-wrap gap-4 justify-between items-start sm:items-center mb-6 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">{tab.label}</h2>
            <p className="text-white/50 text-sm">{tab.subtitle}</p>
          </div>
          <div className="flex gap-3">
            {(activeTab === 'jobs' || activeTab === 'hero') && (
              <a href={activeTab === 'jobs' ? '/jobs' : '/'} target="_blank" rel="noreferrer">
                <Button variant="ghost" size="sm" icon={ExternalLink}>View on site</Button>
              </a>
            )}
            {addConfig && (
              <Button icon={Plus} size="sm" onClick={() => editor.open(addConfig, null)}>Add New</Button>
            )}
          </div>
        </header>

        <div className="glass-card overflow-x-auto">
          {activeTab === 'hero' && <SlidesTab adminFetch={adminFetch} editor={editor} />}
          {activeTab === 'jobs' && <JobsTab adminFetch={adminFetch} editor={editor} />}
          {activeTab === 'inquiries' && <InquiriesTab adminFetch={adminFetch} />}
          {activeTab === 'settings' && (
            <SettingsTab
              adminFetch={adminFetch}
              username={adminName}
              onAccountChanged={(u, token) => {
                sessionStorage.setItem('adminToken', token);
                sessionStorage.setItem('adminUser', u);
                setAdminName(u);
              }}
            />
          )}
        </div>
      </main>

      {editing && (
          <EditorModal
            key={`${editing.config.resource}-${editing.item?.id ?? 'new'}`}
            config={editing.config}
            item={editing.item}
            adminFetch={adminFetch}
            onClose={() => setEditing(null)}
            onSaved={(row) => {
              savedHandlers.get(editing.config.resource)?.(row);
              setEditing(null);
            }}
          />
        )}
    </div>
  );
};

export default AdminPanel;
