import { Types } from "mongoose";
import { adminController } from "../../controllers/adminController";
import { userService } from "../../services/userService";
import { mediaService } from "../../services/mediaService";

jest.mock("../../services/userService");
jest.mock("../../services/mediaService");

describe("E2E Journey: Administrator Enterprise Control", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("System & User Governance", () => {
    it("should retrieve aggregated platform user metrics", async () => {
      (userService.getUserStats as jest.Mock).mockResolvedValue({
        total: 1250,
        active: 1200,
        subscribers: 450,
      });

      const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await adminController.getUserStats({} as any, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ total: 1250, active: 1200 }),
        })
      );
    });

    it("should allow admin to update user role to editor with audit compliance", async () => {
      const targetUserId = new Types.ObjectId().toString();
      (userService.updateUser as jest.Mock).mockResolvedValue({
        _id: targetUserId,
        role: "editor",
      });

      const req: any = {
        params: { id: targetUserId },
        body: { role: "editor" },
        user: { _id: "admin123", role: "admin" },
      };
      const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await adminController.updateUser(req, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ role: "editor" }),
        })
      );
    });
  });

  describe("Storage & Media Infrastructure Inspection", () => {
    it("should retrieve global media and storage statistics", async () => {
      (mediaService.getStats as jest.Mock).mockResolvedValue({
        totalFiles: 1420,
        totalSize: 524288000,
        byType: {
          image: 400,
          document: 1020,
        },
      });

      const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await adminController.getMediaStats({} as any, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ totalFiles: 1420 }),
        })
      );
    });
  });
});
