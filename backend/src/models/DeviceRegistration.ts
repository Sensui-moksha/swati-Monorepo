import mongoose, { Schema, Document } from "mongoose";

export interface IDeviceRegistration extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  deviceType: "mobile" | "tablet" | "desktop" | "e-reader" | "other";
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  registeredAt: Date;
  lastActiveAt: Date;
  deauthorizedAt?: Date;
}

const DeviceRegistrationSchema = new Schema<IDeviceRegistration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deviceId: { type: String, required: true },
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop", "e-reader", "other"],
      default: "desktop",
    },
    deviceName: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    registeredAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    deauthorizedAt: { type: Date },
  },
  { timestamps: true }
);

DeviceRegistrationSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
DeviceRegistrationSchema.index({ userId: 1, isActive: 1 });

export const DeviceRegistration = mongoose.model<IDeviceRegistration>(
  "DeviceRegistration",
  DeviceRegistrationSchema
);
