import { EventEmitter } from "events";
import {
  StorageProvider,
  StorageEvent,
  StorageWatcher,
  getStorageProvider,
} from "../providers/storage";
import { storageRepository } from "../repositories/StorageRepository";
import { IStoragePath, StorageType } from "../models/StoragePath";

export interface WatcherConfig {
  paths: string[];
  events: string[];
  recursive: boolean;
  debounceMs: number;
  ignorePatterns: string[];
}

export interface FileChangeEvent {
  type: "create" | "delete" | "rename" | "modify";
  path: string;
  oldPath?: string;
  isDirectory: boolean;
  timestamp: Date;
  size?: number;
}

export class FilesystemWatcherService extends EventEmitter {
  private provider: StorageProvider;
  private watchers: Map<string, StorageWatcher> = new Map();
  private config: WatcherConfig;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private pendingEvents: Map<string, FileChangeEvent[]> = new Map();
  private isRunning = false;

  constructor(config?: Partial<WatcherConfig>) {
    super();
    this.provider = getStorageProvider();

    this.config = {
      paths: config?.paths || [""],
      events: config?.events || ["create", "delete", "rename", "modify"],
      recursive: config?.recursive ?? true,
      debounceMs: config?.debounceMs || 500,
      ignorePatterns: config?.ignorePatterns || [
        "*.tmp",
        "*.temp",
        "*.swp",
        "*.bak",
        ".DS_Store",
        "Thumbs.db",
        "node_modules/**",
        ".git/**",
      ],
    };
  }

  async initialize(): Promise<void> {
    await this.provider.initialize({});
    await this.startWatching();
    this.isRunning = true;
  }

  async startWatching(): Promise<void> {
    for (const path of this.config.paths) {
      await this.watchPath(path);
    }
  }

