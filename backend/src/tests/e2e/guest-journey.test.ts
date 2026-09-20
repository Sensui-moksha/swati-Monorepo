import { publicationService } from "../../services/publicationService";
import { userService } from "../../services/userService";
import { publicationRepository } from "../../repositories/PublicationRepository";
import { userRepository } from "../../repositories/UserRepository";
import { Types } from "mongoose";

jest.mock("../../repositories/PublicationRepository");
jest.mock("../../repositories/UserRepository");

describe("E2E Journey: Guest Visitor Experience", () => {
  const publicationId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Public Catalog & Discovery", () => {
    it("should allow a guest to browse active publications with pagination", async () => {
      const mockPublications = [
        {
          _id: publicationId,
          title: "Swathi Weekly Issue 42",
          type: "weekly",
          isActive: true,
          price: 50,
          previewPages: [1, 2, 3],
        },
      ];

      (publicationRepository.findWithPagination as jest.Mock).mockResolvedValue({
        data: mockPublications,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      });

      const result = await publicationService.listPublications({ status: "active" }, { page: 1, limit: 10 });
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect((result.data[0] as any).title).toBe("Swathi Weekly Issue 42");
    });

    it("should allow a guest to view public preview pages without a subscription", async () => {
      const mockPub = {
        _id: publicationId,
        title: "Telugu Classical Anthology",
        previewPages: [1, 2, 3, 4],
        pageCount: 250,
        isPremium: true,
        isDeleted: false,
      };

      (publicationRepository.findById as jest.Mock).mockResolvedValue(mockPub);

      const pub = await publicationService.getPublicationById(publicationId);
      expect(pub).toBeDefined();
      expect((pub as any).previewPages).toContain(1);
      expect((pub as any).previewPages).toHaveLength(4);
    });
  });

  describe("Guest Registration & Login Onboarding", () => {
    it("should validate and create a new registered user account", async () => {
      const newUserInput = {
        email: "guest.reader@example.com",
        username: "guestreader",
        password: "SecurePassword123!",
        fullName: "New Reader",
        phone: "+919876543210",
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.findByUsername as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId(),
        ...newUserInput,
        role: "user",
        isActive: true,
      });

      const created = await userService.createUser(newUserInput as any);
      expect(created).toBeDefined();
      expect(created.email).toBe("guest.reader@example.com");
      expect(created.role).toBe("user");
    });

    it("should reject duplicate registration with existing email", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId(),
        email: "existing@example.com",
      });

      await expect(
        userService.createUser({
          email: "existing@example.com",
          username: "existinguser",
          password: "Password123!",
          fullName: "Existing",
        } as any)
      ).rejects.toThrow();
    });
  });
});
