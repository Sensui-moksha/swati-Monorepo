// Call adminController methods directly with mocked services
describe("Admin controller (unit-style with mocked services)", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("getUserStats returns user stats", async () => {
    jest.doMock("../services/UserService", () => ({
      userService: { getUserStats: async () => ({ totalUsers: 10 }) },
    }));
    const { adminController } = require("../controllers/adminController");
    const res: any = { json: jest.fn() };
    await adminController.getUserStats({} as any, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { totalUsers: 10 },
    });
  });

  test("listUsers returns paginated users", async () => {
    jest.doMock("../services/UserService", () => ({
      userService: {
        getUsers: async () => ({
          data: [{ _id: "1" }],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        }),
      },
    }));
    const { adminController } = require("../controllers/adminController");
    const req: any = { query: {} };
    const res: any = { json: jest.fn() };
    await adminController.listUsers(req, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
