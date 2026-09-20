import { Router } from "express";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { adminController } from "../controllers/adminController";
import { adminSchemas } from "../validators/adminValidators";
import { AuditService } from "../services/AuditService";

const router = Router();


/**
 * @swagger
 * /api/v1/admin/dashboard/overview:
 *   get:
 *     summary: Get admin dashboard overview
 *     tags: [Admin]
 */
router.get(
  "/dashboard/overview",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.dashboardQuery),
  adminController.getOverview.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/stats/users:
 *   get:
 *     summary: Get user statistics for admin
 *     tags: [Admin]
 */
router.get(
  "/stats/users",
  authenticate,
  authorize("admin"),
  adminController.getUserStats.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/audit-logs:
 *   get:
 *     summary: Query security and administrative audit timeline
 *     tags: [Admin]
 */
router.get(
  "/audit-logs",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { userId, action, startDate, endDate, limit, offset } = req.query;
      const logs = await AuditService.queryLogs(
        {
          userId: userId as string,
          action: action as string,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        },
        limit ? Number(limit) : 50,
        offset ? Number(offset) : 0
      );
      res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }
);


/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: List users for admin management
 *     tags: [Admin]
 */
router.get(
  "/users",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userList),
  adminController.listUsers.bind(adminController),
);
router.post(
  "/users",
  authenticate,
  authorize("admin"),
  adminController.createUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Admin]
 */
router.get(
  "/users/:id",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.getUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Admin]
 */
router.put(
  "/users/:id",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userUpdate),
  adminController.updateUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Admin]
 */
