import { createReadStream, createWriteStream, statSync, existsSync, mkdirSync, readdirSync, rmSync, renameSync, copyFileSync, unlinkSync } from 'fs';
import { join, relative, dirname, basename, extname } from 'path';
import { createHash } from 'crypto';
import { Readable } from 'stream';
import { StorageProvider, StorageFile, StorageFolder, StorageStats, StorageListOptions, StorageUploadOptions, StorageDownloadOptions, StorageWatchOptions, StoragePresignedUrlOptions, StorageEvent, StorageWatcher, ExistsOptions, GetFileOptions, GetFolderOptions, GetStatsOptions, CreateFolderOptions, DeleteFolderOptions, RenameFolderOptions, MoveFolderOptions, CopyFolderOptions, DeleteFileOptions, RenameFileOptions, MoveFileOptions, CopyFileOptions, GetChecksumOptions, VerifyChecksumOptions, GetPublicUrlOptions } from './StorageProvider';

export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local';
  readonly type = 'local' as const;

  private rootPath: string = '';
  private watchers: Map<string, { watcher: any; callback: (event: StorageEvent) => void }> = new Map();

  async initialize(config: Record<string, any>): Promise<void> {
    this.rootPath = config.rootPath || process.cwd();
    
    if (!existsSync(this.rootPath)) {
      mkdirSync(this.rootPath, { recursive: true });
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      return existsSync(this.rootPath);
    } catch {
      return false;
    }
  }

  private resolvePath(path: string): string {
    const resolved = join(this.rootPath, path);
    if (!resolved.startsWith(this.rootPath)) {
      throw new Error('Path traversal attempt detected');
    }
    return resolved;
  }

  private getRelativePath(absolutePath: string): string {
    return relative(this.rootPath, absolutePath);
  }

  async exists(options: ExistsOptions): Promise<boolean> {
    try {
      return existsSync(this.resolvePath(options.path));
    } catch {
      return false;
    }
  }

  async getFile(options: GetFileOptions): Promise<StorageFile | null> {
    try {
      const { path } = options;
      const absolutePath = this.resolvePath(path);
      if (!existsSync(absolutePath)) return null;
      
      const stats = statSync(absolutePath);
      if (!stats.isFile()) return null;

      return {
        path,
        name: basename(path),
        size: stats.size,
        lastModified: stats.mtime,
        mimeType: this.getMimeType(path),
      };
    } catch {
      return null;
    }
  }

  async getFolder(options: GetFolderOptions): Promise<StorageFolder | null> {
    try {
      const { path } = options;
      const absolutePath = this.resolvePath(path);
      if (!existsSync(absolutePath)) return null;
      
      const stats = statSync(absolutePath);
      if (!stats.isDirectory()) return null;

      return this.buildFolderTree(absolutePath, path);
    } catch {
      return null;
    }
  }

  private buildFolderTree(absolutePath: string, relativePath: string): StorageFolder {
    const entries = readdirSync(absolutePath, { withFileTypes: true });
    const children: StorageFolder[] = [];
    const files: StorageFile[] = [];
    let totalSize = 0;
    let fileCount = 0;
    let lastModified = new Date(0);

    for (const entry of entries) {
      const entryPath = join(absolutePath, entry.name);
      const entryRelativePath = join(relativePath, entry.name);
      const entryStats = statSync(entryPath);

      if (entryStats.mtime > lastModified) {
        lastModified = entryStats.mtime;
      }

      if (entry.isDirectory()) {
        const childFolder = this.buildFolderTree(entryPath, entryRelativePath);
        children.push(childFolder);
        totalSize += childFolder.size;
        fileCount += childFolder.fileCount;
      } else if (entry.isFile()) {
        const file: StorageFile = {
          path: entryRelativePath,
          name: basename(entryRelativePath),
          size: entryStats.size,
          lastModified: entryStats.mtime,
          mimeType: this.getMimeType(entryRelativePath),
        };
        files.push(file);
        totalSize += entryStats.size;
        fileCount++;
      }
    }

    return {
      path: relativePath,
      name: basename(relativePath) || 'root',
      children,
      files,
      size: totalSize,
      fileCount,
      folderCount: children.length,
      lastModified,
    };
  }

  async list(options: StorageListOptions): Promise<{ files: StorageFile[]; folders: StorageFolder[] }> {
    const path = options.path || '';
    const absolutePath = this.resolvePath(path);
    
    if (!existsSync(absolutePath)) {
      return { files: [], folders: [] };
    }

    const stats = statSync(absolutePath);
    
    if (stats.isFile()) {
      const file = await this.getFile({ path });
      return { files: file ? [file] : [], folders: [] };
    }

    const folder = await this.getFolder({ path });
    if (!folder) return { files: [], folders: [] };

    if (options.recursive) {
      const allFiles: StorageFile[] = [];
      const allFolders: StorageFolder[] = [];
      
      const collect = (f: StorageFolder) => {
        allFolders.push(f);
        allFiles.push(...f.files);
        for (const child of f.children) {
          collect(child);
        }
      };
      
      collect(folder);
      return { files: allFiles, folders: allFolders };
    }

    return { files: folder.files, folders: folder.children };
  }

  async getStats(options: GetStatsOptions): Promise<StorageStats> {
    const path = options.path || '';
    const targetPath = path ? this.resolvePath(path) : this.rootPath;
    
    if (!existsSync(targetPath)) {
      return { totalSize: 0, fileCount: 0, folderCount: 0 };
    }

    const stats = statSync(targetPath);
    
    if (stats.isFile()) {
      return { totalSize: stats.size, fileCount: 1, folderCount: 0 };
    }

    const folder = this.buildFolderTree(targetPath, path || '');
    return {
      totalSize: folder.size,
      fileCount: folder.fileCount,
      folderCount: this.countFolders(folder),
    };
  }

  private countFolders(folder: StorageFolder): number {
    let count = 1;
    for (const child of folder.children) {
      count += this.countFolders(child);
    }
    return count;
  }

  async createFolder(options: CreateFolderOptions): Promise<void> {
    const absolutePath = this.resolvePath(options.path);
    mkdirSync(absolutePath, { recursive: true });
  }

  async deleteFolder(options: DeleteFolderOptions): Promise<void> {
    const { path, recursive } = options;
    const absolutePath = this.resolvePath(path);
    
    if (!existsSync(absolutePath)) {
      if (!recursive) {
        throw new Error(`Folder not found: ${path}`);
      }
      return;
    }

    rmSync(absolutePath, { recursive: recursive ?? true, force: true });
  }

  async renameFolder(options: RenameFolderOptions): Promise<void> {
    const { sourcePath, destinationPath } = options;
    const sourceAbsolute = this.resolvePath(sourcePath);
    const destAbsolute = this.resolvePath(destinationPath);
    
    if (!existsSync(sourceAbsolute)) {
      throw new Error(`Source folder not found: ${sourcePath}`);
    }
    
    if (existsSync(destAbsolute)) {
      throw new Error(`Destination folder already exists: ${destinationPath}`);
    }

    mkdirSync(dirname(destAbsolute), { recursive: true });
    renameSync(sourceAbsolute, destAbsolute);
  }

  async moveFolder(options: MoveFolderOptions): Promise<void> {
    const { sourcePath, destinationPath } = options;
    await this.renameFolder({ sourcePath, destinationPath });
  }

  async copyFolder(options: CopyFolderOptions): Promise<void> {
    const { sourcePath, destinationPath, overwrite } = options;
    const sourceAbsolute = this.resolvePath(sourcePath);
    const destAbsolute = this.resolvePath(destinationPath);
    
    if (!existsSync(sourceAbsolute)) {
      throw new Error(`Source folder not found: ${sourcePath}`);
    }
    
    if (existsSync(destAbsolute) && !overwrite) {
      throw new Error(`Destination folder already exists: ${destinationPath}`);
    }

    this.copyFolderRecursive(sourceAbsolute, destAbsolute);
  }

  private copyFolderRecursive(source: string, destination: string): void {
    mkdirSync(destination, { recursive: true });
    const entries = readdirSync(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = join(source, entry.name);
      const destPath = join(destination, entry.name);
      
      if (entry.isDirectory()) {
        this.copyFolderRecursive(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  }

  async upload(filePath: string, data: Buffer | Readable, options?: StorageUploadOptions): Promise<StorageFile> {
    const absolutePath = this.resolvePath(filePath);
    const dir = dirname(absolutePath);
    
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (existsSync(absolutePath)) {
      throw new Error(`File already exists: ${filePath}`);
    }

    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(absolutePath);
      
      const dataStream = data instanceof Buffer ? Readable.from(data) : data;
      (dataStream as Readable).pipe(writeStream);

      writeStream.on('finish', async () => {
        const stats = statSync(absolutePath);
        const checksum = await this.getChecksum({ path: filePath, algorithm: 'sha256' });
        resolve({
          path: filePath,
          name: basename(filePath),
          size: stats.size,
          lastModified: stats.mtime,
          checksum,
          mimeType: options?.mimeType || this.getMimeType(filePath),
        });
      });

      writeStream.on('error', reject);
    });
  }

  async download(filePath: string, options?: StorageDownloadOptions): Promise<Readable> {
    const absolutePath = this.resolvePath(filePath);
    
    if (!existsSync(absolutePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const { range } = options || {};
    const { start, end } = range || {};
    
    return createReadStream(absolutePath, { start, end });
  }

  async stream(filePath: string, options?: StorageDownloadOptions): Promise<Readable> {
    return this.download(filePath, options);
  }

  async delete(options: DeleteFileOptions): Promise<void> {
    const { path } = options;
    const absolutePath = this.resolvePath(path);
    
    if (!existsSync(absolutePath)) {
      throw new Error(`File not found: ${path}`);
    }

    unlinkSync(absolutePath);
  }

  async rename(options: RenameFileOptions): Promise<void> {
    const { oldPath, newPath } = options;
    const sourceAbsolute = this.resolvePath(oldPath);
    const destAbsolute = this.resolvePath(newPath);
    
    if (!existsSync(sourceAbsolute)) {
      throw new Error(`Source file not found: ${oldPath}`);
    }
    
    if (existsSync(destAbsolute)) {
      throw new Error(`Destination file already exists: ${newPath}`);
    }

    mkdirSync(dirname(destAbsolute), { recursive: true });
    renameSync(sourceAbsolute, destAbsolute);
  }

  async move(options: MoveFileOptions): Promise<void> {
    const { sourcePath, destinationPath } = options;
    await this.rename({ oldPath: sourcePath, newPath: destinationPath });
  }

  async copy(options: CopyFileOptions): Promise<void> {
    const { sourcePath, destinationPath, overwrite } = options;
    const sourceAbsolute = this.resolvePath(sourcePath);
    const destAbsolute = this.resolvePath(destinationPath);
    
    if (!existsSync(sourceAbsolute)) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }
    
    if (existsSync(destAbsolute) && !overwrite) {
      throw new Error(`Destination file already exists: ${destinationPath}`);
    }

    mkdirSync(dirname(destAbsolute), { recursive: true });
    copyFileSync(sourceAbsolute, destAbsolute);
  }

  async getChecksum(options: GetChecksumOptions): Promise<string> {
    const { path, algorithm } = options;
    const absolutePath = this.resolvePath(path);
    
    if (!existsSync(absolutePath)) {
      throw new Error(`File not found: ${path}`);
    }

    const hash = createHash(algorithm);
    const stream = createReadStream(absolutePath);

    return new Promise((resolve, reject) => {
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  async verifyChecksum(options: VerifyChecksumOptions): Promise<boolean> {
    const { path, expectedChecksum, algorithm } = options;
    const actualChecksum = await this.getChecksum({ path, algorithm: (algorithm || 'md5') as any });
    return actualChecksum === expectedChecksum;
  }

  async getPresignedUrl(options: StoragePresignedUrlOptions): Promise<string> {
    const baseUrl = process.env.STORAGE_PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
    const path = options.path || '';
    const url = `${baseUrl}/api/v1/storage/files${path}`;
    return url;
  }

  async getPublicUrl(options: GetPublicUrlOptions): Promise<string> {
    const baseUrl = process.env.STORAGE_PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
    return `${baseUrl}/api/v1/storage/files${options.path}`;
  }

  async watch(path: string, options: StorageWatchOptions, callback: (event: StorageEvent) => void): Promise<StorageWatcher> {
    const absolutePath = this.resolvePath(path);
    const watcherId = `watcher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const chokidar = await import('chokidar');
    const watcher = chokidar.default.watch(absolutePath, {
      persistent: true,
      ignoreInitial: true,
      depth: options.recursive ? 10 : 0,
    });

    const eventMap: Record<string, StorageEvent['type']> = {
      add: 'create',
      addDir: 'create',
      unlink: 'delete',
      unlinkDir: 'delete',
      change: 'modify',
    };

    watcher.on('all', (event: string, filePath: string) => {
      const relativePath = this.getRelativePath(filePath);
      const stats = existsSync(filePath) ? statSync(filePath) : null;
      
      const storageEvent: StorageEvent = {
        type: eventMap[event] || 'modify',
        path: relativePath,
        isDirectory: stats?.isDirectory() ?? false,
        timestamp: new Date(),
        size: stats?.size,
      };

      const eventsToWatch = options.events || ['all'];
      if (eventsToWatch.includes(event) || eventsToWatch.includes('all')) {
        callback(storageEvent);
      }
    });

    const storageWatcher: StorageWatcher = {
      id: watcherId,
      path,
      async close() {
        await watcher.close();
      },
    };

    this.watchers.set(watcherId, { watcher, callback });
    return storageWatcher;
  }

  async unwatch(watcher: StorageWatcher): Promise<void> {
    const entry = this.watchers.get(watcher.id);
    if (entry) {
      await entry.watcher.close();
      this.watchers.delete(watcher.id);
    }
  }

  private getMimeType(path: string): string {
    const ext = extname(path).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
      '.epub': 'application/epub+zip',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}