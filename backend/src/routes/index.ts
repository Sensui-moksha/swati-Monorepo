import { Router } from "express";
import authRoutes from "./auth";
import bookmarksRoutes from "./bookmarks";
import favoritesRoutes from "./favorites";
import historyRoutes from "./history";
import progressRoutes from "./progress";
import notesRoutes from "./notes";
import highlightsRoutes from "./highlights";
import notificationsRoutes from "./notifications";
import profileRoutes from "./profile";
import searchRoutes from "./search";
import dashboardRoutes from "./dashboard";
import recommendationsRoutes from "./recommendations";
import articlesRoutes from "./articles";
import newsRoutes from "./news";
import draftsRoutes from "./drafts";
import editorialRoutes from "./editorial";
import mediaRoutes from "./media";
import tagsRoutes from "./tags";
import commentsRoutes from "./comments";
import categoriesRoutes from "./categories";
import publishingRoutes from "./publishing";
import plansRoutes from "./plans";
import subscriptionsRoutes from "./subscriptions";
import ordersRoutes from "./orders";
import paymentsRoutes from "./payments";
import invoicesRoutes from "./invoices";
import couponsRoutes from "./coupons";
import promotionsRoutes from "./promotions";
import webhooksRoutes from "./webhooks";
import reportsRoutes from "./reports";
import accessRoutes from "./access";
import adminRoutes from "./admin";
import analyticsRoutes from "./analytics";
import systemRoutes from "./system";
import storageRoutes from "./storage";
import storageSyncRoutes from "./storageSync";
import filesystemScannerRoutes from "./filesystemScanner";
import filesystemWatcherRoutes from "./filesystemWatcher";

const router = Router();

// API v1 routes
router.use("/auth", authRoutes);

// User Module Routes
router.use("/bookmarks", bookmarksRoutes);
router.use("/favorites", favoritesRoutes);
router.use("/history", historyRoutes);
router.use("/progress", progressRoutes);
router.use("/notes", notesRoutes);
router.use("/highlights", highlightsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/profile", profileRoutes);
router.use("/search", searchRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/recommendations", recommendationsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/articles", articlesRoutes);
router.use("/news", newsRoutes);
router.use("/drafts", draftsRoutes);
router.use("/editorial", editorialRoutes);
router.use("/media", mediaRoutes);
router.use("/storage", storageRoutes);
router.use("/storage/sync", storageSyncRoutes);
router.use("/storage/scanner", filesystemScannerRoutes);
router.use("/storage/watcher", filesystemWatcherRoutes);
router.use("/tags", tagsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/comments", commentsRoutes);
router.use("/", publishingRoutes);
router.use("/publishing", publishingRoutes);

import productsRoutes from "./products";

// Commerce Infrastructure Routes
router.use("/plans", plansRoutes);
router.use("/subscriptions", subscriptionsRoutes);
router.use("/v1/plans", plansRoutes);
router.use("/v1/subscriptions", subscriptionsRoutes);
router.use("/v1/products", productsRoutes);
router.use("/v1/orders", ordersRoutes);
router.use("/v1/payments", paymentsRoutes);
router.use("/v1/invoices", invoicesRoutes);
router.use("/v1/coupons", couponsRoutes);
router.use("/v1/promotions", promotionsRoutes);
router.use("/v1/webhooks", webhooksRoutes);
router.use("/v1/reports", reportsRoutes);
router.use("/v1/access", accessRoutes);
router.use("/v1/admin", adminRoutes);
router.use("/v1/system", systemRoutes);

// Health check / API info
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Prototype v0 API",
    version: "1.0.0",
  });
});

export default router;
