import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  resource?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, index: true },
  resource: { type: String },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Audit logs are immutable, no updates
  capped: { size: 1024 * 1024 * 500, max: 5000000 } // 500MB capped collection to prevent unbounded growth
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
