import { ArrowRight, Github, Sparkles, Wand2 } from 'lucide-react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import { ThemeToggle } from './components/ThemeToggle';

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-slate-900">
          <Github className="h-7 w-7 text-cyan-600" />
          <span className="text-2xl font-extrabold tracking-tight">GitBio</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
          <a href="#features" className="hover:text-slate-900">Features</a>
          <a href="#pricing" className="hover:text-slate-900">Pricing</a>
          <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/editor"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Try Editor
          </Link>
        </div>
      </div>
    </header>
  );
}

function Landing() {
  const pills = ['One-click GitHub deploy', 'Live markdown preview', 'Template marketplace'];

  return (
    <main className="relative overflow-hidden px-4 pb-20 pt-12 md:px-6 md:pt-16">
      <div className="pointer-events-none absolute -left-24 top-12 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-28 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1 text-sm font-semibold text-cyan-700">
            <Sparkles className="h-4 w-4" />
            Build a profile people remember
          </p>
          <h1 className="mb-5 text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
            Turn your GitHub README into a
            <span className="bg-gradient-to-r from-cyan-600 to-orange-500 bg-clip-text text-transparent"> conversion machine</span>
          </h1>
          <p className="mb-8 max-w-xl text-lg text-slate-600">
            Craft a standout developer brand with drag and drop widgets, live data, and polished templates built for recruiters, open source, and founders.
          </p>

          <div className="mb-8 flex flex-wrap gap-3">
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
            >
              Start Building
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Open Dashboard
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            {pills.map((pill) => (
              <span key={pill} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Preview: Open Source Hero</p>
              <p className="text-xs text-slate-500">Template score: 98/100</p>
            </div>
            <Wand2 className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl bg-slate-900 p-3 text-white">
              <p className="font-semibold">Hi, I am Safraeel</p>
              <p className="text-slate-200">Building reliable software, one merge at a time.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Total Stars</p>
                <p className="text-xl font-bold text-slate-900">1,248</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Merged PRs</p>
                <p className="text-xl font-bold text-slate-900">379</p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50 p-3 text-orange-700">
              Drag widgets in Editor to re-order this layout.
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto mt-16 max-w-7xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              title: '10 Widget Types',
              desc: 'Stats, contributions, languages, badges, RSS, Spotify, and more.',
            },
            {
              title: 'Live Rendering',
              desc: 'Preview the exact markdown output before deployment.',
            },
            {
              title: 'Team Ready',
              desc: 'Manage profile templates across members and projects.',
            },
          ].map((item) => (
            <article key={item.title} className="glass-card p-5">
              <h3 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto mt-16 max-w-7xl">
        <div className="glass-card p-6 md:p-8">
          <h2 className="mb-6 text-3xl font-extrabold text-slate-900">Pricing</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { name: 'Free', price: '$0', blurb: '3 templates, basic widgets' },
              { name: 'Pro', price: '$9', blurb: 'Unlimited templates, full widgets' },
              { name: 'Business', price: '$29', blurb: 'Team seats, analytics, API access' },
            ].map((plan) => (
              <div key={plan.name} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-500">{plan.name}</p>
                <p className="my-2 text-3xl font-extrabold text-slate-900">{plan.price}<span className="text-base font-medium text-slate-500">/mo</span></p>
                <p className="text-sm text-slate-600">{plan.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <Landing />
              </>
            }
          />
          <Route path="/editor" element={<Editor />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
