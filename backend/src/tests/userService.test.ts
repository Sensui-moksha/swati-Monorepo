describe("UserService", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("getUsers returns paginated users", async () => {
    const UserRepository = require("../repositories/UserRepository");
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
    UserRepository.userRepository.findWithPagination = jest
      .fn()
      .mockResolvedValue(fakeResult);
    const { userService } = require("../services/UserService");
    const res = await userService.getUsers({}, { page: 1, limit: 10 });
    expect(res).toEqual(fakeResult);
  });

  test("getUserById returns user when found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", email: "test@example.com" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    const res = await userService.getUserById("1");
    expect(res).toEqual(fakeUser);
  });

  test("getUserById throws when not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    const { userService } = require("../services/UserService");
    await expect(userService.getUserById("1")).rejects.toThrow(
      "User not found",
    );
  });

  test("getUserByIdOrNull returns user when found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", email: "test@example.com" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    const res = await userService.getUserByIdOrNull("1");
    expect(res).toEqual(fakeUser);
  });

  test("getUserByIdOrNull returns null when not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    const { userService } = require("../services/UserService");
    const res = await userService.getUserByIdOrNull("1");
    expect(res).toBeNull();
  });

  test("createUser creates user when email and username unique", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
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
      .mockResolvedValue({ _id: "1" });
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
      .mockResolvedValue({ _id: "1" });
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
      _id: "1",
      email: "old@example.com",
      username: "olduser",
    };
    const updatedUser = {
      _id: "1",
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
    const res = await userService.updateUser("1", {
      email: "new@example.com",
      username: "newuser",
    });
    expect(res).toEqual(updatedUser);
  });

  test("updateUser throws when email taken", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", email: "old@example.com" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue({ _id: "2" });
    const { userService } = require("../services/UserService");
    await expect(
      userService.updateUser("1", { email: "taken@example.com" }),
    ).rejects.toThrow("Email already in use");
  });

  test("updateUser throws when username taken", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", username: "olduser" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue(null);
    UserRepository.userRepository.findByUsername = jest
      .fn()
      .mockResolvedValue({ _id: "2" });
    const { userService } = require("../services/UserService");
    await expect(
      userService.updateUser("1", { username: "takenuser" }),
    ).rejects.toThrow("Username already taken");
  });

  test("deleteUser deletes user", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.deleteById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    await userService.deleteUser("1");
    expect(UserRepository.userRepository.deleteById).toHaveBeenCalledWith("1");
  });

  test("hardDeleteUser hard deletes user", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.deleteById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    await userService.hardDeleteUser("1");
    expect(UserRepository.userRepository.deleteById).toHaveBeenCalledWith("1");
  });

  test("changePassword changes password when current is correct", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
      password: "hashed",
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue({ _id: "1", password: "newhashed" }),
    };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    await userService.changePassword("1", {
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
      _id: "1",
      comparePassword: jest.fn().mockResolvedValue(false),
    };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    await expect(
      userService.changePassword("1", {
        currentPassword: "wrong",
        newPassword: "newpass",
      }),
    ).rejects.toThrow("Current password is incorrect");
  });

  test("updateProfile updates profile", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
      email: "old@example.com",
      username: "olduser",
    };
    const updatedUser = {
      _id: "1",
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
    const res = await userService.updateProfile("1", {
      email: "new@example.com",
      username: "newuser",
    });
    expect(res).toEqual(updatedUser);
  });

  test("updateProfile throws when email taken", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", email: "old@example.com" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue({ _id: "2" });
    const { userService } = require("../services/UserService");
    await expect(
      userService.updateProfile("1", { email: "taken@example.com" }),
    ).rejects.toThrow("Email already in use");
  });

  test("updateProfile throws when username taken", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", username: "olduser" };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue(null);
    UserRepository.userRepository.findByUsername = jest
      .fn()
      .mockResolvedValue({ _id: "2" });
    const { userService } = require("../services/UserService");
    await expect(
      userService.updateProfile("1", { username: "takenuser" }),
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
      .mockResolvedValue([{ _id: "1" }, { _id: "2" }]);
    const { userService } = require("../services/UserService");
    const res = await userService.getUserStats();
    expect(res).toEqual({
      totalUsers: 100,
      activeUsers: 80,
      verifiedUsers: 70,
      recentUsers: [{ _id: "1" }, { _id: "2" }],
    });
  });

  test("getUsersByRole returns users by role", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUsers = [
      { _id: "1", role: "admin" },
      { _id: "2", role: "admin" },
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
    const fakeUser = { _id: "1", isActive: true };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    const res = await userService.activateUser("1");
    expect(res).toEqual(fakeUser);
  });

  test("activateUser throws when user not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    const { userService } = require("../services/UserService");
    await expect(userService.activateUser("1")).rejects.toThrow(
      "User not found",
    );
  });

  test("deactivateUser deactivates user", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", isActive: false };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userService } = require("../services/UserService");
    const res = await userService.deactivateUser("1");
    expect(res).toEqual(fakeUser);
  });

  test("deactivateUser throws when user not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    const { userService } = require("../services/UserService");
    await expect(userService.deactivateUser("1")).rejects.toThrow(
      "User not found",
    );
  });
});
