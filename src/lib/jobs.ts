import { useEffect, useState } from 'react';

export interface Job {
  id: number;
  title: string;
  country: string | null;
  industry: string | null;
  job_type: string | null;
  salary: string | null;
  description: string | null;
  requirements: string | null;
  deadline: string | null;
  created_at: string;
}

/** Open jobs from the CMS, newest first. */
export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fetch('/api/content/jobs')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => alive && setJobs(Array.isArray(data) ? data : []))
      .catch(() => alive && setJobs([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);
  return { jobs, loading };
}

/** "today", "1 day ago", "3 days ago", "2 weeks ago"… */
export function postedAgo(iso: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (days === 0) return 'today';
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}
