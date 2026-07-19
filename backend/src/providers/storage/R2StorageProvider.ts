import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

export class R2StorageProvider implements StorageProvider {
  readonly name = 'r2';
  readonly type = 'r2' as const;
  private client!: S3Client;
  private bucket!: string;
  private publicUrl?: string;
  private initialized = false;

  async initialize(config: Record<string, any>): Promise<void> {
    this.bucket = config.bucketName;
    this.publicUrl = config.publicUrl;

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    this.initialized = true;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.send(new ListObjectsV2Command({ Bucket: this.bucket, MaxKeys: 1 }));
      return true;
    } catch {
      return false;
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('R2StorageProvider not initialized. Call initialize() first.');
    }
  }

  private getObjectName(filePath: string): string {
    return filePath.replace(/^\/+/, '');
  }

  private mapFile(obj: any, prefix: string): StorageFile {
    const name = obj.Key || '';
    const relativePath = prefix ? name.replace(prefix, '').replace(/^\/+/, '') : name;
    return {
      path: relativePath,
      name: path.basename(name),
      size: obj.Size || 0,
      lastModified: obj.LastModified || new Date(),
      mimeType: obj.ContentType || this.getMimeType(name),
      checksum: obj.ETag?.replace(/"/g, ''),
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
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: this.getObjectName(options.path) }));
      return true;
    } catch {
      return false;
    }
  }

  async getFile(options: GetFileOptions): Promise<StorageFile | null> {
    this.ensureInitialized();
    try {
      const objectName = this.getObjectName(options.path);
      const response = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: objectName }));
      return {
        path: options.path,
        name: path.basename(options.path),
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        mimeType: response.ContentType || this.getMimeType(options.path),
      };
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
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: normalizedName, Body: Buffer.from('') }));
  }

  async list(options: StorageListOptions = {}): Promise<{ files: StorageFile[]; folders: StorageFolder[] }> {
    this.ensureInitialized();
    const prefix = options.path ? this.getObjectName(options.path) : '';
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : prefix + '/') : '';

    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: normalizedPrefix,
      Delimiter: '/',
      MaxKeys: options.maxKeys,
    });

    const response = await this.client.send(command);

    const resultFiles: StorageFile[] = [];
    const resultFolders: StorageFolder[] = [];

    for (const cp of response.CommonPrefixes || []) {
      if (cp.Prefix) {
        resultFolders.push({
          path: cp.Prefix.replace(normalizedPrefix, '').replace(/\/$/, ''),
          name: path.basename(cp.Prefix.replace(/\/$/, '')),
          children: [],
          files: [],
          size: 0,
          fileCount: 0,
          folderCount: 0,
          lastModified: new Date(),
        });
      }
    }

    for (const obj of response.Contents || []) {
      if (obj.Key && !obj.Key.endsWith('/')) {
        resultFiles.push(this.mapFile(obj, normalizedPrefix));
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

    let continuationToken: string | undefined;
    do {
      const response = await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: normalizedPrefix,
        Delimiter: '/',
        ContinuationToken: continuationToken,
      }));

      folderCount += (response.CommonPrefixes || []).length;

      for (const obj of response.Contents || []) {
        if (obj.Key && !obj.Key.endsWith('/')) {
          fileCount++;
          totalSize += obj.Size || 0;
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return { totalSize, fileCount, folderCount };
  }

  async upload(filePath: string, data: Buffer | Readable, options: StorageUploadOptions = {}): Promise<StorageFile> {
    this.ensureInitialized();
    const objectName = this.getObjectName(filePath);

    const uploadParams: any = {
      Bucket: this.bucket,
      Key: objectName,
      Body: data,
      ContentType: options.mimeType || this.getMimeType(filePath),
      CacheControl: options.cacheControl,
      ContentDisposition: options.contentDisposition,
      Metadata: options.metadata,
    };

    if (!(data instanceof Buffer)) {
      const chunks: Buffer[] = [];
      for await (const chunk of data) {
        chunks.push(chunk as Buffer);
      }
      uploadParams.Body = Buffer.concat(chunks);
    }

    await this.client.send(new PutObjectCommand(uploadParams));

    const headResponse = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: objectName }));
    return {
      path: filePath,
      name: path.basename(filePath),
      size: headResponse.ContentLength || 0,
      lastModified: headResponse.LastModified || new Date(),
      mimeType: headResponse.ContentType || this.getMimeType(filePath),
    };
  }

  async download(filePath: string, options: StorageDownloadOptions = {}): Promise<Readable> {
    this.ensureInitialized();
    const objectName = this.getObjectName(filePath);
    const response = await this.client.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectName,
      Range: options.range ? `bytes=${options.range.start}-${options.range.end || ''}` : undefined,
    }));
    return response.Body as Readable;
  }

  async stream(filePath: string, options?: StorageDownloadOptions): Promise<Readable> {
    return this.download(filePath, options);
  }

  async delete(options: DeleteFileOptions): Promise<void> {
    this.ensureInitialized();
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: this.getObjectName(options.path) }));
  }

  async rename(options: RenameFileOptions): Promise<void> {
    this.ensureInitialized();
    const oldKey = this.getObjectName(options.oldPath);
    const newKey = this.getObjectName(options.newPath);
    await this.client.send(new CopyObjectCommand({ Bucket: this.bucket, CopySource: `${this.bucket}/${oldKey}`, Key: newKey }));
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: oldKey }));
  }

  async move(options: MoveFileOptions): Promise<void> {
    await this.rename({ oldPath: options.sourcePath, newPath: options.destinationPath });
  }

  async copy(options: CopyFileOptions): Promise<void> {
    this.ensureInitialized();
    const srcKey = this.getObjectName(options.sourcePath);
    const dstKey = this.getObjectName(options.destinationPath);
    await this.client.send(new CopyObjectCommand({ Bucket: this.bucket, CopySource: `${this.bucket}/${srcKey}`, Key: dstKey }));
  }

  async deleteFolder(options: DeleteFolderOptions): Promise<void> {
    this.ensureInitialized();
    const prefix = this.getObjectName(options.path);
    const normalizedPrefix = prefix.endsWith('/') ? prefix : prefix + '/';
    let continuationToken: string | undefined;
    do {
      const response = await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket, Prefix: normalizedPrefix, ContinuationToken: continuationToken,
      }));
      for (const obj of response.Contents || []) {
        if (obj.Key) {
          await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: obj.Key }));
        }
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
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
    let continuationToken: string | undefined;
    do {
      const response = await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket, Prefix: normalizedSrc, ContinuationToken: continuationToken,
      }));
      for (const obj of response.Contents || []) {
        if (obj.Key) {
          const newKey = dstPrefix + '/' + obj.Key.slice(srcPrefix.length);
          await this.client.send(new CopyObjectCommand({
            Bucket: this.bucket, CopySource: `${this.bucket}/${obj.Key}`, Key: newKey,
          }));
        }
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
  }

  async getChecksum(options: GetChecksumOptions): Promise<string> {
    this.ensureInitialized();
    const response = await this.client.send(new HeadObjectCommand({
      Bucket: this.bucket, Key: this.getObjectName(options.path),
    }));
    return response.ETag?.replace(/"/g, '') || '';
  }

  async verifyChecksum(options: VerifyChecksumOptions): Promise<boolean> {
    const actual = await this.getChecksum({ path: options.path, algorithm: 'md5' });
    return actual === options.expectedChecksum;
  }

  async getPresignedUrl(options: StoragePresignedUrlOptions): Promise<string> {
    this.ensureInitialized();
    const objectName = this.getObjectName(options.path);
    const command = options.method === 'PUT'
      ? new PutObjectCommand({ Bucket: this.bucket, Key: objectName })
      : new GetObjectCommand({ Bucket: this.bucket, Key: objectName });
    return getSignedUrl(this.client, command, { expiresIn: options.expiresIn || 3600 });
  }

  async getPublicUrl(options: GetPublicUrlOptions): Promise<string> {
    this.ensureInitialized();
    const objectName = this.getObjectName(options.path);
    if (this.publicUrl) {
      return `${this.publicUrl}/${objectName}`;
    }
    return this.getPresignedUrl({ path: options.path, method: 'GET', expiresIn: 3600 });
  }

  async watch(_path: string, _options: StorageWatchOptions, _callback: (event: StorageEvent) => void): Promise<StorageWatcher> {
    this.ensureInitialized();
    const watcherId = `r2-watcher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { id: watcherId, path: _path, async close() { /* no-op */ } };
  }

  async unwatch(_watcher: StorageWatcher): Promise<void> {
    // no-op for R2
  }
}