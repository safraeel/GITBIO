import { useMemo, useState } from 'react';
import { ArrowUpRight, Plus, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

type Template = {
  id: string;
  name: string;
  category: 'Open Source' | 'Career' | 'Personal Brand' | 'Business';
  updatedAt: string;
  likes: number;
  views: number;
};

const templates: Template[] = [
  { id: '1', name: 'Minimal Developer', category: 'Career', updatedAt: '2h ago', likes: 84, views: 1210 },
  { id: '2', name: 'Open Source Hero', category: 'Open Source', updatedAt: '1d ago', likes: 203, views: 5520 },
  { id: '3', name: 'Startup Founder', category: 'Business', updatedAt: '3d ago', likes: 131, views: 3190 },
  { id: '4', name: 'Creative Dev', category: 'Personal Brand', updatedAt: '6d ago', likes: 97, views: 2421 },
];

const categories = ['All', 'Open Source', 'Career', 'Personal Brand', 'Business'] as const;

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('All');

  const filtered = useMemo(() => {
    return templates.filter((template) => {
      const matchName = template.name.toLowerCase().includes(query.toLowerCase());
      const matchCategory = category === 'All' || template.category === category;
      return matchName && matchCategory;
    });
  }, [query, category]);

  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="glass-card mb-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                <Sparkles className="h-3.5 w-3.5" />
                Workspace
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900">Template Dashboard</h1>
              <p className="text-slate-600">Manage, search, and deploy your GitBio README templates.</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/editor"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <Plus className="h-4 w-4" />
                Create Template
              </Link>
            </div>
          </div>
        </header>

        <section className="glass-card mb-6 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <label className="relative md:col-span-7">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates by name"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-400"
              />
            </label>
            <div className="md:col-span-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
              </span>
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    category === item
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => (
            <article key={template.id} className="glass-card p-5">
              <div className="mb-4 rounded-xl bg-gradient-to-br from-cyan-100 via-white to-orange-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{template.category}</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{template.name}</h3>
              </div>
              <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-white p-2">
                  <p className="text-xs text-slate-500">Likes</p>
                  <p className="font-bold text-slate-900">{template.likes}</p>
                </div>
                <div className="rounded-lg bg-white p-2">
                  <p className="text-xs text-slate-500">Views</p>
                  <p className="font-bold text-slate-900">{template.views}</p>
                </div>
                <div className="rounded-lg bg-white p-2">
                  <p className="text-xs text-slate-500">Updated</p>
                  <p className="font-bold text-slate-900">{template.updatedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/editor"
                  className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Edit
                </Link>
                <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300">
                  Deploy
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}

          <Link
            to="/editor"
            className="glass-card flex min-h-[240px] flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 p-5 text-center hover:border-cyan-400"
          >
            <span className="rounded-full bg-cyan-100 p-3 text-cyan-700">
              <Plus className="h-6 w-6" />
            </span>
            <h3 className="text-xl font-bold text-slate-900">Create New Template</h3>
            <p className="text-slate-600">Start from blank or use marketplace presets.</p>
          </Link>
        </section>
      </div>
    </div>
  );
}
