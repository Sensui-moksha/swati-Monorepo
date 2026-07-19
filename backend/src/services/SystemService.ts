import os from "os";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { settingRepository } from "../repositories/SettingRepository";
import { ApiError } from "../middleware/errorHandler";

export class SystemService {
  async getAppInfo() {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    try {
      const raw = await fs.readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(raw);
      return {
        name: pkg.name || "app",
        version: pkg.version || "0.0.0",
        description: pkg.description || "",
      };
    } catch (err) {
      return { name: "app", version: "0.0.0", description: "" };
    }
  }

  async getHealth() {
    const dbState = mongoose.connection.readyState; // 0 disconnected,1 connected
    const mem = process.memoryUsage();
    const load = os.loadavg();
    return {
      uptime: process.uptime(),
      env: process.env.NODE_ENV || "development",
      db: { state: dbState },
      memory: mem,
      load,
    };
  }

  async getDatabaseStats() {
    const adminDb = (mongoose.connection.db as any) || null;
    if (!adminDb) {
      throw ApiError.internal("Database connection not available");
    }

    try {
      const stats =
        typeof adminDb.stats === "function" ? await adminDb.stats() : {};
      const collections =
        typeof adminDb.listCollections === "function"
          ? await adminDb.listCollections().toArray()
          : [];
      const collStats = await Promise.all(
        collections.map(async (c: any) => {
          try {
            const coll = adminDb.collection(c.name) as any;
            const s =
              typeof coll.stats === "function" ? await coll.stats() : {};
            return {
              name: c.name,
              size: s.size ?? null,
              count: s.count ?? null,
            };
          } catch (e) {
            return { name: c.name, error: String(e) };
          }
        }),
      );
      return { stats, collections: collStats };
    } catch (err) {
      throw ApiError.internal("Database stats unavailable");
    }
  }

  async listSettings() {
    const res = await settingRepository.find();
    return res;
  }

  async getSetting(key: string) {
    const s = await settingRepository.findByKey(key);
    if (!s) {
      throw ApiError.notFound("Setting not found");
    }
    return s;
  }

  async upsertSetting(key: string, value: any, meta: any = {}) {
    const updated = await settingRepository.upsertByKey(key, value, meta);
    return updated;
  }

  async testEmail() {
    // Placeholder: reuse existing email provider if present
    // Look up mailer util if exists
    // For now respond with ok but marked as not-implemented
    return {
      success: false,
      message: "Test email not implemented on this environment",
    };
  }
}

export const systemService = new SystemService();
