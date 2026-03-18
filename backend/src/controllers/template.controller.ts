import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Template } from '../models/Template';
import {
  createTemplateSchema,
  createVersionSchema,
  deployTemplateSchema,
  updateTemplateSchema,
} from '../validators/template.validator';
import { uploadTemplateVersionToAzure } from '../services/azureBlob.service';
import { deployReadmeToGitHub } from '../services/githubDeploy.service';

type MemoryWidget = { id: string; label: string; snippet: string };
type MemoryVersion = {
  _id: string;
  label: string;
  markdown: string;
  widgets: MemoryWidget[];
  azureBlobUrl?: string;
  createdAt: string;
};
type MemoryTemplate = {
  _id: string;
  name: string;
  description: string;
  isPublic: boolean;
  isPremium: boolean;
  content: { markdown: string; json: Record<string, unknown> };
  widgets: MemoryWidget[];
  stats: { views: number; downloads: number; likes: number };
  versions: MemoryVersion[];
  createdAt: string;
  updatedAt: string;
};

const memoryTemplates = new Map<string, MemoryTemplate>();

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function nowIso() {
  return new Date().toISOString();
}

function toModelWidgets(widgets: MemoryWidget[]) {
  return widgets.map((widget, index) => ({
    id: widget.id,
    type: widget.label,
    position: { x: 0, y: index, w: 12, h: 1 },
    settings: { snippet: widget.snippet },
  }));
}

function toMemoryWidgetsFromModel(template: {
  widgets: Array<{
    id: string;
    type: string;
    settings?: Record<string, unknown>;
  }>;
}) {
  return template.widgets.map((widget) => ({
    id: widget.id,
    label: widget.type,
    snippet: typeof widget.settings?.snippet === 'string' ? widget.settings.snippet : '',
  }));
}

export async function listTemplates(_req: Request, res: Response) {
  if (!isDbConnected()) {
    return res.json({ success: true, data: Array.from(memoryTemplates.values()) });
  }

  const templates = await Template.find({}).sort({ updatedAt: -1 }).limit(100);
  return res.json({ success: true, data: templates });
}

export async function getTemplateById(req: Request, res: Response) {
  if (!isDbConnected()) {
    const template = memoryTemplates.get(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.json({ success: true, data: template });
  }

  const template = await Template.findById(req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  return res.json({ success: true, data: template });
}

export async function createTemplate(req: Request, res: Response) {
  const parsed = createTemplateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, errors: parsed.error.flatten() });
  }

  if (!isDbConnected()) {
    const id = new mongoose.Types.ObjectId().toHexString();
    const createdAt = nowIso();
    const template: MemoryTemplate = {
      _id: id,
      name: parsed.data.name,
      description: parsed.data.description || '',
      isPublic: false,
      isPremium: false,
      content: { markdown: parsed.data.markdown, json: {} },
      widgets: parsed.data.widgets,
      stats: { views: 0, downloads: 0, likes: 0 },
      versions: [],
      createdAt,
      updatedAt: createdAt,
    };
    memoryTemplates.set(id, template);
    return res.status(201).json({ success: true, data: template });
  }

  const template = await Template.create({
    name: parsed.data.name,
    description: parsed.data.description || '',
    content: {
      markdown: parsed.data.markdown,
      json: {},
    },
    widgets: toModelWidgets(parsed.data.widgets),
    isPublic: false,
    isPremium: false,
  });

  return res.status(201).json({ success: true, data: template });
}

