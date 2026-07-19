describe("SessionRepository", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("createSession adds session to user", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: [{ sessionId: "s1" }],
      activeSessionId: "s1",
    };
    User.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.createSession("1", {
      sessionId: "s1",
    } as any);
    expect(res).toEqual(fakeUser);
  });

  test("addSession is alias for createSession", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: [{ sessionId: "s1" }],
      activeSessionId: "s1",
    };
    User.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.addSession("1", {
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
        { sessionId: "s2", expiresAt: new Date(Date.now() - 3600000) },
      ],
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.getActiveSessions("1");
    expect(res).toHaveLength(1);
    expect(res[0].sessionId).toBe("s1");
  });

  test("getAllSessions returns all sessions", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: [
        { sessionId: "s1", expiresAt: new Date(Date.now() + 3600000) },
        { sessionId: "s2", expiresAt: new Date(Date.now() - 3600000) },
      ],
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.getAllSessions("1");
    expect(res).toHaveLength(2);
  });

  test("getSession returns specific session", async () => {
    const User = require("../models/User");
    const expectedExpiresAt = new Date(Date.now() + 3600000);
    const fakeUser = {
      _id: "1",
      sessions: [
        { sessionId: "s1", expiresAt: expectedExpiresAt },
        { sessionId: "s2", expiresAt: new Date(Date.now() - 3600000) },
      ],
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.getSession("1", "s1");
    expect(res).toEqual(expect.objectContaining({ sessionId: "s1" }));
    expect(res?.expiresAt).toBeInstanceOf(Date);
    expect(res?.expiresAt.getTime()).toBeCloseTo(
      expectedExpiresAt.getTime(),
      -2,
    ); // Within 100ms
  });

  test("getSession returns null when not found", async () => {
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
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.getSession("1", "nonexistent");
    expect(res).toBeNull();
  });

  test("getActiveSession returns active session", async () => {
    const User = require("../models/User");
    const expiresAt = new Date(Date.now() + 3600000);
    const fakeUser = {
      _id: "1",
      activeSessionId: "s1",
      sessions: [
        { sessionId: "s1", expiresAt },
        { sessionId: "s2", expiresAt: new Date(Date.now() - 3600000) },
      ],
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.getActiveSession("1");
    expect(res).toEqual({ sessionId: "s1", expiresAt });
  });

  test("updateSessionActivity calls findOneAndUpdate", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1" };
    User.User.findOneAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.updateSessionActivity("1", "s1");
    expect(res).toEqual(fakeUser);
  });

  test("revokeSession removes session", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", sessions: [], activeSessionId: null };
    User.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.revokeSession("1", "s1");
    expect(res).toEqual(fakeUser);
  });

  test("revokeAllSessions clears all sessions", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", sessions: [], activeSessionId: null };
    User.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.revokeAllSessions("1");
    expect(res).toEqual(fakeUser);
  });

  test("revokeOtherSessions keeps only current session", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: [{ sessionId: "s1" }],
      activeSessionId: "s1",
    };
    User.User.findOneAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.revokeOtherSessions("1", "s1");
    expect(res).toEqual(fakeUser);
  });

  test("removeExpiredSessions removes expired", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: [
        { sessionId: "s1", expiresAt: new Date(Date.now() + 3600000) },
      ],
    };
    User.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.removeExpiredSessions("1");
    expect(res).toEqual(fakeUser);
  });

  test("setActiveSession updates active session", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", activeSessionId: "s1" };
    User.User.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.setActiveSession("1", "s1");
    expect(res).toEqual(fakeUser);
  });

  test("getActiveSessionId returns active session id", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1", activeSessionId: "s1" };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.getActiveSessionId("1");
    expect(res).toBe("s1");
  });

  test("countActiveSessions returns count", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: [
        { sessionId: "s1", expiresAt: new Date(Date.now() + 3600000) },
        { sessionId: "s2", expiresAt: new Date(Date.now() - 3600000) },
      ],
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.countActiveSessions("1");
    expect(res).toBe(1);
  });

  test("getSessionCount returns total count", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: [
        { sessionId: "s1", expiresAt: new Date(Date.now() + 3600000) },
        { sessionId: "s2", expiresAt: new Date(Date.now() - 3600000) },
      ],
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.getSessionCount("1");
    expect(res).toBe(2);
  });

  test("hasTooManySessions returns true when over limit", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: Array(10)
        .fill(null)
        .map((_, i) => ({
          sessionId: `s${i}`,
          expiresAt: new Date(Date.now() + 3600000),
        })),
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.hasTooManySessions("1", 5);
    expect(res).toBe(true);
  });

  test("hasTooManySessions returns false when under limit", async () => {
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
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.hasTooManySessions("1", 5);
    expect(res).toBe(false);
  });

  test("getSessionsWithPagination returns paginated sessions", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: Array(15)
        .fill(null)
        .map((_, i) => ({
          sessionId: `s${i}`,
          expiresAt: new Date(Date.now() + 3600000),
        })),
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.getSessionsWithPagination("1", {
      page: 1,
      limit: 10,
    });
    expect(res.data).toHaveLength(10);
    expect(res.pagination.total).toBe(15);
    expect(res.pagination.totalPages).toBe(2);
  });

  test("findUserBySessionId finds user by session", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1" };
    User.User.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.findUserBySessionId("s1");
    expect(res).toEqual(fakeUser);
  });

  test("findUserByActiveSessionId finds user by active session", async () => {
    const User = require("../models/User");
    const fakeUser = { _id: "1" };
    User.User.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.findUserByActiveSessionId("s1");
    expect(res).toEqual(fakeUser);
  });

  test("cleanupExpiredSessions returns modified count", async () => {
    const User = require("../models/User");
    const fakeResult = { modifiedCount: 5 };
    User.User.updateMany = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeResult) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.cleanupExpiredSessions();
    expect(res).toBe(5);
  });

  test("getSessionsByDeviceType filters by device type", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: [
        { sessionId: "s1", device: { deviceType: "mobile" } },
        { sessionId: "s2", device: { deviceType: "desktop" } },
      ],
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.getSessionsByDeviceType("1", "mobile");
    expect(res).toHaveLength(1);
    expect(res[0].sessionId).toBe("s1");
  });

  test("getSessionsByIP filters by IP", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: [
        { sessionId: "s1", ip: "192.168.1.1" },
        { sessionId: "s2", ip: "10.0.0.1" },
      ],
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.getSessionsByIP("1", "192.168.1.1");
    expect(res).toHaveLength(1);
    expect(res[0].sessionId).toBe("s1");
  });

  test("findUsersWithActiveSessions returns paginated users", async () => {
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
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.findUsersWithActiveSessions(
      {},
      { page: 1, limit: 10 },
    );
    expect(res).toHaveProperty("data");
    expect(res).toHaveProperty("pagination");
  });

  test("getSessionStats returns stats", async () => {
    const User = require("../models/User");
    const fakeUser = {
      _id: "1",
      sessions: [
        {
          sessionId: "s1",
          expiresAt: new Date(Date.now() + 3600000),
          device: { deviceType: "mobile" },
        },
        {
          sessionId: "s2",
          expiresAt: new Date(Date.now() - 3600000),
          device: { deviceType: "desktop" },
        },
      ],
    };
    User.User.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) });
    const { sessionRepository } = require("../repositories/SessionRepository");
    const res = await sessionRepository.getSessionStats("1");
    expect(res.total).toBe(2);
    expect(res.active).toBe(1);
    expect(res.expired).toBe(1);
    expect(res.devices).toContain("mobile");
    expect(res.devices).toContain("desktop");
  });
});
