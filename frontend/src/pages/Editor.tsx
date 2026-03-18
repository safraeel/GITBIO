import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DragEvent, KeyboardEvent } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  CloudUpload,
  Copy,
  Github,
  GripVertical,
  History,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { OnboardingTour } from '../components/OnboardingTour';
import { ThemeToggle } from '../components/ThemeToggle';

type Widget = {
  id: string;
  label: string;
  snippet: string;
};

type VersionEntry = {
  _id: string;
  label: string;
  markdown: string;
  createdAt: string;
  azureBlobUrl?: string;
};

type DeployForm = {
  token: string;
  owner: string;
  repo: string;
  path: string;
  commitMessage: string;
};

const STORAGE_KEY = 'gitbio_editor_state_v3';
const ONBOARDING_KEY = 'gitbio_editor_onboarding_done';
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api';

const catalog: Widget[] = [
  {
    id: 'stats',
    label: 'GitHub Stats',
    snippet: '![GitHub stats](https://github-readme-stats.vercel.app/api?username=YOUR_USERNAME&show_icons=true&theme=transparent)',
  },
  {
    id: 'streak',
    label: 'Streak Counter',
    snippet: '![GitHub Streak](https://streak-stats.demolab.com?user=YOUR_USERNAME&theme=transparent)',
  },
  {
    id: 'langs',
    label: 'Top Languages',
    snippet: '![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=YOUR_USERNAME&layout=compact)',
  },
  {
    id: 'views',
    label: 'Profile Views',
    snippet: '![Profile Views](https://komarev.com/ghpvc/?username=YOUR_USERNAME&style=flat-square)',
  },
  {
    id: 'social',
    label: 'Social Links',
    snippet: '[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/YOUR_USERNAME)',
  },
];

const initialMarkdown = `# Hey, I am YOUR_NAME

## About Me
- I build high-quality apps.
- I enjoy open-source and mentoring.

## Widgets
Add widgets from the right panel.`;

const tourSteps = [
  {
    title: 'Welcome to GitBio Editor',
    description: 'This workspace lets you build your README live with drag-order widgets and instant markdown rendering.',
  },
  {
    title: 'Create Restore Points',
    description: 'Use Save Version to snapshot your template. You can restore any version from history.',
  },
  {
    title: 'Deploy to GitHub',
    description: 'Fill owner/repo/token and click Deploy. GitBio sends markdown to backend and updates README.md automatically.',
  },
];

function getInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        githubUsername: 'YOUR_USERNAME',
        markdown: initialMarkdown,
        activeWidgets: catalog.slice(0, 3),
        savedAt: 'Not saved yet',
        templateName: 'My Premium Profile',
        templateId: '',
      };
    }

    const parsed = JSON.parse(raw) as {
      githubUsername?: string;
      markdown?: string;
      activeWidgetIds?: string[];
      templateName?: string;
      templateId?: string;
    };

    const reordered = (parsed.activeWidgetIds || [])
      .map((id) => catalog.find((widget) => widget.id === id))
      .filter((widget): widget is Widget => Boolean(widget));

    return {
      githubUsername: parsed.githubUsername || 'YOUR_USERNAME',
      markdown: parsed.markdown || initialMarkdown,
      activeWidgets: reordered.length > 0 ? reordered : catalog.slice(0, 3),
      savedAt: 'Draft restored',
      templateName: parsed.templateName || 'My Premium Profile',
      templateId: parsed.templateId || '',
    };
  } catch {
    return {
      githubUsername: 'YOUR_USERNAME',
      markdown: initialMarkdown,
      activeWidgets: catalog.slice(0, 3),
      savedAt: 'Could not restore draft',
      templateName: 'My Premium Profile',
      templateId: '',
    };
  }
}

