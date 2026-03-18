import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS'
}

export interface IUser extends Document {
  githubId: string;
  email: string;
  name: string;
  avatar: string;
  subscriptionTier: SubscriptionTier;
  stripeCustomerId?: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  githubId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String },
  subscriptionTier: { 
    type: String, 
    enum: Object.values(SubscriptionTier), 
    default: SubscriptionTier.FREE 
  },
  stripeCustomerId: { type: String },
  settings: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);
