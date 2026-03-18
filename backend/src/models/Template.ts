import mongoose, { Document, Schema } from 'mongoose';

export interface IWidget {
  id: string;
  type: string;
  position: { x: number; y: number; w: number; h: number };
  settings: Record<string, any>;
}

export interface ITemplate extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  isPublic: boolean;
  isPremium: boolean;
  thumbnail?: string;
  content: {
    markdown: string;
    json: Record<string, any>;
  };
  widgets: IWidget[];
  stats: {
    views: number;
    downloads: number;
    likes: number;
  };
  versions: {
    label: string;
    markdown: string;
    widgets: Array<{ id: string; label: string; snippet: string }>;
    azureBlobUrl?: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const WidgetSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
  },
  settings: { type: Schema.Types.Mixed, default: {} }
});

const VersionSchema = new Schema(
  {
    label: { type: String, required: true },
    markdown: { type: String, required: true },
    widgets: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        snippet: { type: String, required: true },
      },
    ],
    azureBlobUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const TemplateSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  name: { type: String, required: true },
  description: { type: String },
  isPublic: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  thumbnail: { type: String },
  content: {
    markdown: { type: String, default: '' },
    json: { type: Schema.Types.Mixed, default: {} }
  },
  widgets: [WidgetSchema],
  stats: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  },
  versions: [VersionSchema],
}, {
  timestamps: true
});

export const Template = mongoose.model<ITemplate>('Template', TemplateSchema);
