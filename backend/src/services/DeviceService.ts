import mongoose from "mongoose";
import { DeviceRegistration, IDeviceRegistration } from "../models/DeviceRegistration";
import { DRMSecurityEvent } from "../models/DRMSecurityEvent";
import { ApiError } from "../middleware/errorHandler";

const MAX_CONCURRENT_DEVICES = 3;

export class DeviceService {
  /**
   * Registers a device or updates lastActiveAt if already registered.
   * If user exceeds MAX_CONCURRENT_DEVICES, throws or returns active devices to prompt deauthorization.
   */
  async registerOrTouchDevice(
    userId: string,
    deviceId: string,
    details: {
      deviceType?: "mobile" | "tablet" | "desktop" | "e-reader" | "other";
      deviceName?: string;
      ipAddress: string;
      userAgent: string;
    }
  ): Promise<{ device: IDeviceRegistration; activeDeviceCount: number }> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if device is already registered for this user
    let existing = await DeviceRegistration.findOne({ userId: userObjectId, deviceId });

    if (existing) {
      if (!existing.isActive) {
        // Reactivation check
        const activeCount = await DeviceRegistration.countDocuments({
          userId: userObjectId,
          isActive: true,
        });
        if (activeCount >= MAX_CONCURRENT_DEVICES) {
          await this.logBreach(userId, details.ipAddress, details.userAgent, {
            reason: "Device limit reached on reactivation attempt",
            attemptedDeviceId: deviceId,
          });
          throw new ApiError(
            403,
            `Concurrent device limit (${MAX_CONCURRENT_DEVICES}) reached. Deauthorize another device first.`
          );
        }
        existing.isActive = true;
        existing.deauthorizedAt = undefined;
      }
      existing.lastActiveAt = new Date();
      existing.ipAddress = details.ipAddress;
      existing.userAgent = details.userAgent;
      if (details.deviceName) existing.deviceName = details.deviceName;
      await existing.save();

      const totalActive = await DeviceRegistration.countDocuments({
        userId: userObjectId,
        isActive: true,
      });
      return { device: existing, activeDeviceCount: totalActive };
    }

    // New device: verify active device threshold
    const activeCount = await DeviceRegistration.countDocuments({
      userId: userObjectId,
      isActive: true,
    });

    if (activeCount >= MAX_CONCURRENT_DEVICES) {
      await this.logBreach(userId, details.ipAddress, details.userAgent, {
        reason: "Device limit reached on new registration",
        attemptedDeviceId: deviceId,
      });
      throw new ApiError(
        403,
        `Concurrent device limit (${MAX_CONCURRENT_DEVICES}) reached. Deauthorize an existing device to proceed.`
      );
    }

    const created = await DeviceRegistration.create({
      userId: userObjectId,
      deviceId,
      deviceType: details.deviceType || "desktop",
      deviceName: details.deviceName || "Web Reader",
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      isActive: true,
    });

    return { device: created, activeDeviceCount: activeCount + 1 };
  }

  /**
   * Lists all active devices for a reader.
   */
  async listUserDevices(userId: string) {
    return DeviceRegistration.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ lastActiveAt: -1 });
  }

  /**
   * Deauthorizes a device remotely.
   */
  async deauthorizeDevice(userId: string, deviceId: string): Promise<boolean> {
    const result = await DeviceRegistration.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), deviceId, isActive: true },
      { isActive: false, deauthorizedAt: new Date() }
    );
    return !!result;
  }

  private async logBreach(
    userId: string,
    ipAddress: string,
    userAgent: string,
    metadata: Record<string, unknown>
  ) {
    await DRMSecurityEvent.create({
      userId: new mongoose.Types.ObjectId(userId),
      eventType: "concurrent_limit_breach",
      ipAddress,
      userAgent,
      metadata,
    }).catch(() => null);
  }
}

export const deviceService = new DeviceService();
