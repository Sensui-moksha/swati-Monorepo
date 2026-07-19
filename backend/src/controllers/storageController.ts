import { Request, Response, NextFunction } from "express";
import { storageService } from "../services/StorageService";
import { ApiError } from "../middleware/errorHandler";
import { PaginationOptions } from "../repositories/BaseRepository";
import { SearchFilter } from "../repositories/MetadataRepository";

export class StorageController {
  // Folder management
  async createFolder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path, name, type, parentId, metadata } = req.body;

      if (!path || !name || !type) {
        throw new ApiError(400, "Path, name, and type are required");
      }

      const folder = await storageService.createFolder({
        path,
        name,
        type,
        parentId,
        metadata,
      });
      res.status(201).json({ success: true, data: folder });
    } catch (error) {
      next(error);
    }
  }

  async getFolder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError(400, "Folder ID is required");
      const folder = await storageService.getFolder(id);
      res.json({ success: true, data: folder });
    } catch (error) {
      next(error);
    }
  }

  async getFolderByPath(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = req.params;
      if (!path) throw new ApiError(400, "Path is required");
      const folder = await storageService.getFolderByPath(path);
      if (!folder) {
        throw new ApiError(404, "Folder not found");
      }
      res.json({ success: true, data: folder });
    } catch (error) {
      next(error);
    }
  }

  async updateFolder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError(400, "Folder ID is required");
      const { name, type, status, parentId, metadata } = req.body;

      const folder = await storageService.updateFolder(id, {
        name,
        type,
        status,
        parentId,
        metadata,
      });
      res.json({ success: true, data: folder });
    } catch (error) {
      next(error);
    }
  }

  async deleteFolder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError(400, "Folder ID is required");
      const { recursive } = req.query;

      await storageService.deleteFolder(id, recursive === "true");
      res.json({ success: true, message: "Folder deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async moveFolder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError(400, "Folder ID is required");
      const { destinationPath } = req.body;

      if (!destinationPath) {
        throw new ApiError(400, "Destination path is required");
      }

      const folder = await storageService.moveFolder(id, destinationPath);
      res.json({ success: true, data: folder });
    } catch (error) {
      next(error);
    }
  }

  async renameFolder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError(400, "Folder ID is required");
      const { newName } = req.body;

      if (!newName) {
        throw new ApiError(400, "New name is required");
      }

      const folder = await storageService.renameFolder(id, newName);
      res.json({ success: true, data: folder });
    } catch (error) {
      next(error);
    }
  }

  async getFolderTree(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { rootPath } = req.query;
      const tree = await storageService.getFolderTree(rootPath as string);
      res.json({ success: true, data: tree });
    } catch (error) {
      next(error);
    }
  }

  async listFolderContents(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = _req.params as { path: string };
      const { recursive, includeFiles, includeFolders } = _req.query;

      const contents = await storageService.listFolderContents(path, {
        recursive: recursive === "true",
        includeFiles: includeFiles !== "false",
        includeFolders: includeFolders !== "false",
      });

      res.json({ success: true, data: contents });
    } catch (error) {
      next(error);
    }
  }

  // Storage statistics
  async getStorageStats(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const path = (_req.query.path as string) ?? "";
      const stats = await storageService.getStorageStats(path);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getFolderSize(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = _req.params as { path: string };
      const size = await storageService.getFolderSize(path);
      res.json({ success: true, data: size });
    } catch (error) {
      next(error);
    }
  }

  // Browse and search
  async browseStorage(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filter: SearchFilter = _req.query;
      const options: PaginationOptions = {
        page: parseInt(_req.query.page as string) || 1,
        limit: parseInt(_req.query.limit as string) || 20,
        sort: _req.query.sort as any,
      };

      const result = await storageService.browseStorage(filter, options);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async searchStorage(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { q } = _req.query;
      const filter: Omit<SearchFilter, "query"> = _req.query;
      const options: PaginationOptions = {
        page: parseInt(_req.query.page as string) || 1,
        limit: parseInt(_req.query.limit as string) || 20,
        sort: _req.query.sort as any,
      };

      if (!q) {
        throw new ApiError(400, "Search query is required");
      }

      const result = await storageService.searchStorage(
        q as string,
        filter,
        options,
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getFacets(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const facets = await storageService.getFacets();
      res.json({ success: true, data: facets });
    } catch (error) {
      next(error);
    }
  }

  async getSuggestions(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { field, prefix, limit } = _req.query;

      if (!field || !prefix) {
        throw new ApiError(400, "Field and prefix are required");
      }

      const suggestions = await storageService.getSuggestions(
        field as string,
        prefix as string,
        parseInt(limit as string) || 10,
      );

      res.json({ success: true, data: suggestions });
    } catch (error) {
      next(error);
    }
  }

  // Import and sync
  async importFolder(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { sourcePath, type, parentId, metadata, recursive, overwrite } =
        _req.body;

      if (!sourcePath || !type) {
        throw new ApiError(400, "Source path and type are required");
      }

      const result = await storageService.importFolder({
        sourcePath,
        type,
        parentId,
        metadata,
        recursive,
        overwrite,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async fullReindex(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await storageService.fullReindex();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async partialReindex(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { paths } = req.body;

      if (!paths || !Array.isArray(paths) || paths.length === 0) {
        throw new ApiError(400, "Paths array is required");
      }

      const result = await storageService.partialReindex(paths);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async repairMetadata(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await storageService.repairMetadata();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // File operations
  async streamFile(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = _req.params as { path: string };
      const { start, end } = _req.query;

      const stream = await storageService.streamFile(path, {
        start: start ? parseInt(start as string) : undefined,
        end: end ? parseInt(end as string) : undefined,
      });

      res.setHeader("Content-Type", "application/octet-stream");
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  async downloadFile(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = _req.params as { path: string };
      const { start, end } = _req.query;

      const stream = await storageService.downloadFile(path, {
        start: start ? parseInt(start as string) : undefined,
        end: end ? parseInt(end as string) : undefined,
      });

      const filename = path.split("/").pop() || "download";
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader("Content-Type", "application/octet-stream");
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  async uploadFile(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!_req.file) {
        throw new ApiError(400, "No file uploaded");
      }

      const { path, overwrite } = _req.body;

      if (!path) {
        throw new ApiError(400, "Destination path is required");
      }

      const result = await storageService.uploadFile(_req.file.buffer, {
        path,
        overwrite: overwrite === "true",
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = _req.params as { path: string };
      await storageService.deleteFile(path);
      res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getPublicUrl(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = _req.params as { path: string };
      const url = await storageService.getPublicUrl(path);
      res.json({ success: true, data: { url } });
    } catch (error) {
      next(error);
    }
  }

  async generatePresignedUrl(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = _req.params as { path: string };
      const { expiresIn, method } = _req.query;

      if (!expiresIn) {
        throw new ApiError(400, "ExpiresIn is required");
      }

      const url = await storageService.generatePresignedUrl(
        path,
        parseInt(expiresIn as string),
        method as "GET" | "PUT",
      );

      res.json({ success: true, data: { url } });
    } catch (error) {
      next(error);
    }
  }

  // Checksum operations
  async calculateChecksum(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = _req.params as { path: string };
      const { algorithm } = _req.query;

      const checksum = await storageService.calculateChecksum(
        path,
        (algorithm as string) ?? "",
      );
      res.json({ success: true, data: { checksum } });
    } catch (error) {
      next(error);
    }
  }

  async verifyChecksum(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = _req.params as { path: string };
      const { checksum, algorithm } = _req.body;

      if (!checksum) {
        throw new ApiError(400, "Checksum is required");
      }

      const isValid = await storageService.verifyChecksum(
        path,
        checksum,
        algorithm,
      );
      res.json({ success: true, data: { valid: isValid } });
    } catch (error) {
      next(error);
    }
  }

  // Detection operations
  async detectMissingFiles(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const missing = await storageService.detectMissingFiles();
      res.json({ success: true, data: missing });
    } catch (error) {
      next(error);
    }
  }

  async detectDuplicateFiles(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const duplicates = await storageService.detectDuplicateFiles();
      res.json({ success: true, data: duplicates });
    } catch (error) {
      next(error);
    }
  }
}

export const storageController = new StorageController();
