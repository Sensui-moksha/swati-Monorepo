const FAKE_ID = "aaaaaaaaaaaaaaaaaaaaaaaa"; // valid 24-char hex ObjectId
const FAKE_ID_2 = "bbbbbbbbbbbbbbbbbbbbbbbb";

describe("UserService", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("getUsers returns paginated users", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeResult = {
      data: [{ _id: FAKE_ID }],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
    UserRepository.userRepository.findWithPagination = jest
      .fn()
      .mockResolvedValue(fakeResult);
    const { userService } = require("../services/UserService");
    const res = await userService.getUsers({}, { page: 1, limit: 10 });
    expect(res).toEqual(fakeResult);
  });

  test("getUserById returns user when found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: FAKE_ID, email: "test@example.com" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    const res = await userService.getUserById(FAKE_ID);
    expect(res).toEqual(fakeUser);
  });

  test("getUserById throws when not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    // Also mock the model.findOne fallback to prevent real DB call
    UserRepository.userRepository.model = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };
    const { userService } = require("../services/UserService");
    await expect(userService.getUserById(FAKE_ID)).rejects.toThrow(
      "User not found",
    );
  });

  test("getUserByIdOrNull returns user when found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: FAKE_ID, email: "test@example.com" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    const res = await userService.getUserByIdOrNull(FAKE_ID);
    expect(res).toEqual(fakeUser);
  });

  test("getUserByIdOrNull returns null when not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    const { userService } = require("../services/UserService");
    const res = await userService.getUserByIdOrNull(FAKE_ID);
    expect(res).toBeNull();
  });

  test("createUser creates user when email and username unique", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: FAKE_ID,
      email: "test@example.com",
      username: "testuser",
    };
    UserRepository.userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue(null);
    UserRepository.userRepository.findByUsername = jest
      .fn()
      .mockResolvedValue(null);
    UserRepository.userRepository.create = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    const res = await userService.createUser({
      email: "test@example.com",
      username: "testuser",
      password: "password123",
      fullName: "Test User",
    });
    expect(res).toEqual(fakeUser);
  });

  test("createUser throws when email exists", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue({ _id: FAKE_ID });
    const { userService } = require("../services/UserService");
    await expect(
      userService.createUser({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        fullName: "Test User",
      }),
    ).rejects.toThrow("Email already in use");
  });

  test("createUser throws when username exists", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue(null);
    UserRepository.userRepository.findByUsername = jest
      .fn()
      .mockResolvedValue({ _id: FAKE_ID });
    const { userService } = require("../services/UserService");
    await expect(
      userService.createUser({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        fullName: "Test User",
      }),
    ).rejects.toThrow("Username already taken");
  });

  test("updateUser updates user when email and username unique", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: FAKE_ID,
      email: "old@example.com",
      username: "olduser",
    };
    const updatedUser = {
      _id: FAKE_ID,
      email: "new@example.com",
      username: "newuser",
    };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue(null);
    UserRepository.userRepository.findByUsername = jest
      .fn()
      .mockResolvedValue(null);
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(updatedUser);
    const { userService } = require("../services/UserService");
    const res = await userService.updateUser(FAKE_ID, {
      email: "new@example.com",
      username: "newuser",
    });
    expect(res).toEqual(updatedUser);
  });

  test("updateUser throws when user not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    UserRepository.userRepository.model = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };
    const { userService } = require("../services/UserService");
    await expect(
      userService.updateUser(FAKE_ID, { email: "new@example.com" }),
    ).rejects.toThrow("User not found");
  });

  test("updateUser returns null from updateById throws", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: FAKE_ID, username: "olduser" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(null);
    const { userService } = require("../services/UserService");
    await expect(
      userService.updateUser(FAKE_ID, { username: "newuser" }),
    ).rejects.toThrow("User not found");
  });

  test("deleteUser deletes user", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.deleteById = jest
      .fn()
      .mockResolvedValue({ _id: FAKE_ID });
    UserRepository.userRepository.model = {
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    const { userService } = require("../services/UserService");
    await userService.deleteUser(FAKE_ID);
    expect(UserRepository.userRepository.deleteById).toHaveBeenCalledWith(FAKE_ID);
  });

  test("hardDeleteUser hard deletes user", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.deleteById = jest
      .fn()
      .mockResolvedValue({ _id: FAKE_ID });
    UserRepository.userRepository.model = {
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    const { userService } = require("../services/UserService");
    await userService.hardDeleteUser(FAKE_ID);
    expect(UserRepository.userRepository.deleteById).toHaveBeenCalledWith(FAKE_ID);
  });

  test("changePassword changes password when current is correct", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: FAKE_ID,
      password: "hashed",
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue({ _id: FAKE_ID, password: "newhashed" }),
    };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    await userService.changePassword(FAKE_ID, {
      currentPassword: "oldpass",
      newPassword: "newpass",
    });
    expect(fakeUser.comparePassword).toHaveBeenCalledWith("oldpass");
    expect(fakeUser.password).toBe("newpass");
    expect(fakeUser.save).toHaveBeenCalled();
  });

  test("changePassword throws when current password incorrect", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: FAKE_ID,
      comparePassword: jest.fn().mockResolvedValue(false),
    };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    await expect(
      userService.changePassword(FAKE_ID, {
        currentPassword: "wrong",
        newPassword: "newpass",
      }),
    ).rejects.toThrow("Current password is incorrect");
  });

  test("updateProfile updates profile", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: FAKE_ID,
      email: "old@example.com",
      username: "olduser",
    };
    const updatedUser = {
      _id: FAKE_ID,
      email: "new@example.com",
      username: "newuser",
    };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue(null);
    UserRepository.userRepository.findByUsername = jest
      .fn()
      .mockResolvedValue(null);
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(updatedUser);
    const { userService } = require("../services/UserService");
    const res = await userService.updateProfile(FAKE_ID, {
      email: "new@example.com",
      username: "newuser",
    });
    expect(res).toEqual(updatedUser);
  });

  test("updateProfile throws when email taken", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: FAKE_ID, email: "old@example.com" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue({ _id: FAKE_ID_2 });
    const { userService } = require("../services/UserService");
    await expect(
      userService.updateProfile(FAKE_ID, { email: "taken@example.com" }),
    ).rejects.toThrow("Email already in use");
  });

  test("updateProfile throws when username taken", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: FAKE_ID, username: "olduser" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue(null);
    UserRepository.userRepository.findByUsername = jest
      .fn()
      .mockResolvedValue({ _id: FAKE_ID_2 });
    const { userService } = require("../services/UserService");
    await expect(
      userService.updateProfile(FAKE_ID, { username: "takenuser" }),
    ).rejects.toThrow("Username already taken");
  });

  test("getUserStats returns stats", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.count = jest.fn().mockResolvedValue(100);
    UserRepository.userRepository.getActiveUsersCount = jest
      .fn()
      .mockResolvedValue(80);
    UserRepository.userRepository.getVerifiedUsersCount = jest
      .fn()
      .mockResolvedValue(70);
    UserRepository.userRepository.getRecentUsers = jest
      .fn()
      .mockResolvedValue([{ _id: FAKE_ID }, { _id: FAKE_ID_2 }]);
    const { userService } = require("../services/UserService");
    const res = await userService.getUserStats();
    expect(res).toEqual({
      totalUsers: 100,
      activeUsers: 80,
      verifiedUsers: 70,
      newUsers: 100,
      recentUsers: [{ _id: FAKE_ID }, { _id: FAKE_ID_2 }],
    });
  });

  test("getUsersByRole returns users by role", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUsers = [
      { _id: FAKE_ID, role: "admin" },
      { _id: FAKE_ID_2, role: "admin" },
    ];
    UserRepository.userRepository.getUsersByRole = jest
      .fn()
      .mockResolvedValue(fakeUsers);
    const { userService } = require("../services/UserService");
    const res = await userService.getUsersByRole("admin");
    expect(res).toEqual(fakeUsers);
  });

  test("activateUser activates user", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: FAKE_ID, isActive: true };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    const res = await userService.activateUser(FAKE_ID);
    expect(res).toEqual(fakeUser);
  });

  test("activateUser throws when user not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    UserRepository.userRepository.model = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };
    const { userService } = require("../services/UserService");
    await expect(userService.activateUser(FAKE_ID)).rejects.toThrow(
      "User not found",
    );
  });

  test("deactivateUser deactivates user", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: FAKE_ID, isActive: false };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    const res = await userService.deactivateUser(FAKE_ID);
    expect(res).toEqual(fakeUser);
  });

  test("deactivateUser throws when user not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    UserRepository.userRepository.model = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };
    const { userService } = require("../services/UserService");
    await expect(userService.deactivateUser(FAKE_ID)).rejects.toThrow(
      "User not found",
    );
  });
});
