import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string; // e.g. 'admin', 'subscriber', 'editor', 'guest'
  permissions: string[]; // e.g. ['read:publications', 'write:publications', 'manage:users']
  description?: string;
  isSystem: boolean; // Prevent deletion of core roles
}

const roleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true, index: true },
  permissions: [{ type: String }],
  description: { type: String },
  isSystem: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Role = mongoose.model<IRole>('Role', roleSchema);