  async watchPath(path: string): Promise<void> {
    if (this.watchers.has(path)) {
      return; // Already watching
    }

    try {
      const watcher = await this.provider.watch(
        path,
        { path, recursive: this.config.recursive, events: this.config.events },
        this.handleStorageEvent.bind(this),
      );

      this.watchers.set(path, watcher);
      this.emit("watcher:started", { path });
    } catch (error) {
      this.emit("watcher:error", {
        path,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async unwatchPath(path: string): Promise<void> {
    const watcher = this.watchers.get(path);
    if (watcher) {
      await this.provider.unwatch(watcher);
      this.watchers.delete(path);
      this.emit("watcher:stopped", { path });
    }
  }

  private handleStorageEvent(event: StorageEvent): void {
    // Check ignore patterns
    if (this.shouldIgnore(event.path)) {
      return;
    }

    const fileEvent: FileChangeEvent = {
      type: event.type,
      path: event.path,
      isDirectory: event.isDirectory,
      timestamp: event.timestamp,
      size: event.size,
    };

    if (event.oldPath) {
      fileEvent.oldPath = event.oldPath;
    }

    this.debounceEvent(fileEvent);
  }

  private shouldIgnore(path: string): boolean {
    for (const pattern of this.config.ignorePatterns) {
      const regex = this.globToRegex(pattern);
      if (regex.test(path)) {
        return true;
      }
    }
    return false;
  }

  private globToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/\./g, "\\.")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");
    return new RegExp(`^${escaped}$`);
  }

  private debounceEvent(event: FileChangeEvent): void {
    const key = `${event.type}:${event.path}`;

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Add to pending events
    if (!this.pendingEvents.has(key)) {
      this.pendingEvents.set(key, []);
    }
    this.pendingEvents.get(key)!.push(event);

    // Set new timer
    const timer = setTimeout(() => {
      this.processPendingEvents(key);
    }, this.config.debounceMs);

    this.debounceTimers.set(key, timer);
  }

  private async processPendingEvents(key: string): Promise<void> {
    const events = this.pendingEvents.get(key);
    if (!events || events.length === 0) return;

    this.pendingEvents.delete(key);
    this.debounceTimers.delete(key);

    // For now, process the last event (most recent)
    const latestEvent = events[events.length - 1];
    if (!latestEvent) return;

    try {
      await this.processEvent(latestEvent);
    } catch (error) {
      this.emit("event:error", {
        event: latestEvent,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async processEvent(event: FileChangeEvent): Promise<void> {
    this.emit("event:received", event);

    switch (event.type) {
      case "create":
        await this.handleCreate(event);
        break;
      case "delete":
        await this.handleDelete(event);
        break;
      case "rename":
        await this.handleRename(event);
        break;
      case "modify":
        await this.handleModify(event);
        break;
    }

    this.emit("event:processed", event);
  }

  private async handleCreate(event: FileChangeEvent): Promise<void> {
    const existing = await storageRepository.findByRelativePath(event.path);

    if (existing) {
      // Update existing record
      await storageRepository.updateById(existing._id, {
        status: "active",
        lastModified: event.timestamp,
        size: event.size || 0,
        lastScanned: new Date(),
      });
      this.emit("file:updated", { path: event.path, record: existing });
    } else {
      // Create new record
      const type = this.inferTypeFromPath(event.path);
      const name = event.path.split("/").pop() || event.path;
      const parentPath = event.path.substring(0, event.path.lastIndexOf("/"));
      const parent = parentPath
        ? await storageRepository.findByRelativePath(parentPath)
        : null;

      const newRecord: Partial<IStoragePath> = {
        path: event.path,
        relativePath: event.path,
        type,
        name,
        parentId: parent?._id,
        depth: (parent?.depth || 0) + 1,
        status: "active",
        size: event.size || 0,
        fileCount: event.isDirectory ? 0 : 1,
        folderCount: event.isDirectory ? 1 : 0,
        lastModified: event.timestamp,
        lastScanned: new Date(),
        metadata: {},
      };

      const created = await storageRepository.create(newRecord);
      this.emit("file:created", { path: event.path, record: created });
    }
  }

  private async handleDelete(event: FileChangeEvent): Promise<void> {
    const existing = await storageRepository.findByRelativePath(event.path);

    if (existing) {
      if (event.isDirectory) {
        // Soft delete folder and all children
        await this.softDeleteRecursive(existing);
      } else {
        await storageRepository.softDelete(existing._id);
      }
      this.emit("file:deleted", { path: event.path, record: existing });
    }
  }

  private async softDeleteRecursive(folder: IStoragePath): Promise<void> {
    const children = await storageRepository.findByParent(folder._id);

    for (const child of children) {
      await this.softDeleteRecursive(child);
    }

    await storageRepository.softDelete(folder._id);
  }

  private async handleRename(event: FileChangeEvent): Promise<void> {
    if (!event.oldPath) return;

    const existing = await storageRepository.findByRelativePath(event.oldPath);

    if (existing) {
      const newName = event.path.split("/").pop() || event.path;
      const newRelativePath = event.path;
      const newAbsolutePath = event.path;

      await storageRepository.updateById(existing._id, {
        path: newAbsolutePath,
        relativePath: newRelativePath,
        name: newName,
        lastModified: event.timestamp,
        lastScanned: new Date(),
      });

      // Update children paths if it's a directory
      if (event.isDirectory) {
        await this.updateChildrenPaths(existing, newRelativePath);
      }

      this.emit("file:renamed", {
        oldPath: event.oldPath,
        newPath: event.path,
        record: existing,
      });
    }
  }

  private async updateChildrenPaths(
    parent: IStoragePath,
    newParentPath: string,
  ): Promise<void> {
    const children = await storageRepository.findByParent(parent._id);

    for (const child of children) {
      const newRelativePath = `${newParentPath}/${child.name}`;
      const newAbsolutePath = newRelativePath;

      await storageRepository.updateById(child._id, {
        path: newAbsolutePath,
        relativePath: newRelativePath,
      });

      if (child.folderCount > 0) {
        await this.updateChildrenPaths(child, newRelativePath);
      }
    }
  }

  private async handleModify(event: FileChangeEvent): Promise<void> {
    const existing = await storageRepository.findByRelativePath(event.path);

    if (existing) {
      const checksum = await this.provider.getChecksum({
        path: event.path,
        algorithm: "md5",
      });

      await storageRepository.updateById(existing._id, {
        size: event.size || existing.size,
        lastModified: event.timestamp,
        checksum,
        lastScanned: new Date(),
        status: "active",
      });

      this.emit("file:modified", { path: event.path, record: existing });
    }
  }

  private inferTypeFromPath(path: string): StorageType {
    const lowerPath = path.toLowerCase();
    if (lowerPath.includes("weekly")) return "weekly";
    if (lowerPath.includes("monthly")) return "monthly";
    if (lowerPath.includes("book")) return "books";
    if (lowerPath.includes("article")) return "articles";
    if (lowerPath.includes("media")) return "media";
    return "other";
  }

  async stop(): Promise<void> {
    for (const [, watcher] of this.watchers.entries()) {
      await this.provider.unwatch(watcher);
    }
    this.watchers.clear();

    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    this.pendingEvents.clear();

    this.isRunning = false;
    this.emit("stopped");
  }

  getStatus(): {
    isRunning: boolean;
    watchedPaths: string[];
    pendingEvents: number;
  } {
    return {
      isRunning: this.isRunning,
      watchedPaths: Array.from(this.watchers.keys()),
      pendingEvents: this.pendingEvents.size,
    };
  }

  async forceSync(path: string): Promise<void> {
    const event: FileChangeEvent = {
      type: "modify",
      path,
      isDirectory: false,
      timestamp: new Date(),
    };
    await this.processEvent(event);
  }
}

export const filesystemWatcherService = new FilesystemWatcherService();
