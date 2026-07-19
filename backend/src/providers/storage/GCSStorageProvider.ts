import { Storage, Bucket, File } from '@google-cloud/storage';
import { Readable } from 'stream';
import * as path from 'path';
import {
  StorageProvider,
  StorageFile,
  StorageFolder,
  StorageStats,
  StorageUploadOptions,
  StorageDownloadOptions,
  StorageListOptions,
  StorageWatchOptions,
  StorageWatcher,
  StorageEvent,
  StoragePresignedUrlOptions,
  ExistsOptions,
  GetFileOptions,
  GetFolderOptions,
  GetStatsOptions,
  CreateFolderOptions,
  DeleteFolderOptions,
  RenameFolderOptions,
  MoveFolderOptions,
  CopyFolderOptions,
  DeleteFileOptions,
  RenameFileOptions,
  MoveFileOptions,
  CopyFileOptions,
  GetChecksumOptions,
  VerifyChecksumOptions,
  GetPublicUrlOptions,
} from './StorageProvider';

export class GCSStorageProvider implements StorageProvider {
  readonly name = 'gcs';
  readonly type = 'gcs' as const;
  private bucket!: Bucket;
  private initialized = false;

  async initialize(config: Record<string, any>): Promise<void> {
    const storage = new Storage({ projectId: config.projectId, keyFilename: config.keyFilename });
    this.bucket = storage.bucket(config.bucketName);
    this.initialized = true;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.bucket.exists();
      return true;
    } catch {
      return false;
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('GCSStorageProvider not initialized. Call initialize() first.');
    }
  }

  private getObjectName(filePath: string): string {
    return filePath.replace(/^\/+/, '');
  }

  private mapGcsFile(file: File, prefix: string): StorageFile {
    const name = file.name;
    const relativePath = prefix ? name.replace(prefix, '').replace(/^\/+/, '') : name;
    return {
      path: relativePath,
      name: path.basename(name),
      size: parseInt((file.metadata as any).size || '0', 10),
      lastModified: new Date((file.metadata as any).updated || Date.now()),
      mimeType: (file.metadata as any).contentType || this.getMimeType(name),
      checksum: (file.metadata as any).md5Hash,
    };
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf',
      '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav', '.txt': 'text/plain', '.json': 'application/json',
      '.xml': 'application/xml', '.zip': 'application/zip', '.epub': 'application/epub+zip',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  async exists(options: ExistsOptions): Promise<boolean> {
    this.ensureInitialized();
    const [exists] = await this.bucket.file(this.getObjectName(options.path)).exists();
    return exists;
  }

  async getFile(options: GetFileOptions): Promise<StorageFile | null> {
    this.ensureInitialized();
    try {
      const file = this.bucket.file(this.getObjectName(options.path));
      const [exists] = await file.exists();
      if (!exists) return null;
      await file.getMetadata();
      return this.mapGcsFile(file, '');
    } catch {
      return null;
    }
  }

  async getFolder(options: GetFolderOptions): Promise<StorageFolder | null> {
    this.ensureInitialized();
    const { files, folders } = await this.list({ path: options.path });
    return {
      path: options.path,
      name: path.basename(options.path) || 'root',
      children: folders,
      files,
      size: files.reduce((s, f) => s + f.size, 0),
      fileCount: files.length,
      folderCount: folders.length,
      lastModified: new Date(),
    };
  }

  async createFolder(options: CreateFolderOptions): Promise<void> {
    this.ensureInitialized();
    const objectName = this.getObjectName(options.path);
    const normalizedName = objectName.endsWith('/') ? objectName : objectName + '/';
    await this.bucket.file(normalizedName).save(Buffer.from(''));
  }

  async list(options: StorageListOptions = {}): Promise<{ files: StorageFile[]; folders: StorageFolder[] }> {
    this.ensureInitialized();
    const prefix = options.path ? this.getObjectName(options.path) : '';
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : prefix + '/') : '';

    const [gcsFiles] = await this.bucket.getFiles({
      prefix: normalizedPrefix,
      delimiter: '/',
      maxResults: options.maxKeys || options.limit,
    });

    const resultFiles: StorageFile[] = [];
    const resultFolders: StorageFolder[] = [];

    for (const file of gcsFiles) {
      if (file.name.endsWith('/')) {
        const relPath = file.name.replace(normalizedPrefix, '').replace(/\/$/, '');
        resultFolders.push({
          path: relPath,
          name: path.basename(relPath),
          children: [],
          files: [],
          size: 0,
          fileCount: 0,
          folderCount: 0,
          lastModified: new Date(),
        });
      } else {
        resultFiles.push(this.mapGcsFile(file, normalizedPrefix));
      }
    }

    return { files: resultFiles, folders: resultFolders };
  }

  async getStats(options: GetStatsOptions): Promise<StorageStats> {
    this.ensureInitialized();
    const prefix = options.path ? this.getObjectName(options.path) : '';
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : prefix + '/') : '';

    let totalSize = 0;
    let fileCount = 0;
    let folderCount = 0;

    const [gcsFiles] = await this.bucket.getFiles({ prefix: normalizedPrefix, delimiter: '/' });
    for (const file of gcsFiles) {
      if (file.name.endsWith('/')) {
        folderCount++;
      } else {
        fileCount++;
        totalSize += parseInt((file.metadata as any).size || '0', 10);
      }
    }

    return { totalSize, fileCount, folderCount };
  }

  async upload(filePath: string, data: Buffer | Readable, options: StorageUploadOptions = {}): Promise<StorageFile> {
    this.ensureInitialized();
    const objectName = this.getObjectName(filePath);
    const file = this.bucket.file(objectName);

    const uploadOptions: any = {
      metadata: {
        contentType: options.mimeType || this.getMimeType(filePath),
        cacheControl: options.cacheControl,
        contentDisposition: options.contentDisposition,
        metadata: options.metadata,
      },
    };

    if (data instanceof Buffer) {
      await file.save(data, uploadOptions);
    } else {
      await new Promise<void>((resolve, reject) => {
        const stream = file.createWriteStream(uploadOptions);
        (data as NodeJS.ReadableStream).pipe(stream);
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
    }

    await file.getMetadata();
    return this.mapGcsFile(file, '');
  }

  async download(filePath: string, options: StorageDownloadOptions = {}): Promise<Readable> {
    this.ensureInitialized();
    const file = this.bucket.file(this.getObjectName(filePath));
    const downloadOptions: any = {};
    if (options.range) {
      downloadOptions.start = options.range.start;
      downloadOptions.end = options.range.end;
    }
    return file.createReadStream(downloadOptions);
  }

  async stream(filePath: string, options?: StorageDownloadOptions): Promise<Readable> {
    return this.download(filePath, options);
  }

  async delete(options: DeleteFileOptions): Promise<void> {
    this.ensureInitialized();
    await this.bucket.file(this.getObjectName(options.path)).delete({ ignoreNotFound: true });
  }

  async rename(options: RenameFileOptions): Promise<void> {
    this.ensureInitialized();
    const src = this.bucket.file(this.getObjectName(options.oldPath));
    const dst = this.bucket.file(this.getObjectName(options.newPath));
    await dst.copy(src);
    await src.delete({ ignoreNotFound: true });
  }

  async move(options: MoveFileOptions): Promise<void> {
    await this.rename({ oldPath: options.sourcePath, newPath: options.destinationPath });
  }

  async copy(options: CopyFileOptions): Promise<void> {
    this.ensureInitialized();
    const src = this.bucket.file(this.getObjectName(options.sourcePath));
    const dst = this.bucket.file(this.getObjectName(options.destinationPath));
    await dst.copy(src);
  }

  async deleteFolder(options: DeleteFolderOptions): Promise<void> {
    this.ensureInitialized();
    const prefix = this.getObjectName(options.path);
    const normalizedPrefix = prefix.endsWith('/') ? prefix : prefix + '/';
    const [gcsFiles] = await this.bucket.getFiles({ prefix: normalizedPrefix });
    await Promise.all(gcsFiles.map(f => f.delete({ ignoreNotFound: true })));
  }

  async renameFolder(options: RenameFolderOptions): Promise<void> {
    await this.copyFolder({ sourcePath: options.sourcePath, destinationPath: options.destinationPath });
    await this.deleteFolder({ path: options.sourcePath });
  }

  async moveFolder(options: MoveFolderOptions): Promise<void> {
    await this.renameFolder({ sourcePath: options.sourcePath, destinationPath: options.destinationPath });
  }

  async copyFolder(options: CopyFolderOptions): Promise<void> {
    this.ensureInitialized();
    const srcPrefix = this.getObjectName(options.sourcePath);
    const dstPrefix = this.getObjectName(options.destinationPath);
    const normalizedSrc = srcPrefix.endsWith('/') ? srcPrefix : srcPrefix + '/';
    const [gcsFiles] = await this.bucket.getFiles({ prefix: normalizedSrc });
    await Promise.all(gcsFiles.map(async f => {
      const newName = dstPrefix + '/' + f.name.slice(srcPrefix.length);
      const dst = this.bucket.file(newName);
      await dst.copy(f);
    }));
  }

  async getChecksum(options: GetChecksumOptions): Promise<string> {
    this.ensureInitialized();
    const file = this.bucket.file(this.getObjectName(options.path));
    const [metadata] = await file.getMetadata();
    return (metadata as any).md5Hash || '';
  }

  async verifyChecksum(options: VerifyChecksumOptions): Promise<boolean> {
    const actual = await this.getChecksum({ path: options.path, algorithm: 'md5' });
    return actual === options.expectedChecksum;
  }

  async getPresignedUrl(options: StoragePresignedUrlOptions): Promise<string> {
    this.ensureInitialized();
    const file = this.bucket.file(this.getObjectName(options.path));
    const expires = Date.now() + (options.expiresIn || 3600) * 1000;
    const [url] = await file.getSignedUrl({
      action: options.method === 'PUT' ? 'write' : 'read',
      expires,
    });
    return url;
  }

  async getPublicUrl(options: GetPublicUrlOptions): Promise<string> {
    this.ensureInitialized();
    const file = this.bucket.file(this.getObjectName(options.path));
    return file.publicUrl();
  }

  async watch(_path: string, _options: StorageWatchOptions, _callback: (event: StorageEvent) => void): Promise<StorageWatcher> {
    this.ensureInitialized();
    const watcherId = `gcs-watcher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { id: watcherId, path: _path, async close() { /* no-op */ } };
  }

  async unwatch(_watcher: StorageWatcher): Promise<void> {
    // no-op for GCS
  }
}