export async function updateTemplate(req: Request, res: Response) {
  const parsed = updateTemplateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, errors: parsed.error.flatten() });
  }

  if (!isDbConnected()) {
    const template = memoryTemplates.get(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (parsed.data.name) {
      template.name = parsed.data.name;
    }
    if (typeof parsed.data.description !== 'undefined') {
      template.description = parsed.data.description;
    }
    if (typeof parsed.data.markdown !== 'undefined') {
      template.content.markdown = parsed.data.markdown;
    }
    if (parsed.data.widgets) {
      template.widgets = parsed.data.widgets;
    }

    template.updatedAt = nowIso();
    memoryTemplates.set(template._id, template);
    return res.json({ success: true, data: template });
  }

  const template = await Template.findById(req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  if (parsed.data.name) {
    template.name = parsed.data.name;
  }
  if (typeof parsed.data.description !== 'undefined') {
    template.description = parsed.data.description;
  }
  if (typeof parsed.data.markdown !== 'undefined') {
    template.content.markdown = parsed.data.markdown;
  }
  if (parsed.data.widgets) {
    template.widgets = toModelWidgets(parsed.data.widgets) as never;
  }

  await template.save();
  return res.json({ success: true, data: template });
}

export async function deleteTemplate(req: Request, res: Response) {
  if (!isDbConnected()) {
    const existed = memoryTemplates.delete(req.params.id);
    if (!existed) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.json({ success: true });
  }

  const deleted = await Template.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  return res.json({ success: true });
}

export async function cloneTemplate(req: Request, res: Response) {
  if (!isDbConnected()) {
    const original = memoryTemplates.get(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const id = new mongoose.Types.ObjectId().toHexString();
    const clone: MemoryTemplate = {
      ...original,
      _id: id,
      name: `${original.name} (Clone)`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    memoryTemplates.set(id, clone);
    return res.status(201).json({ success: true, data: clone });
  }

  const original = await Template.findById(req.params.id);
  if (!original) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  const clone = await Template.create({
    name: `${original.name} (Clone)`,
    description: original.description,
    isPublic: false,
    isPremium: original.isPremium,
    thumbnail: original.thumbnail,
    content: original.content,
    widgets: original.widgets,
    versions: original.versions,
  });

  return res.status(201).json({ success: true, data: clone });
}

export async function createTemplateVersion(req: Request, res: Response) {
  const parsed = createVersionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, errors: parsed.error.flatten() });
  }

  const versionId = new mongoose.Types.ObjectId().toHexString();

  if (!isDbConnected()) {
    const template = memoryTemplates.get(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const azureUrl = await uploadTemplateVersionToAzure({
      templateId: template._id,
      versionId,
      markdown: parsed.data.markdown,
      metadata: { label: parsed.data.label },
    });

    const entry: MemoryVersion = {
      _id: versionId,
      label: parsed.data.label,
      markdown: parsed.data.markdown,
      widgets: parsed.data.widgets,
      azureBlobUrl: azureUrl || undefined,
      createdAt: nowIso(),
    };

    template.versions.unshift(entry);
    template.versions = template.versions.slice(0, 50);
    template.updatedAt = nowIso();
    memoryTemplates.set(template._id, template);

    return res.status(201).json({ success: true, data: template.versions });
  }

  const template = await Template.findById(req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  const azureUrl = await uploadTemplateVersionToAzure({
    templateId: String(template._id),
    versionId,
    markdown: parsed.data.markdown,
    metadata: { label: parsed.data.label },
  });

  template.versions.unshift({
    _id: versionId,
    label: parsed.data.label,
    markdown: parsed.data.markdown,
    widgets: parsed.data.widgets,
    azureBlobUrl: azureUrl || undefined,
    createdAt: new Date(),
  } as never);

  template.versions = template.versions.slice(0, 50);
  await template.save();

  return res.status(201).json({ success: true, data: template.versions });
}

export async function listTemplateVersions(req: Request, res: Response) {
  if (!isDbConnected()) {
    const template = memoryTemplates.get(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.json({ success: true, data: template.versions });
  }

  const template = await Template.findById(req.params.id).select('versions');
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  return res.json({ success: true, data: template.versions });
}

export async function restoreTemplateVersion(req: Request, res: Response) {
  if (!isDbConnected()) {
    const template = memoryTemplates.get(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const version = template.versions.find((entry) => entry._id === req.params.versionId);
    if (!version) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    template.content.markdown = version.markdown;
    template.widgets = version.widgets;
    template.updatedAt = nowIso();
    memoryTemplates.set(template._id, template);

    return res.json({ success: true, data: template });
  }

  const template = await Template.findById(req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  const version = template.versions.find(
    (entry) => String((entry as { _id?: mongoose.Types.ObjectId })._id) === req.params.versionId,
  );

  if (!version) {
    return res.status(404).json({ success: false, message: 'Version not found' });
  }

  template.content.markdown = version.markdown;
  template.widgets = toModelWidgets(version.widgets as MemoryWidget[]) as never;
  await template.save();

  return res.json({ success: true, data: template });
}

export async function deployTemplate(req: Request, res: Response) {
  const parsed = deployTemplateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, errors: parsed.error.flatten() });
  }

  if (!isDbConnected()) {
    const template = memoryTemplates.get(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const result = await deployReadmeToGitHub({
      token: parsed.data.token,
      owner: parsed.data.owner,
      repo: parsed.data.repo,
      path: parsed.data.path,
      commitMessage: parsed.data.commitMessage,
      content: template.content.markdown,
    });

    template.stats.downloads += 1;
    template.updatedAt = nowIso();
    memoryTemplates.set(template._id, template);

    return res.json({ success: true, data: result });
  }

  const template = await Template.findById(req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  const result = await deployReadmeToGitHub({
    token: parsed.data.token,
    owner: parsed.data.owner,
    repo: parsed.data.repo,
    path: parsed.data.path,
    commitMessage: parsed.data.commitMessage,
    content: template.content.markdown,
  });

  template.stats.downloads += 1;
  await template.save();

  return res.json({ success: true, data: result });
}