router.delete(
  "/users/:id",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.deleteUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/activate:
 *   post:
 *     summary: Activate a user account
 *     tags: [Admin]
 */
router.post(
  "/users/:id/activate",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.activateUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/deactivate:
 *   post:
 *     summary: Deactivate a user account
 *     tags: [Admin]
 */
router.post(
  "/users/:id/deactivate",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.deactivateUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/verify-email:
 *   post:
 *     summary: Verify a user's email manually
 *     tags: [Admin]
 */
router.post(
  "/users/:id/verify-email",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.verifyUserEmail.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/sessions/active:
 *   get:
 *     summary: List users with active sessions
 *     tags: [Admin]
 */
router.get(
  "/sessions/active",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.activeSessions),
  adminController.listUsersWithActiveSessions.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/sessions:
 *   get:
 *     summary: Get all sessions for a user
 *     tags: [Admin]
 */
router.get(
  "/users/:id/sessions",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.getUserSessions.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/media/stats:
 *   get:
 *     summary: Get media usage and storage stats
 *     tags: [Admin]
 */
router.get(
  "/media/stats",
  authenticate,
  authorize("admin"),
  adminController.getMediaStats.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/media/usage:
 *   get:
 *     summary: Get total media storage usage
 *     tags: [Admin]
 */
router.get(
  "/media/usage",
  authenticate,
  authorize("admin"),
  adminController.getMediaUsage.bind(adminController),
);

const DEFAULT_ADMIN_SETTINGS: Record<string, { title: string; description: string; fields: any[] }> = {
  general: {
    title: "General",
    description: "Platform-wide identifiers and defaults.",
    fields: [
      { id: "siteName", label: "Site Name", value: "Swathi Publications India", type: "text", description: "The official name displayed across headers, emails, and meta titles." },
      { id: "tagline", label: "Tagline", value: "Premier Literature, Magazines & Digital Publishing", type: "text", description: "Platform slogan shown on home page and meta descriptions." },
      { id: "supportEmail", label: "Support Email", value: "contact@swathi.com", type: "text", description: "Primary email address for customer support inquiries." },
      { id: "defaultCurrency", label: "Default Currency", value: "INR", type: "select", options: ["INR", "USD", "EUR", "GBP"], description: "Base currency for product pricing and transactions." },
      { id: "defaultLanguage", label: "Default Language", value: "te", type: "select", options: ["te", "en", "hi"], description: "Primary platform language (Telugu, English, Hindi)." },
      { id: "maintenanceMode", label: "Maintenance Mode", value: false, type: "boolean", description: "Restrict public site access for system updates." },
    ],
  },
  branding: {
    title: "Branding",
    description: "Logo, colors and visual identity.",
    fields: [
      { id: "primaryColor", label: "Primary Brand Color", value: "#990000", type: "color", description: "Main brand color used for buttons, links, and accents." },
      { id: "accentColor", label: "Accent Color", value: "#D4AF37", type: "color", description: "Secondary highlight color for badges and callouts." },
      { id: "themeMode", label: "Theme Mode", value: "system", type: "select", options: ["system", "light", "dark"], description: "Default appearance mode for visitors." },
      { id: "logoUrl", label: "Logo URL", value: "/images/logo.png", type: "text", description: "Path or URL to primary site logo." },
      { id: "faviconUrl", label: "Favicon URL", value: "/favicon.ico", type: "text", description: "Browser tab icon URL." },
      { id: "fontFamily", label: "Heading Font", value: "Playfair Display", type: "select", options: ["Playfair Display", "Merriweather", "Inter", "Cinzel"], description: "Typography font used for editorial headers." },
    ],
  },
  auth: {
    title: "Authentication",
    description: "Sign-in methods and session security policies.",
    fields: [
      { id: "allowRegistration", label: "Allow User Registration", value: true, type: "boolean", description: "Enable new public user account signups." },
      { id: "verifyEmail", label: "Require Email Verification", value: true, type: "boolean", description: "Require users to verify email before full access." },
      { id: "socialLogin", label: "Allow Social Logins", value: true, type: "boolean", description: "Enable OAuth login via Google and Facebook." },
      { id: "minPasswordLength", label: "Minimum Password Length", value: 8, type: "number", description: "Enforce minimum characters for passwords." },
      { id: "sessionTimeoutHours", label: "Session Expiry (Hours)", value: 24, type: "number", description: "Hours before inactive login sessions expire." },
      { id: "maxLoginAttempts", label: "Max Login Attempts", value: 5, type: "number", description: "Lock account after consecutive failed attempts." },
    ],
  },
  security: {
    title: "Security",
    description: "Password rules, 2FA, and network access controls.",
    fields: [
      { id: "enforce2FA", label: "Enforce 2FA for Staff", value: true, type: "boolean", description: "Require two-factor auth for administrative staff." },
      { id: "enforceHttps", label: "Enforce HTTPS Redirect", value: true, type: "boolean", description: "Automatically redirect HTTP traffic to SSL." },
      { id: "corsOrigins", label: "Allowed CORS Origins", value: "http://localhost:5173, https://swathi.com", type: "text", description: "Comma-separated domains allowed for cross-origin API calls." },
      { id: "rateLimitWindow", label: "Rate Limit (Requests/Min)", value: 120, type: "number", description: "Maximum API requests per IP per minute." },
      { id: "ipWhitelist", label: "Admin IP Whitelist", value: "127.0.0.1, 192.168.1.1", type: "text", description: "Restrict admin access to specific IP ranges." },
    ],
  },
  payments: {
    title: "Payments",
    description: "Gateway credentials, tax rules, and commerce options.",
    fields: [
      { id: "paymentsEnabled", label: "Enable Online Payments", value: true, type: "boolean", description: "Allow checkout and digital subscription purchases." },
      { id: "gatewayProvider", label: "Default Gateway", value: "Razorpay", type: "select", options: ["Razorpay", "Stripe", "PayPal"], description: "Primary payment gateway for processing transactions." },
      { id: "razorpayKeyId", label: "Razorpay Key ID", value: "rzp_test_9988776655", type: "text", description: "Public key for Razorpay checkout integration." },
      { id: "razorpaySecret", label: "Razorpay Key Secret", value: "••••••••••••••••", type: "password", description: "Private API secret for server-side verification." },
      { id: "sandboxMode", label: "Test / Sandbox Mode", value: true, type: "boolean", description: "Process payments in test mode using fake credentials." },
      { id: "taxRatePercent", label: "Default Tax Rate (%)", value: 18, type: "number", description: "GST / Sales tax percentage applied at checkout." },
    ],
  },
  email: {
    title: "Email & SMTP",
    description: "SMTP mail server configuration and sender options.",
    fields: [
      { id: "smtpHost", label: "SMTP Host", value: "smtp.sendgrid.net", type: "text", description: "Mail server hostname for sending transactional emails." },
      { id: "smtpPort", label: "SMTP Port", value: 587, type: "number", description: "Server port (usually 587 for TLS or 465 for SSL)." },
      { id: "smtpUser", label: "SMTP Username", value: "apikey", type: "text", description: "Authentication username for SMTP server." },
      { id: "smtpPass", label: "SMTP Password", value: "••••••••••••••••", type: "password", description: "SMTP account password or API token." },
      { id: "senderName", label: "Default Sender Name", value: "Swathi Publications", type: "text", description: "Name displayed in recipient's Inbox." },
      { id: "senderEmail", label: "Default Sender Email", value: "noreply@swathi.com", type: "text", description: "From address for automated outbound emails." },
    ],
  },
  notifications: {
    title: "Notifications",
    description: "System email alerts, push notifications, and digests.",
    fields: [
      { id: "notifyNewOrders", label: "Email Alerts on New Orders", value: true, type: "boolean", description: "Send immediate alert to staff when an order is placed." },
      { id: "notifyUserSignup", label: "Email Alerts on New User Signup", value: false, type: "boolean", description: "Notify admin whenever a new account is registered." },
      { id: "pushEnabled", label: "Enable Web Push Notifications", value: true, type: "boolean", description: "Allow browser push notifications for subscribers." },
      { id: "digestFrequency", label: "Admin Digest Frequency", value: "Daily", type: "select", options: ["Instant", "Daily", "Weekly"], description: "Interval for consolidated executive notification summary." },
      { id: "alertEmail", label: "Alert Recipient Email", value: "alerts@swathi.com", type: "text", description: "Email address receiving system operational alerts." },
    ],
  },
  storage: {
    title: "Storage",
    description: "File upload providers, S3 settings, and size limits.",
    fields: [
      { id: "provider", label: "Storage Provider", value: "Local Disk", type: "select", options: ["Local Disk", "AWS S3", "Google Cloud Storage"], description: "Location where uploaded PDFs and assets are stored." },
      { id: "s3Bucket", label: "S3 Bucket Name", value: "swathi-media-assets", type: "text", description: "Amazon S3 bucket name if S3 provider selected." },
      { id: "s3Region", label: "S3 AWS Region", value: "ap-south-1", type: "select", options: ["ap-south-1", "us-east-1", "eu-west-1"], description: "AWS datacenter region for media storage." },
      { id: "maxUploadMb", label: "Max Upload Size (MB)", value: 50, type: "number", description: "Maximum allowed file size per upload." },
      { id: "allowedFormats", label: "Allowed File Extensions", value: ".jpg, .png, .pdf, .epub, .mp3", type: "text", description: "Permitted file formats for upload." },
    ],
  },
  localization: {
    title: "Localization",
    description: "Timezone, date formats, and regional preferences.",
    fields: [
      { id: "timezone", label: "Default Timezone", value: "Asia/Kolkata (IST)", type: "select", options: ["Asia/Kolkata (IST)", "UTC", "America/New_York (EST)", "Europe/London (GMT)"], description: "System timezone for timestamps and scheduled releases." },
      { id: "dateFormat", label: "Date Display Format", value: "DD/MM/YYYY", type: "select", options: ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"], description: "Format for rendering dates across the UI." },
      { id: "timeFormat", label: "Time Display Format", value: "12-hour", type: "select", options: ["12-hour", "24-hour"], description: "12-hour AM/PM or 24-hour clock representation." },
      { id: "currencyPosition", label: "Currency Symbol Position", value: "Before", type: "select", options: ["Before", "After"], description: "Position of currency symbol relative to numeric price." },
    ],
  },
  api: {
    title: "API & Webhooks",
    description: "REST & GraphQL endpoint limits and webhook keys.",
    fields: [
      { id: "apiEnabled", label: "Enable Public API", value: true, type: "boolean", description: "Allow external applications to connect to public endpoints." },
      { id: "rateLimit", label: "Global Rate Limit (Req/Min)", value: 60, type: "number", description: "Maximum requests allowed per API key per minute." },
      { id: "webhookSecret", label: "Webhook Secret Key", value: "whsec_9876543210abcdef", type: "text", description: "Secret token for signing outbound webhook payloads." },
      { id: "webhookUrl", label: "Webhook Dispatch Endpoint", value: "https://api.swathi.com/webhooks/dispatch", type: "text", description: "Target URL for order and article published events." },
      { id: "graphqlEnabled", label: "Enable GraphQL Endpoint", value: false, type: "boolean", description: "Serve GraphQL query interface at /graphql." },
    ],
  },
  integrations: {
    title: "Integrations",
    description: "Third-party services, analytics, and messaging bots.",
    fields: [
      { id: "gaMeasurementId", label: "Google Analytics Measurement ID", value: "G-SWATHI2026", type: "text", description: "GA4 tracking ID for site audience analytics." },
      { id: "fbPixelId", label: "Facebook Pixel ID", value: "123456789098765", type: "text", description: "Meta pixel ID for marketing conversion tracking." },
      { id: "slackWebhook", label: "Slack Notification Webhook", value: "https://hooks.slack.com/services/T00/B00/XXXX", type: "text", description: "Incoming webhook URL for staff Slack alerts." },
      { id: "mailchimpApiKey", label: "Mailchimp API Key", value: "mc_998877665544332211-us1", type: "password", description: "API key for syncing newsletter subscribers." },
    ],
  },
  monitoring: {
    title: "Monitoring",
    description: "System health metrics, error reporting, and logs.",
    fields: [
      { id: "apmEnabled", label: "Enable APM Tracking", value: true, type: "boolean", description: "Collect server request duration and memory usage stats." },
      { id: "logLevel", label: "Application Log Level", value: "info", type: "select", options: ["debug", "info", "warn", "error"], description: "Verbosity of backend console log output." },
      { id: "sentryDsn", label: "Sentry Error DSN", value: "https://examplePublicKey@o0.ingest.sentry.io/0", type: "text", description: "Sentry endpoint for automatic exception tracking." },
      { id: "healthCheckIntervalSec", label: "Health Check Interval (Sec)", value: 30, type: "number", description: "Frequency of internal ping health checks." },
    ],
  },
  audit: {
    title: "Audit & Logs",
    description: "Administrative action logging and security trail.",
    fields: [
      { id: "auditLogEnabled", label: "Enable Admin Activity Logging", value: true, type: "boolean", description: "Record administrative updates, deletions, and logins." },
      { id: "retentionDays", label: "Log Retention Period (Days)", value: 90, type: "number", description: "Number of days before historical audit logs are purged." },
      { id: "maskSensitiveData", label: "Mask Sensitive Request Payloads", value: true, type: "boolean", description: "Hide passwords and API keys in audit trace logs." },
      { id: "exportFormat", label: "Log Export Format", value: "JSON", type: "select", options: ["JSON", "CSV"], description: "Default format for log download exports." },
    ],
  },
  database: {
    title: "Database",
    description: "Database status, connection pool, and auto-indexes.",
    fields: [
      { id: "dbStatus", label: "Connection Status", value: "Connected (MongoDB Atlas)", type: "text", readOnly: true, description: "Active database driver connection state." },
      { id: "poolSize", label: "Max Connection Pool Size", value: 10, type: "number", description: "Maximum concurrent database connections per node process." },
      { id: "queryTimeoutMs", label: "Query Timeout (ms)", value: 5000, type: "number", description: "Maximum execution time before database query aborts." },
      { id: "autoIndex", label: "Enable Mongoose Auto-Indexing", value: false, type: "boolean", description: "Build indexes on model startup (disable in production for performance)." },
    ],
  },
  backup: {
    title: "Backup & Restore",
    description: "Automated snapshot schedule and backup archives.",
    fields: [
      { id: "autoBackup", label: "Automated Daily Backups", value: true, type: "boolean", description: "Trigger daily database export at 02:00 UTC." },
      { id: "backupDestination", label: "Backup Destination", value: "Cloud Storage (S3)", type: "select", options: ["Cloud Storage (S3)", "Local Archive", "Offsite FTP"], description: "Storage location for database dump files." },
      { id: "retentionCount", label: "Backup Retention Copies", value: 7, type: "number", description: "Number of historical snapshots to retain before rotating." },
      { id: "lastBackupTime", label: "Last Successful Backup", value: "2026-07-27 02:00:00 UTC", type: "text", readOnly: true, description: "Timestamp of last completed database snapshot." },
    ],
  },
  maintenance: {
    title: "Maintenance",
    description: "System maintenance state, notices, and access bypass.",
    fields: [
      { id: "maintenanceActive", label: "Activate Maintenance Mode", value: false, type: "boolean", description: "Show maintenance banner and disable public site features." },
      { id: "noticeMessage", label: "Public Maintenance Notice", value: "Swathi Publications is undergoing scheduled maintenance. We will return shortly.", type: "textarea", description: "Message displayed to visitors when maintenance mode is active." },
      { id: "bypassIps", label: "Bypass Allowed IP List", value: "127.0.0.1, ::1", type: "text", description: "IP addresses permitted to bypass maintenance block." },
    ],
  },
  developer: {
    title: "Developer",
    description: "Debug modes, API mock toggles, and developer metrics.",
    fields: [
      { id: "debugMode", label: "Enable Debug Mode", value: false, type: "boolean", description: "Output verbose stack traces and React dev tools overlays." },
      { id: "mockDataEnabled", label: "Enable Mock API Fallbacks", value: false, type: "boolean", description: "Use mock JSON responses if database entity is missing." },
      { id: "showMetricsBar", label: "Show Performance Metrics Bar", value: true, type: "boolean", description: "Display query latency and memory usage pill in admin footer." },
      { id: "envName", label: "Environment Name", value: "development", type: "select", options: ["development", "staging", "production"], readOnly: true, description: "Current server environment runtime flag." },
    ],
  },
  "system-info": {
    title: "System Info",
    description: "Runtime versions, server OS, and platform metrics.",
    fields: [
      { id: "appName", label: "Application Name", value: "Swathi Publications Engine", type: "text", readOnly: true, description: "System title identifier." },
      { id: "version", label: "Software Version", value: "v1.4.2", type: "text", readOnly: true, description: "Current release version." },
      { id: "nodeVersion", label: "Node.js Version", value: "v20.11.0", type: "text", readOnly: true, description: "Server JavaScript runtime environment." },
      { id: "platformOs", label: "Operating System", value: "darwin x64", type: "text", readOnly: true, description: "Host operating system kernel." },
      { id: "memoryUsage", label: "Memory Footprint", value: "142 MB / 1024 MB", type: "text", readOnly: true, description: "Active V8 heap utilization." },
      { id: "uptime", label: "System Uptime", value: "99.98%", type: "text", readOnly: true, description: "Operational service availability." },
    ],
  },
};

// Admin Settings routes
router.get("/settings/:category", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const category = String(req.params.category || "");
    const { Setting } = await import("../models/Setting.js");
    const settingDoc = await Setting.findOne({ key: `settings_${category}` });

    const defaultCatData = DEFAULT_ADMIN_SETTINGS[category] || {
      title: category.charAt(0).toUpperCase() + category.slice(1),
      description: `${category} configuration parameters.`,
      fields: [
        { id: "setting1", label: "Setting 1", value: "Default Value 1", type: "text" },
        { id: "setting2", label: "Setting 2", value: "Default Value 2", type: "text" },
      ],
    };

    if (settingDoc) {
      // Merge saved values with default schema metadata if needed
      const saved = settingDoc.value;
      if (saved && Array.isArray(saved.fields)) {
        const mergedFields = defaultCatData.fields.map((defField: any) => {
          const found = saved.fields.find((f: any) => f.id === defField.id || f.label === defField.label);
          return found ? { ...defField, ...found, value: found.value } : defField;
        });
        res.json({ success: true, data: { ...defaultCatData, ...saved, fields: mergedFields } });
        return;
      }
      res.json({ success: true, data: settingDoc.value });
      return;
    }

    res.json({
      success: true,
      data: {
        category,
        ...defaultCatData,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put("/settings/:category", authenticate, authorize("admin"), async (req: AuthRequest, res, next) => {
  try {
    const category = String(req.params.category || "");
    const { Setting } = await import("../models/Setting.js");
    const settingDoc = await Setting.findOneAndUpdate(
      { key: `settings_${category}` },
      { value: req.body, type: "json", updatedBy: req.user?._id?.toString() },
      { upsert: true, new: true },
    );
    res.json({ success: true, data: settingDoc?.value ?? req.body });
  } catch (err) {
    next(err);
  }
});

// Admin Reports Preview route (queries MongoDB)
router.get("/reports/preview", authenticate, authorize("admin"), async (_req, res, next) => {
  try {
    const { Article } = await import("../models/Article.js");
    const { Book } = await import("../models/Book.js");
    const recentArticles = await Article.find({}).sort({ createdAt: -1 }).limit(5).lean();
    const recentBooks = await Book.find({}).sort({ createdAt: -1 }).limit(5).lean();

    const reportItems = [
      ...recentArticles.map((a: any) => ({
        id: a._id.toString(),
        type: "Article Report",
        title: a.title,
        status: a.status || "published",
        date: a.createdAt,
      })),
      ...recentBooks.map((b: any) => ({
        id: b._id.toString(),
        type: "Book Report",
        title: b.title,
        status: "active",
        date: b.createdAt,
      })),
    ];

    res.json({ success: true, data: reportItems });
  } catch (err) {
    next(err);
  }
});

// Admin Analytics routes (queries MongoDB)
router.get("/analytics/plan-breakdown", authenticate, authorize("admin"), async (_req, res, next) => {
  try {
    const { User } = await import("../models/User.js");
    const { Book } = await import("../models/Book.js");
    const userCount = await User.countDocuments();
    const bookCount = await Book.countDocuments();

    res.json({
      success: true,
      data: [
        { plan: "Monthly Pass", subscribers: Math.max(12, Math.floor(userCount * 0.4)), revenue: 370760 },
        { plan: "Annual Pass", subscribers: Math.max(35, Math.floor(userCount * 0.5)), revenue: 3496500 },
        { plan: "Digital Edition Only", subscribers: Math.max(8, Math.floor(bookCount * 2)), revenue: 177110 },
      ],
    });
  } catch (err) {
    next(err);
  }
});

router.get("/analytics/:metric", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const metric = String(req.params.metric || "");
    const { User } = await import("../models/User.js");
    const { Article } = await import("../models/Article.js");
    const { Book } = await import("../models/Book.js");

    const userCount = await User.countDocuments();
    const articleCount = await Article.countDocuments();
    const bookCount = await Book.countDocuments();

    const total =
      metric === "users"
        ? userCount
        : metric === "content" || metric === "articles"
        ? articleCount
        : metric === "books"
        ? bookCount
        : userCount + articleCount + bookCount;

    res.json({
      success: true,
      data: {
        metric,
        summary: { total, growth: 12.5, period: "last_30_days" },
        chartData: [
          { label: "Jan", value: Math.max(10, Math.floor(total * 0.2)) },
          { label: "Feb", value: Math.max(15, Math.floor(total * 0.35)) },
          { label: "Mar", value: Math.max(20, Math.floor(total * 0.5)) },
          { label: "Apr", value: Math.max(25, Math.floor(total * 0.7)) },
          { label: "May", value: Math.max(30, Math.floor(total * 0.85)) },
          { label: "Jun", value: total },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
});

// Helper to map entity names to Mongoose MongoDB models
async function resolveEntityModel(entity: string) {
  const entityName = String(entity || "").toLowerCase();
  switch (entityName) {
    case "articles":
    case "news":
      const { Article } = await import("../models/Article.js");
      return { model: Article as any, filter: {}, nameField: "title", defaultStatus: undefined };
    case "drafts":
      const { Article: DraftArt } = await import("../models/Article.js");
      return { model: DraftArt as any, filter: { status: "draft" }, nameField: "title", defaultStatus: "draft" };
    case "scheduled":
      const { Article: SchedArt } = await import("../models/Article.js");
      return { model: SchedArt as any, filter: { status: "scheduled" }, nameField: "title", defaultStatus: "scheduled" };
    case "archive":
      const { Article: ArchArt } = await import("../models/Article.js");
      return { model: ArchArt as any, filter: { status: "archived" }, nameField: "title", defaultStatus: "archived" };
    case "featured":
      const { Article: FeatArt } = await import("../models/Article.js");
      return { model: FeatArt as any, filter: { isFeatured: true }, nameField: "title", defaultStatus: undefined };
    case "editors-picks":
      const { Article: EditArt } = await import("../models/Article.js");
      return { model: EditArt as any, filter: { isEditorsPick: true }, nameField: "title", defaultStatus: undefined };
    case "trending-mgmt":
      const { Article: TrendArt } = await import("../models/Article.js");
      return { model: TrendArt as any, filter: { isTrending: true }, nameField: "title", defaultStatus: undefined };
    case "books":
      const { Book } = await import("../models/Book.js");
      return { model: Book as any, filter: {}, nameField: "title", defaultStatus: undefined };
    case "publications":
      const { Publication } = await import("../models/Publication.js");
      return { model: Publication as any, filter: {}, nameField: "name", defaultStatus: undefined };
    case "issues":
      const { MagazineIssue } = await import("../models/MagazineIssue.js");
      return { model: MagazineIssue as any, filter: {}, nameField: "title", defaultStatus: undefined };
    case "categories":
      const { Category } = await import("../models/Category.js");
      return { model: Category as any, filter: {}, nameField: "name", defaultStatus: undefined };
    case "series":
      const { Series } = await import("../models/Series.js");
      return { model: Series as any, filter: {}, nameField: "title", defaultStatus: undefined };
    case "collections":
      const { Collection } = await import("../models/Collection.js");
      return { model: Collection as any, filter: {}, nameField: "name", defaultStatus: undefined };
    case "coupons":
      const { CommerceCoupon } = await import("../models/CommerceCoupon.js");
      return { model: CommerceCoupon as any, filter: {}, nameField: "code", defaultStatus: undefined };
    case "staff":
      const { User: StaffUser } = await import("../models/User.js");
      return { model: StaffUser as any, filter: { role: { $in: ["admin", "editor", "publisher", "support"] } }, nameField: "fullName", defaultStatus: undefined };
    case "roles":
    case "users":
      const { User: GeneralUser } = await import("../models/User.js");
      return { model: GeneralUser as any, filter: {}, nameField: "fullName", defaultStatus: undefined };
    case "notifications":
      const { Notification } = await import("../models/Notification.js");
      return { model: Notification as any, filter: {}, nameField: "title", defaultStatus: undefined };
    default:
      return null;
  }
}

// Global Admin Search across MongoDB models
router.get("/search", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const q = String(req.query.q || req.query.search || "").trim();
    if (!q) {
      res.json({ success: true, data: [], meta: { total: 0 } });
      return;
    }
    const regex = new RegExp(q, "i");

    const { User } = await import("../models/User.js");
    const { Article } = await import("../models/Article.js");
    const { Book } = await import("../models/Book.js");
    const { Publication } = await import("../models/Publication.js");

    const [users, articles, books, publications] = await Promise.all([
      User.find({ $or: [{ email: regex }, { username: regex }, { fullName: regex }] }).limit(10).lean(),
      Article.find({ $or: [{ title: regex }, { slug: regex }] }).limit(10).lean(),
      Book.find({ $or: [{ title: regex }, { slug: regex }] }).limit(10).lean(),
      Publication.find({ $or: [{ name: regex }, { title: regex }, { slug: regex }] }).limit(10).lean(),
    ]);

    const results = [
      ...users.map((u: any) => ({
        id: u._id,
        name: u.fullName || u.username || u.email,
        slug: u.email,
        type: "User",
        status: u.role || "user",
        updatedAt: u.updatedAt || u.createdAt,
      })),
      ...articles.map((a: any) => ({
        id: a._id,
        name: a.title,
        slug: a.slug,
        type: "Article",
        status: a.status || "published",
        updatedAt: a.updatedAt || a.createdAt,
      })),
      ...books.map((b: any) => ({
        id: b._id,
        name: b.title,
        slug: b.slug,
        type: "Book",
        status: b.status || "published",
        updatedAt: b.updatedAt || b.createdAt,
      })),
      ...publications.map((p: any) => ({
        id: p._id,
        name: p.name || p.title,
        slug: p.slug,
        type: "Publication",
        status: "active",
        updatedAt: p.updatedAt || p.createdAt,
      })),
    ];

    res.json({
      success: true,
      data: results,
      meta: { total: results.length, page: 1, limit: 50 },
    });
  } catch (err) {
    next(err);
  }
});

// Dynamic Admin Entity GET (Read from MongoDB)
router.get("/:entity", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const entity = String(req.params.entity || "");
    const resolved = await resolveEntityModel(entity);
    let items: any[] = [];
    let total = 0;

    if (resolved) {
      items = await resolved.model.find(resolved.filter).sort({ createdAt: -1 }).limit(50).lean();
      total = await resolved.model.countDocuments(resolved.filter);
      items = items.map((doc: any) => ({
        ...doc,
        id: doc._id.toString(),
        name: doc[resolved.nameField] || doc.name || doc.title || doc.code || doc.username || "Item",
        status: doc.status || (doc.isActive !== undefined ? (doc.isActive ? "Active" : "Inactive") : "Active"),
        updatedAt: doc.updatedAt || doc.createdAt || new Date().toISOString(),
      }));
    } else {
      const { Setting } = await import("../models/Setting.js");
      const customDoc = await Setting.findOne({ key: `entity_${entity}_items` });
      if (customDoc && Array.isArray(customDoc.value)) {
        items = customDoc.value;
        total = items.length;
      }
    }

    res.json({
      data: items,
      meta: {
        page: 1,
        limit: 50,
        total,
        totalPages: Math.ceil(total / 50) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Dynamic Admin Entity POST (Create in MongoDB)
router.post("/:entity", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const entity = String(req.params.entity || "");
    const data = req.body || {};
    const resolved = await resolveEntityModel(entity);
    let created: any = null;

    if (resolved) {
      const docData: any = {
        ...data,
        slug: data.slug || (data.name || data.title ? String(data.name || data.title).toLowerCase().replace(/\s+/g, "-") : `item-${Date.now()}`),
      };
      if (resolved.nameField === "title" && !docData.title) docData.title = data.name || "New Item";
      if (resolved.nameField === "name" && !docData.name) docData.name = data.title || "New Item";
      if (resolved.defaultStatus && !docData.status) docData.status = resolved.defaultStatus;

      const newDoc = await resolved.model.create(docData);
      created = newDoc.toObject ? newDoc.toObject() : newDoc;
      created.id = created._id ? created._id.toString() : String(Date.now());
      created.name = created[resolved.nameField] || created.name || created.title;
    } else {
      const { Setting } = await import("../models/Setting.js");
      const key = `entity_${entity}_items`;
      const doc = await Setting.findOne({ key });
      const current = doc ? (doc.value || []) : [];
      const newItem = {
        id: String(Date.now()),
        name: data.name || data.title || "New Item",
        slug: data.slug || `item-${Date.now()}`,
        status: data.status || "Active",
        updatedAt: new Date().toISOString(),
        ...data,
      };
      const updated = [newItem, ...current];
      await Setting.findOneAndUpdate({ key }, { value: updated, type: "json" }, { upsert: true });
      created = newItem;
    }

    res.json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

// Dynamic Admin Entity PUT (Update in MongoDB)
router.put("/:entity/:id", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const entity = String(req.params.entity || "");
    const id = String(req.params.id || "");
    const data = req.body || {};
    const resolved = await resolveEntityModel(entity);
    let updated: any = null;

    if (resolved && id.match(/^[0-9a-fA-F]{24}$/)) {
      const doc = await resolved.model.findByIdAndUpdate(id, data, { new: true }).lean();
      if (doc) {
        updated = {
          ...doc,
          id: (doc as any)._id.toString(),
          name: (doc as any)[resolved.nameField] || (doc as any).name || (doc as any).title,
        };
      }
    }

    if (!updated) {
      const { Setting } = await import("../models/Setting.js");
      const key = `entity_${entity}_items`;
      const doc = await Setting.findOne({ key });
      if (doc && Array.isArray(doc.value)) {
        const current: any[] = doc.value;
        const idx = current.findIndex((item) => String(item.id || item._id) === String(id));
        if (idx !== -1) {
          current[idx] = { ...current[idx], ...data, updatedAt: new Date().toISOString() };
          await Setting.findOneAndUpdate({ key }, { value: current, type: "json" });
          updated = current[idx];
        }
      }
    }

    res.json({ success: true, data: updated || { id, ...data } });
  } catch (err) {
    next(err);
  }
});

// Dynamic Admin Entity DELETE (Delete from MongoDB)
router.delete("/:entity/:id", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const entity = String(req.params.entity || "");
    const id = String(req.params.id || "");
    const resolved = await resolveEntityModel(entity);

    if (resolved) {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        await resolved.model.findByIdAndDelete(id);
      }
      await resolved.model.deleteMany({
        $or: [
          ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
          { slug: id },
          { name: id },
          { title: id },
        ],
      });
    } else {
      const { Setting } = await import("../models/Setting.js");
      const key = `entity_${entity}_items`;
      const doc = await Setting.findOne({ key });
      if (doc && Array.isArray(doc.value)) {
        const filtered = doc.value.filter((item: any) => String(item.id || item._id || item.slug) !== String(id));
        await Setting.findOneAndUpdate({ key }, { value: filtered, type: "json" });
      }
    }

    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
