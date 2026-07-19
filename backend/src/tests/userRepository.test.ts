describe("UserRepository", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("findByEmail returns user when found", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", email: "test@example.com" };
    User.User.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.findByEmail("test@example.com");
    expect(res).toEqual(fakeUser);
  });

  test("findByEmail returns null when not found", async () => {
    const User = require("../models/User");
    User.User.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.findByEmail("missing@example.com");
    expect(res).toBeNull();
  });

  test("findByUsername returns user when found", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", username: "testuser" };
    User.User.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.findByUsername("testuser");
    expect(res).toEqual(fakeUser);
  });

  test("findByEmailOrUsername returns user when email matches", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", email: "test@example.com" };
    User.User.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.findByEmailOrUsername("test@example.com");
    expect(res).toEqual(fakeUser);
  });

  test("findByRefreshToken returns user when found", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", refreshToken: "token123" };
    User.User.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.findByRefreshToken("token123");
    expect(res).toEqual(fakeUser);
  });

  test("findByVerificationToken returns user when found", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", emailVerificationToken: "verify123" };
    User.User.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.findByVerificationToken("verify123");
    expect(res).toEqual(fakeUser);
  });

  test("findByPasswordResetToken returns user when valid", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      passwordResetToken: "reset123",
      passwordResetExpires: new Date(Date.now() + 3600000),
    };
    User.User.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.findByPasswordResetToken("reset123");
    expect(res).toEqual(fakeUser);
  });

  test("findWithPagination returns paginated users", async () => {
    const User = require("../models/User");
    const fakeResult = {
      data: [{ _id: "1" }],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
    User.User.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([{ _id: "1" }]),
          }),
        }),
      }),
    });
    User.User.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.findWithPagination(
      {},
      { page: 1, limit: 10 },
    );
    expect(res).toHaveProperty("data");
    expect(res).toHaveProperty("pagination");
  });

  test("updateRefreshToken calls updateById", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", refreshToken: "newtoken" };
    User.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.updateRefreshToken("1", "newtoken");
    expect(res).toEqual(fakeUser);
  });

  test("verifyEmail updates user correctly", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", emailVerified: true };
    User.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.verifyEmail("1");
    expect(res).toEqual(fakeUser);
  });

  test("getActiveUsersCount returns count", async () => {
    const User = require("../models/User");
    User.User.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(5) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.getActiveUsersCount();
    expect(res).toBe(5);
  });

  test("getVerifiedUsersCount returns count", async () => {
    const User = require("../models/User");
    User.User.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(3) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.getVerifiedUsersCount();
    expect(res).toBe(3);
  });

  test("getRecentUsers returns users", async () => {
    const User = require("../models/User");
    const fakeUsers = [{ _id: "1" }, { _id: "2" }];
    User.User.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(fakeUsers),
        }),
      }),
    });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.getRecentUsers(2);
    expect(res).toEqual(fakeUsers);
  });

  test("addSession calls updateById", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", sessions: [{ sessionId: "s1" }] };
    User.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.addSession("1", {
      sessionId: "s1",
    } as any);
    expect(res).toEqual(fakeUser);
  });

  test("getActiveSessions returns active sessions", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: [
        { sessionId: "s1", expiresAt: new Date(Date.now() + 3600000) },
      ],
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.getActiveSessions("1");
    expect(res).toHaveLength(1);
  });

  test("setOTP calls updateById", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", otpCode: "123456" };
    User.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.setOTP(
      "1",
      "123456",
      new Date(Date.now() + 300000),
      "login",
    );
    expect(res).toEqual(fakeUser);
  });

  test("verifyOTP returns user when valid", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      otpCode: "123456",
      otpExpires: new Date(Date.now() + 300000),
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.verifyOTP("1", "123456");
    expect(res).toEqual(fakeUser);
  });

  test("verifyOTP returns null when code mismatch", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      otpCode: "123456",
      otpExpires: new Date(Date.now() + 300000),
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.verifyOTP("1", "wrong");
    expect(res).toBeNull();
  });

  test("enableTwoFactor calls updateById", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", twoFactorEnabled: true };
    User.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { userRepository } = require("../repositories/UserRepository");
    const res = await userRepository.enableTwoFactor("1", "secret", [
      "code1",
      "code2",
    ]);
    expect(res).toEqual(fakeUser);
  });
});
