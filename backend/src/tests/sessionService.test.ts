describe("SessionService", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("createSession creates and returns session", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeSession = {
      sessionId: "s1",
      ip: "127.0.0.1",
      userAgent: "test-agent",
    };
    SessionRepository.sessionRepository.addSession = jest
      .fn()
      .mockResolvedValue({ sessions: [fakeSession] });
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.createSession({
      userId: "1",
      sessionId: "s1",
      ip: "127.0.0.1",
      userAgent: "test-agent",
      expiresAt: new Date(Date.now() + 3600000),
    });
    expect(res.sessionId).toBe("s1");
    expect(res.ip).toBe("127.0.0.1");
    expect(res.userAgent).toBe("test-agent");
  });

  test("getActiveSessions returns active sessions", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeSessions = [
      { sessionId: "s1", expiresAt: new Date(Date.now() + 3600000) },
    ];
    SessionRepository.sessionRepository.getActiveSessions = jest
      .fn()
      .mockResolvedValue(fakeSessions);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.getActiveSessions("1");
    expect(res).toEqual(fakeSessions);
  });

  test("getAllSessions returns all sessions", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeSessions = [
      { sessionId: "s1", expiresAt: new Date(Date.now() + 3600000) },
      { sessionId: "s2", expiresAt: new Date(Date.now() - 3600000) },
    ];
    SessionRepository.sessionRepository.getAllSessions = jest
      .fn()
      .mockResolvedValue(fakeSessions);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.getAllSessions("1");
    expect(res).toEqual(fakeSessions);
  });

  test("getUserSessions is alias for getAllSessions", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeSessions = [{ sessionId: "s1" }];
    SessionRepository.sessionRepository.getAllSessions = jest
      .fn()
      .mockResolvedValue(fakeSessions);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.getUserSessions("1");
    expect(res).toEqual(fakeSessions);
  });

  test("getSession returns specific session", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeSession = { sessionId: "s1" };
    SessionRepository.sessionRepository.getSession = jest
      .fn()
      .mockResolvedValue(fakeSession);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.getSession("1", "s1");
    expect(res).toEqual(fakeSession);
  });

  test("getActiveSession returns active session", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeSession = { sessionId: "s1" };
    SessionRepository.sessionRepository.getActiveSession = jest
      .fn()
      .mockResolvedValue(fakeSession);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.getActiveSession("1");
    expect(res).toEqual(fakeSession);
  });

  test("updateSessionActivity calls repository", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.updateSessionActivity = jest
      .fn()
      .mockResolvedValue({});
    const { sessionService } = require("../services/SessionService");
    await sessionService.updateSessionActivity("1", "s1");
    expect(
      SessionRepository.sessionRepository.updateSessionActivity,
    ).toHaveBeenCalledWith("1", "s1");
  });

  test("updateSessionInfo calls repository with mapped data", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.updateSessionInfo = jest
      .fn()
      .mockResolvedValue({});
    const { sessionService } = require("../services/SessionService");
    await sessionService.updateSessionInfo("1", "s1", {
      lastActive: new Date(),
      ip: "192.168.1.1",
      device: { deviceType: "mobile" },
    });
    expect(
      SessionRepository.sessionRepository.updateSessionInfo,
    ).toHaveBeenCalled();
  });

  test("revokeSession calls repository", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.revokeSession = jest
      .fn()
      .mockResolvedValue({});
    const { sessionService } = require("../services/SessionService");
    await sessionService.revokeSession("1", "s1");
    expect(
      SessionRepository.sessionRepository.revokeSession,
    ).toHaveBeenCalledWith("1", "s1");
  });

  test("revokeAllSessions calls repository", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.revokeAllSessions = jest
      .fn()
      .mockResolvedValue({});
    const { sessionService } = require("../services/SessionService");
    await sessionService.revokeAllSessions("1");
    expect(
      SessionRepository.sessionRepository.revokeAllSessions,
    ).toHaveBeenCalledWith("1");
  });

  test("revokeOtherSessions calls repository", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.revokeOtherSessions = jest
      .fn()
      .mockResolvedValue({});
    const { sessionService } = require("../services/SessionService");
    await sessionService.revokeOtherSessions("1", "s1");
    expect(
      SessionRepository.sessionRepository.revokeOtherSessions,
    ).toHaveBeenCalledWith("1", "s1");
  });

  test("removeExpiredSessions calls repository", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.removeExpiredSessions = jest
      .fn()
      .mockResolvedValue({});
    const { sessionService } = require("../services/SessionService");
    await sessionService.removeExpiredSessions("1");
    expect(
      SessionRepository.sessionRepository.removeExpiredSessions,
    ).toHaveBeenCalledWith("1");
  });

  test("setActiveSession calls repository", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.setActiveSession = jest
      .fn()
      .mockResolvedValue({});
    const { sessionService } = require("../services/SessionService");
    await sessionService.setActiveSession("1", "s1");
    expect(
      SessionRepository.sessionRepository.setActiveSession,
    ).toHaveBeenCalledWith("1", "s1");
  });

  test("getSessionCount returns count", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.getSessionCount = jest
      .fn()
      .mockResolvedValue(5);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.getSessionCount("1");
    expect(res).toBe(5);
  });

  test("getActiveSessionCount returns count", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.getActiveSessionCount = jest
      .fn()
      .mockResolvedValue(3);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.getActiveSessionCount("1");
    expect(res).toBe(3);
  });

  test("hasTooManySessions returns boolean", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.hasTooManySessions = jest
      .fn()
      .mockResolvedValue(true);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.hasTooManySessions("1", 5);
    expect(res).toBe(true);
  });

  test("getSessionsWithPagination returns paginated result", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeResult = {
      data: [{ sessionId: "s1" }],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
    SessionRepository.sessionRepository.getSessionsWithPagination = jest
      .fn()
      .mockResolvedValue(fakeResult);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.getSessionsWithPagination("1", {
      page: 1,
      limit: 10,
    });
    expect(res).toEqual(fakeResult);
  });

  test("findUsersWithActiveSessions returns paginated users", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
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
    SessionRepository.sessionRepository.findUsersWithActiveSessions = jest
      .fn()
      .mockResolvedValue(fakeResult);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.findUsersWithActiveSessions(
      {},
      { page: 1, limit: 10 },
    );
    expect(res).toEqual(fakeResult);
  });

  test("findUserBySessionId returns user", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeUser = { _id: "1" };
    SessionRepository.sessionRepository.findUserBySessionId = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.findUserBySessionId("s1");
    expect(res).toEqual(fakeUser);
  });

  test("findUserByActiveSessionId returns user", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeUser = { _id: "1" };
    SessionRepository.sessionRepository.findUserByActiveSessionId = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.findUserByActiveSessionId("s1");
    expect(res).toEqual(fakeUser);
  });

  test("cleanupExpiredSessions returns count", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.cleanupExpiredSessions = jest
      .fn()
      .mockResolvedValue(10);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.cleanupExpiredSessions();
    expect(res).toBe(10);
  });

  test("getSessionsByDeviceType returns filtered sessions", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeSessions = [
      { sessionId: "s1", device: { deviceType: "mobile" } },
    ];
    SessionRepository.sessionRepository.getSessionsByDeviceType = jest
      .fn()
      .mockResolvedValue(fakeSessions);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.getSessionsByDeviceType("1", "mobile");
    expect(res).toEqual(fakeSessions);
  });

  test("getSessionsByIP returns filtered sessions", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeSessions = [{ sessionId: "s1", ip: "192.168.1.1" }];
    SessionRepository.sessionRepository.getSessionsByIP = jest
      .fn()
      .mockResolvedValue(fakeSessions);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.getSessionsByIP("1", "192.168.1.1");
    expect(res).toEqual(fakeSessions);
  });

  test("validateSession returns user and session when valid", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeUser = {
      _id: "1",
      sessions: [
        { sessionId: "s1", expiresAt: new Date(Date.now() + 3600000) },
      ],
    };
    SessionRepository.sessionRepository.findUserByActiveSessionId = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.validateSession("s1");
    expect(res).toEqual({ user: fakeUser, session: fakeUser.sessions[0] });
  });

  test("validateSession returns null when user not found", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    SessionRepository.sessionRepository.findUserByActiveSessionId = jest
      .fn()
      .mockResolvedValue(null);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.validateSession("s1");
    expect(res).toBeNull();
  });

  test("validateSession returns null when session expired", async () => {
    const SessionRepository = require("../repositories/SessionRepository");
    const fakeUser = {
      _id: "1",
      sessions: [
        { sessionId: "s1", expiresAt: new Date(Date.now() - 3600000) },
      ],
    };
    SessionRepository.sessionRepository.findUserByActiveSessionId = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { sessionService } = require("../services/SessionService");
    const res = await sessionService.validateSession("s1");
    expect(res).toBeNull();
  });
});
