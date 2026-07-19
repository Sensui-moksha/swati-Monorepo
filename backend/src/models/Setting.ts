import { Schema, model, Document } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: any;
  type: "string" | "number" | "boolean" | "json";
  description?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "json"],
      default: "string",
    },
    description: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

export const Setting = model<ISetting>("Setting", SettingSchema);

export default Setting;
