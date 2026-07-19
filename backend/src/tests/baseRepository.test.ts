describe("BaseRepository", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("create saves and returns document", async () => {
    const Model = require("../models/User");
    const fakeDoc = {
      _id: "1",
      email: "test@example.com",
      save: jest
        .fn()
        .mockResolvedValue({ _id: "1", email: "test@example.com" }),
    };
    Model.User = jest.fn().mockImplementation(() => fakeDoc);
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.create({ email: "test@example.com" });
    expect(res).toEqual({ _id: "1", email: "test@example.com" });
  });

  test("findById returns document when found", async () => {
    const Model = require("../models/User");
    const fakeDoc = { _id: "1", email: "test@example.com" };
    Model.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDoc) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.findById("1");
    expect(res).toEqual(fakeDoc);
  });

  test("findById returns null when not found", async () => {
    const Model = require("../models/User");
    Model.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.findById("1");
    expect(res).toBeNull();
  });

  test("findByIdOrThrow throws when not found", async () => {
    const Model = require("../models/User");
    Model.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    await expect(repo.findByIdOrThrow("1")).rejects.toThrow(
      "User not found with id: 1",
    );
  });

  test("findOne returns document when found", async () => {
    const Model = require("../models/User");
    const fakeDoc = { _id: "1", email: "test@example.com" };
    Model.User.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDoc) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.findOne({ email: "test@example.com" });
    expect(res).toEqual(fakeDoc);
  });

  test("find returns array of documents", async () => {
    const Model = require("../models/User");
    const fakeDocs = [{ _id: "1" }, { _id: "2" }];
    Model.User.find = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDocs) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.find({});
    expect(res).toEqual(fakeDocs);
  });

  test("findWithPagination returns paginated result", async () => {
    const Model = require("../models/User");
    const fakeDocs = [{ _id: "1" }, { _id: "2" }];
    Model.User.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDocs) }),
        }),
      }),
    });
    Model.User.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.findWithPagination({}, { page: 1, limit: 10 });
    expect(res.data).toEqual(fakeDocs);
    expect(res.pagination.total).toBe(2);
    expect(res.pagination.totalPages).toBe(1);
  });

  test("updateById updates and returns document", async () => {
    const Model = require("../models/User");
    const fakeDoc = { _id: "1", email: "updated@example.com" };
    Model.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDoc) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.updateById("1", { email: "updated@example.com" });
    expect(res).toEqual(fakeDoc);
  });

  test("updateOne updates and returns document", async () => {
    const Model = require("../models/User");
    const fakeDoc = { _id: "1", email: "updated@example.com" };
    Model.User.findOneAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDoc) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.updateOne(
      { email: "test@example.com" },
      { email: "updated@example.com" },
    );
    expect(res).toEqual(fakeDoc);
  });

  test("updateMany returns modified count", async () => {
    const Model = require("../models/User");
    const fakeResult = { modifiedCount: 5 };
    Model.User.updateMany = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeResult) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.updateMany({ isActive: false }, { isActive: true });
    expect(res).toEqual({ modifiedCount: 5 });
  });

  test("deleteById deletes and returns document", async () => {
    const Model = require("../models/User");
    const fakeDoc = { _id: "1", email: "test@example.com" };
    Model.User.findByIdAndDelete = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDoc) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.deleteById("1");
    expect(res).toEqual(fakeDoc);
  });

  test("softDelete marks document as deleted", async () => {
    const Model = require("../models/User");
    const fakeDoc = { _id: "1", isDeleted: true, deletedAt: new Date() };
    Model.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDoc) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.softDelete("1");
    expect(res).toEqual(fakeDoc);
  });

  test("deleteOne deletes and returns document", async () => {
    const Model = require("../models/User");
    const fakeDoc = { _id: "1", email: "test@example.com" };
    Model.User.findOneAndDelete = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDoc) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.deleteOne({ email: "test@example.com" });
    expect(res).toEqual(fakeDoc);
  });

  test("deleteMany returns deleted count", async () => {
    const Model = require("../models/User");
    const fakeResult = { deletedCount: 3 };
    Model.User.deleteMany = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeResult) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.deleteMany({ isActive: false });
    expect(res).toEqual({ deletedCount: 3 });
  });

  test("count returns document count", async () => {
    const Model = require("../models/User");
    Model.User.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(10) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.count({ isActive: true });
    expect(res).toBe(10);
  });

  test("exists returns true when document exists", async () => {
    const Model = require("../models/User");
    const fakeDoc = { _id: "1" };
    Model.User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDoc) }),
      }),
    });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.exists({ email: "test@example.com" });
    expect(res).toBe(true);
  });

  test("exists returns false when document does not exist", async () => {
    const Model = require("../models/User");
    Model.User.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      }),
    });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.exists({ email: "missing@example.com" });
    expect(res).toBe(false);
  });

  test("findByIds returns documents", async () => {
    const Model = require("../models/User");
    const fakeDocs = [{ _id: "1" }, { _id: "2" }];
    Model.User.find = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDocs) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.findByIds(["1", "2"]);
    expect(res).toEqual(fakeDocs);
  });

  test("aggregate returns aggregation result", async () => {
    const Model = require("../models/User");
    const fakeResult = [{ _id: null, count: 10 }];
    Model.User.aggregate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeResult) });
    const { BaseRepository } = require("../repositories/BaseRepository");
    const repo = new BaseRepository(Model.User);
    const res = await repo.aggregate([
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    expect(res).toEqual(fakeResult);
  });
});
