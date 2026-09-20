import { Setting } from "../models/Setting";
import { logger } from "../utils/logger";

export interface FlagEvaluationContext {
  userId?: string;
  role?: string;
  email?: string;
}

export class FeatureFlagService {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();
  private cacheTtlMs = 60 * 1000; // 1 minute local cache

  /**
   * Evaluates a boolean or configured feature flag.
   * Reuses existing Setting model.
   */
  async isEnabled(flagKey: string, context?: FlagEvaluationContext): Promise<boolean> {
    try {
      const rawValue = await this.getFlagValue(flagKey);
      if (rawValue === null || rawValue === undefined) {
        return false;
      }

      // Simple boolean flag
      if (typeof rawValue === "boolean") {
        return rawValue;
      }

      // Complex rule evaluation (percentage, whitelist, roles)
      if (typeof rawValue === "object") {
        if (rawValue.enabled === false) return false;

        // Role restriction check
        if (rawValue.allowedRoles && Array.isArray(rawValue.allowedRoles)) {
          if (!context?.role || !rawValue.allowedRoles.includes(context.role)) {
            return false;
          }
        }

        // Percentage rollout check based on deterministic hash of userId
        if (typeof rawValue.percentage === "number" && context?.userId) {
          const hash = this.simpleHash(`${flagKey}:${context.userId}`);
          const bucket = hash % 100;
          return bucket < rawValue.percentage;
        }

        return !!rawValue.enabled;
      }

      return Boolean(rawValue);
    } catch (error) {
      logger.warn(`Failed to evaluate feature flag "${flagKey}":`, error);
      return false;
    }
  }

  /**
   * Retrieves flag value with in-memory caching.
   */
  async getFlagValue(flagKey: string): Promise<any> {
    const key = `feature:${flagKey}`;
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const doc = await Setting.findOne({ key });
    const value = doc ? doc.value : null;

    this.cache.set(key, { value, expiresAt: Date.now() + this.cacheTtlMs });
    return value;
  }

  /**
   * Enables or configures a feature flag.
   */
  async setFlag(flagKey: string, value: any, description?: string): Promise<void> {
    const key = `feature:${flagKey}`;
    await Setting.findOneAndUpdate(
      { key },
      {
        key,
        value,
        type: typeof value === "object" ? "json" : typeof value === "boolean" ? "boolean" : "string",
        description: description || `Feature flag: ${flagKey}`,
      },
      { upsert: true, new: true }
    );
    this.cache.delete(key);
  }

  /**
   * Deterministic 32-bit FNV-1a hash for percentage rollouts.
   */
  private simpleHash(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash);
  }
}

export const featureFlagService = new FeatureFlagService();
