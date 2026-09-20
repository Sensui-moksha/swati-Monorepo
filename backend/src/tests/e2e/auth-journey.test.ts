import { deviceService } from "../../services/DeviceService";
import { DeviceRegistration } from "../../models/DeviceRegistration";
import { DRMSecurityEvent } from "../../models/DRMSecurityEvent";
import { Types } from "mongoose";

describe("E2E Journey 1: Authentication & Zero-Trust Device Lifecycle", () => {
  const testUserId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(DRMSecurityEvent, "create").mockResolvedValue({} as any);
  });

  it("should enforce a strict maximum limit of 3 active devices per account", async () => {
    jest.spyOn(DeviceRegistration, "findOne").mockResolvedValue(null);
    jest.spyOn(DeviceRegistration, "countDocuments").mockResolvedValue(3 as any);

    await expect(
      deviceService.registerOrTouchDevice(testUserId, "dev-4", {
        deviceType: "desktop",
        deviceName: "Work PC",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      })
    ).rejects.toThrow(/Concurrent device limit \(3\) reached/);
  });

  it("should successfully register a new device when within limit", async () => {
    const mockCreated = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(testUserId),
      deviceId: "dev-new",
      isActive: true,
      lastActiveAt: new Date(),
    };

    jest.spyOn(DeviceRegistration, "findOne").mockResolvedValue(null);
    jest.spyOn(DeviceRegistration, "countDocuments").mockResolvedValue(2 as any);
    jest.spyOn(DeviceRegistration, "create").mockResolvedValue(mockCreated as any);

    const result = await deviceService.registerOrTouchDevice(testUserId, "dev-new", {
      deviceType: "mobile",
      deviceName: "Pixel 9",
      ipAddress: "192.168.1.50",
      userAgent: "Mozilla/5.0",
    });

    expect(result.device.deviceId).toBe("dev-new");
    expect(result.activeDeviceCount).toBe(3);
  });

  it("should allow an authenticated user to remotely deauthorize a device", async () => {
    const mockUpdated = {
      _id: new Types.ObjectId(),
      deviceId: "dev-lost",
      isActive: false,
    };

    jest.spyOn(DeviceRegistration, "findOneAndUpdate").mockResolvedValue(mockUpdated as any);

    const deauthorized = await deviceService.deauthorizeDevice(testUserId, "dev-lost");
    expect(deauthorized).toBe(true);
  });
});