export default function Editor() {
  const initial = useMemo(() => getInitialState(), []);
  const [githubUsername, setGithubUsername] = useState(initial.githubUsername);
  const [markdown, setMarkdown] = useState(initial.markdown);
  const [activeWidgets, setActiveWidgets] = useState<Widget[]>(initial.activeWidgets);
  const [savedAt, setSavedAt] = useState(initial.savedAt);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState(initial.templateName);
  const [templateId, setTemplateId] = useState(initial.templateId);
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [deployStatus, setDeployStatus] = useState('');
  const [tourOpen, setTourOpen] = useState(() => localStorage.getItem(ONBOARDING_KEY) !== '1');
  const [tourStep, setTourStep] = useState(1);

  const [deployForm, setDeployForm] = useState<DeployForm>({
    token: '',
    owner: '',
    repo: '',
    path: 'README.md',
    commitMessage: 'chore: update profile README via GitBio',
  });

  const persist = useCallback(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        githubUsername,
        markdown,
        activeWidgetIds: activeWidgets.map((widget) => widget.id),
        templateName,
        templateId,
      }),
    );
    setSavedAt(`Saved at ${new Date().toLocaleTimeString()}`);
  }, [githubUsername, markdown, activeWidgets, templateName, templateId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      persist();
    }, 600);

    return () => clearTimeout(timer);
  }, [persist]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const isSave = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
      if (!isSave) {
        return;
      }

      event.preventDefault();
      persist();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [persist]);

  const compiledMarkdown = useMemo(() => {
    return markdown.replaceAll('YOUR_USERNAME', githubUsername);
  }, [markdown, githubUsername]);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('gitbio_auth_token');
    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const ensureTemplate = useCallback(async (): Promise<string> => {
    if (templateId) {
      await axios.put(
        `${API_BASE}/templates/${templateId}`,
        {
          name: templateName,
          markdown: compiledMarkdown,
          widgets: activeWidgets,
        },
        { headers: authHeaders },
      );
      return templateId;
    }

    const created = await axios.post(
      `${API_BASE}/templates`,
      {
        name: templateName,
        markdown: compiledMarkdown,
        widgets: activeWidgets,
      },
      { headers: authHeaders },
    );

    const createdId = created.data.data._id as string;
    setTemplateId(createdId);
    return createdId;
  }, [templateId, templateName, compiledMarkdown, activeWidgets, authHeaders]);

  const fetchVersions = useCallback(
    async (id: string) => {
      const response = await axios.get(`${API_BASE}/templates/${id}/versions`, { headers: authHeaders });
      return response.data.data as VersionEntry[];
    },
    [authHeaders],
  );

  useEffect(() => {
    if (!templateId) {
      return;
    }

    let active = true;

    const run = async () => {
      try {
        const data = await fetchVersions(templateId);
        if (active) {
          setVersions(data);
        }
      } catch {
        if (active) {
          setDeployStatus('Could not load version history.');
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [templateId, fetchVersions]);

  const addWidgetSnippet = (widget: Widget) => {
    setMarkdown((prev) => `${prev}\n\n${widget.snippet}`);
    if (!activeWidgets.find((item) => item.id === widget.id)) {
      setActiveWidgets((prev) => [...prev, widget]);
    }
  };

  const removeWidget = (id: string) => {
    setActiveWidgets((prev) => prev.filter((widget) => widget.id !== id));
  };

  const onDragStart = (index: number) => {
    setDragIndex(index);
  };

  const onDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }

    setActiveWidgets((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });

    setDragIndex(null);
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(compiledMarkdown);
    setSavedAt('Copied markdown to clipboard');
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    }
  };

  const createRestorePoint = async () => {
    try {
      const id = await ensureTemplate();
      await axios.post(
        `${API_BASE}/templates/${id}/versions`,
        {
          label: `Restore point ${new Date().toLocaleString()}`,
          markdown: compiledMarkdown,
          widgets: activeWidgets,
        },
        { headers: authHeaders },
      );
      const data = await fetchVersions(id);
      setVersions(data);
      setDeployStatus('Restore point created.');
    } catch {
      setDeployStatus('Failed to create restore point. Check backend and auth token.');
    }
  };

  const restoreVersion = async (versionId: string) => {
    if (!templateId) {
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/templates/${templateId}/versions/${versionId}/restore`,
        {},
        { headers: authHeaders },
      );
      const restoredMarkdown = response.data.data.content.markdown as string;
      setMarkdown(restoredMarkdown);
      setDeployStatus('Version restored successfully.');
    } catch {
      setDeployStatus('Failed to restore version.');
    }
  };

  const deployToGitHub = async () => {
    try {
      const id = await ensureTemplate();
      const response = await axios.post(
        `${API_BASE}/templates/${id}/deploy`,
        deployForm,
        { headers: authHeaders },
      );

      setDeployStatus(`Deployed: ${response.data.data.htmlUrl || 'README updated successfully'}`);
    } catch {
      setDeployStatus('Deploy failed. Verify token/repo/path and backend connectivity.');
    }
  };

  const nextTour = () => {
    if (tourStep >= tourSteps.length) {
      localStorage.setItem(ONBOARDING_KEY, '1');
      setTourOpen(false);
      return;
    }

    setTourStep((prev) => prev + 1);
  };

  const closeTour = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setTourOpen(false);
  };

  return (
    <div className="min-h-screen px-4 py-5 md:px-6">
      <OnboardingTour
        open={tourOpen}
        step={tourStep}
        total={tourSteps.length}
        title={tourSteps[tourStep - 1].title}
        description={tourSteps[tourStep - 1].description}
        onNext={nextTour}
        onClose={closeTour}
      />

      <div className="mx-auto max-w-7xl">
        <header className="glass-card mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
            <Github className="h-6 w-6 text-cyan-600" />
            <h1 className="text-2xl font-extrabold text-slate-900">GitBio Editor</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{savedAt}</span>
            <button onClick={persist} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              <Save className="h-4 w-4" />
              Save
            </button>
            <button onClick={copyMarkdown} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
              <Copy className="h-4 w-4" />
              Copy Markdown
            </button>
            <button onClick={createRestorePoint} className="inline-flex items-center gap-2 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
              <History className="h-4 w-4" />
              Save Version
            </button>
            <button onClick={deployToGitHub} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white">
              <CloudUpload className="h-4 w-4" />
              Deploy README
            </button>
            <Link to="/dashboard" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Dashboard</Link>
          </div>
        </header>

        <div className="mb-3 text-sm font-semibold text-slate-700">{deployStatus}</div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="glass-card p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">GitHub Username</p>
            <input
              value={githubUsername}
              onChange={(event) => setGithubUsername(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
              placeholder="your-github-username"
            />
          </label>
          <label className="glass-card p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Template Name</p>
            <input
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              onKeyDown={onTitleKeyDown}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
            />
          </label>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="glass-card p-3 md:col-span-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Repo Owner</p>
            <input value={deployForm.owner} onChange={(e) => setDeployForm((prev) => ({ ...prev, owner: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="glass-card p-3 md:col-span-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Repo Name</p>
            <input value={deployForm.repo} onChange={(e) => setDeployForm((prev) => ({ ...prev, repo: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="glass-card p-3 md:col-span-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Path</p>
            <input value={deployForm.path} onChange={(e) => setDeployForm((prev) => ({ ...prev, path: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="glass-card p-3 md:col-span-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">GitHub Token</p>
            <input type="password" value={deployForm.token} onChange={(e) => setDeployForm((prev) => ({ ...prev, token: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
        </div>

        <main className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <section className="glass-card xl:col-span-7">
            <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Markdown Source</div>
            <textarea
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              className="h-[560px] w-full resize-none rounded-b-2xl bg-white/50 p-4 font-mono text-sm text-slate-800 outline-none"
            />
          </section>

          <section className="space-y-4 xl:col-span-5">
            <article className="glass-card">
              <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Active Widgets (drag to reorder)</div>
              <div className="space-y-2 p-4">
                {activeWidgets.map((widget, index) => (
                  <div
                    key={widget.id}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={onDragOver}
                    onDrop={() => onDrop(index)}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <GripVertical className="h-4 w-4 text-slate-400" />
                      {widget.label}
                    </div>
                    <button onClick={() => removeWidget(widget.id)} className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Widget Catalog</div>
              <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
                {catalog.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => addWidgetSnippet(widget)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    {widget.label}
                  </button>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Version History</div>
              <div className="max-h-48 space-y-2 overflow-auto p-4">
                {versions.length === 0 ? <p className="text-sm text-slate-500">No versions yet. Save your first restore point.</p> : null}
                {versions.map((version) => (
                  <div key={version._id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{version.label}</p>
                      <p className="text-xs text-slate-500">{new Date(version.createdAt).toLocaleString()}</p>
                    </div>
                    <button onClick={() => restoreVersion(version._id)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">Restore</button>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Live Markdown Preview</div>
              <div className="h-[280px] overflow-auto p-4 markdown-prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{compiledMarkdown}</ReactMarkdown>
              </div>
              <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" />Ctrl/Cmd + S triggers manual save.</span>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
