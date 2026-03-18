import { z } from 'zod';

export const widgetSchema = z.object({
  id: z.string(),
  label: z.string(),
  snippet: z.string(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  markdown: z.string().default(''),
  widgets: z.array(widgetSchema).default([]),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  markdown: z.string().optional(),
  widgets: z.array(widgetSchema).optional(),
});

export const createVersionSchema = z.object({
  label: z.string().min(2).max(100),
  markdown: z.string().min(1),
  widgets: z.array(widgetSchema).default([]),
});

export const deployTemplateSchema = z.object({
  token: z.string().min(10),
  owner: z.string().min(1),
  repo: z.string().min(1),
  path: z.string().default('README.md'),
  commitMessage: z.string().default('chore: update profile README via GitBio'),
});
