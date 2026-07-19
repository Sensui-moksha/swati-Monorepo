describe("systemController", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("getAppInfo returns json", async () => {
    jest.resetModules();
    jest.doMock("../services/SystemService", () => ({
      systemService: {
        getAppInfo: async () => ({ name: "app", version: "1.2.3" }),
        getHealth: async () => ({ uptime: 1 }),
        getDatabaseStats: async () => ({ stats: {} }),
        listSettings: async () => [],
        getSetting: async (k: string) => ({ key: k, value: "v" }),
        upsertSetting: async (k: string, v: any) => ({ key: k, value: v }),
        testEmail: async () => ({ success: true }),
      },
    }));

    const { systemController } = require("../controllers/systemController");
    const res: any = { json: jest.fn() };
    await systemController.getAppInfo({} as any, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { name: "app", version: "1.2.3" },
    });
  });

  test("upsertSetting calls service and returns updated", async () => {
    const mockService = {
      upsertSetting: jest.fn().mockResolvedValue({ key: "k", value: "v" }),
    };
    jest.resetModules();
    jest.doMock("../services/SystemService", () => ({
      systemService: mockService,
    }));

    const { systemController } = require("../controllers/systemController");
    const req: any = { params: { key: "k" }, body: { value: "v" } };
    const res: any = { json: jest.fn() };
    await systemController.upsertSetting(req, res, jest.fn());
    expect(mockService.upsertSetting).toHaveBeenCalledWith("k", "v", {});
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { key: "k", value: "v" },
    });
  });
});
