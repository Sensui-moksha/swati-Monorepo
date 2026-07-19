describe("SettingRepository", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("findByKey returns null when not found", async () => {
    const Setting = require("../models/Setting");
    Setting.Setting.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const { settingRepository } = require("../repositories/SettingRepository");
    const res = await settingRepository.findByKey("missing");
    expect(res).toBeNull();
  });

  test("upsertByKey creates or updates", async () => {
    const Setting = require("../models/Setting");
    const fake = { key: "k", value: "v" };
    Setting.Setting.findOneAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fake) });
    const { settingRepository } = require("../repositories/SettingRepository");
    const res = await settingRepository.upsertByKey("k", "v", {
      updatedBy: "u",
    });
    expect(res).toEqual(fake);
    expect(Setting.Setting.findOneAndUpdate).toHaveBeenCalled();
  });
});
