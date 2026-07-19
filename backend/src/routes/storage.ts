import { Router } from "express";
import { storageController } from "../controllers/storageController";
import { authMiddleware } from "../middleware/auth";
import { uploadSingle, handleMulterError } from "../middleware/upload";

const router = Router();

// All storage routes require authentication
router.use(authMiddleware);

// Storage folder management
router.post("/folders", storageController.createFolder);
router.get("/folders/tree", storageController.getFolderTree);
router.get("/folders/:id", storageController.getFolder);
router.get("/folders/path/:path(*)", storageController.getFolderByPath);
router.put("/folders/:id", storageController.updateFolder);
router.delete("/folders/:id", storageController.deleteFolder);
router.post("/folders/:id/move", storageController.moveFolder);
router.post("/folders/:id/rename", storageController.renameFolder);
router.get("/folders/:path(*)/contents", storageController.listFolderContents);

// Storage statistics
router.get("/stats", storageController.getStorageStats);
router.get("/folders/:path(*)/size", storageController.getFolderSize);

// Browse and search
router.get("/browse", storageController.browseStorage);
router.get("/search", storageController.searchStorage);
router.get("/facets", storageController.getFacets);
router.get("/suggestions", storageController.getSuggestions);

// Import and sync
router.post("/import", storageController.importFolder);
router.post("/reindex/full", storageController.fullReindex);
router.post("/reindex/partial", storageController.partialReindex);
router.post("/repair", storageController.repairMetadata);

// File operations
router.get("/files/:path(*)/stream", storageController.streamFile);
router.get("/files/:path(*)/download", storageController.downloadFile);
router.post(
  "/files/upload",
  uploadSingle("file"),
  handleMulterError,
  storageController.uploadFile,
);
router.delete("/files/:path(*)", storageController.deleteFile);
router.get("/files/:path(*)/url", storageController.getPublicUrl);
router.post(
  "/files/:path(*)/presigned-url",
  storageController.generatePresignedUrl,
);

// Checksum operations
router.get("/files/:path(*)/checksum", storageController.calculateChecksum);
router.post(
  "/files/:path(*)/verify-checksum",
  storageController.verifyChecksum,
);

// Detection operations
router.get("/detect/missing", storageController.detectMissingFiles);
router.get("/detect/duplicates", storageController.detectDuplicateFiles);

export default router;
