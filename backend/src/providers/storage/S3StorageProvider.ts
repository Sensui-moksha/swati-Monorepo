import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  _Object,
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

export class S3StorageProvider implements StorageProvider {
  readonly name = 's3';
  readonly type = 's3' as const;
  private client!: S3Client;
  private bucket!: string;
  private initialized = false;

  async initialize(config: Record<string, any>): Promise<void> {
    this.bucket = config.bucket;
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle ?? false,
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
      throw new Error('S3StorageProvider not initialized. Call initialize() first.');
    }
  }

  private getKey(filePath: string): string {
    return filePath.replace(/^\/+/, '');
  }

  private mapS3Object(obj: _Object, prefix: string): StorageFile {
    const key = obj.Key || '';
    const relativePath = prefix ? key.replace(prefix, '').replace(/^\/+/, '') : key;
    return {
      path: relativePath,
      name: path.basename(key),
      size: obj.Size || 0,
      lastModified: obj.LastModified || new Date(),
      mimeType: this.getMimeType(key),
      checksum: obj.ETag?.replace(/"/g, ''),
    };
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
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

  async createFolder(options: CreateFolderOptions): Promise<void> {
    this.ensureInitialized();
    const key = this.getKey(options.path);
    if (!key.endsWith('/')) {
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key + '/',
        Body: '',
      }));
    }
  }

  async list(options: StorageListOptions = {}): Promise<{ files: StorageFile[]; folders: StorageFolder[] }> {
    this.ensureInitialized();
    const prefix = options.path ? this.getKey(options.path) : '';
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : prefix + '/') : '';

    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: normalizedPrefix,
      Delimiter: options.recursive ? undefined : '/',
      MaxKeys: options.maxKeys || options.limit,
    });

    const response = await this.client.send(command);

    const files: StorageFile[] = (response.Contents || [])
      .filter(obj => obj.Key && !obj.Key.endsWith('/'))
      .map(obj => this.mapS3Object(obj, normalizedPrefix));

    const folders: StorageFolder[] = (response.CommonPrefixes || [])
      .map(cp => {
        const relPath = cp.Prefix?.replace(normalizedPrefix, '').replace(/\/$/, '') || '';
        return {
          path: relPath,
          name: relPath,
          children: [],
          files: [],
          size: 0,
          fileCount: 0,
          folderCount: 0,
          lastModified: new Date(),
        };
      });

    return { files, folders };
  }

  async getStats(options: GetStatsOptions = {}): Promise<StorageStats> {
    this.ensureInitialized();
    const prefix = options.path ? this.getKey(options.path) : '';
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : prefix + '/') : '';

    let totalSize = 0;
    let fileCount = 0;
    let folderCount = 0;

    let continuationToken: string | undefined;
    do {
      const response = await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: normalizedPrefix,
        ContinuationToken: continuationToken,
      }));

      for (const obj of response.Contents || []) {
        if (obj.Key?.endsWith('/')) {
          folderCount++;
        } else {
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
    const key = this.getKey(filePath);
    const body = data instanceof Buffer ? data : data;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: options.mimeType || this.getMimeType(filePath),
      Metadata: options.metadata,
      CacheControl: options.cacheControl,
      ContentDisposition: options.contentDisposition,
      ServerSideEncryption: options.encryption ? 'AES256' : undefined,
    });

    await this.client.send(command);

    const headResponse = await this.client.send(new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));

    return this.mapS3Object(headResponse, '');
  }

  async download(filePath: string, options: StorageDownloadOptions = {}): Promise<Readable> {
    this.ensureInitialized();
    const key = this.getKey(filePath);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Range: options.range ? `bytes=${options.range.start}-${options.range.end}` : undefined,
    });

    const response = await this.client.send(command);
    return response.Body as Readable;
  }

  async stream(filePath: string, options?: StorageDownloadOptions): Promise<Readable> {
    return this.download(filePath, options);
  }

  async exists(options: ExistsOptions): Promise<boolean> {
    this.ensureInitialized();
    const key = this.getKey(options.path);
    try {
      await this.client.send(new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  async getFile(options: GetFileOptions): Promise<StorageFile | null> {
    this.ensureInitialized();
    const key = this.getKey(options.path);
    try {
      const response = await this.client.send(new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
      return this.mapS3Object(response, '');
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw error;
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

  async delete(options: DeleteFileOptions): Promise<void> {
    this.ensureInitialized();
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: this.getKey(options.path) }));
  }

  async rename(options: RenameFileOptions): Promise<void> {
    this.ensureInitialized();
    const oldKey = this.getKey(options.oldPath);
    const newKey = this.getKey(options.newPath);
    await this.client.send(new CopyObjectCommand({ Bucket: this.bucket, CopySource: `${this.bucket}/${oldKey}`, Key: newKey }));
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: oldKey }));
  }

  async move(options: MoveFileOptions): Promise<void> {
    await this.rename({ oldPath: options.sourcePath, newPath: options.destinationPath });
  }

  async copy(options: CopyFileOptions): Promise<void> {
    this.ensureInitialized();
    await this.client.send(new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${this.getKey(options.sourcePath)}`,
      Key: this.getKey(options.destinationPath),
    }));
  }

  async deleteFolder(options: DeleteFolderOptions): Promise<void> {
    this.ensureInitialized();
    const prefix = this.getKey(options.path);
    const normalizedPrefix = prefix.endsWith('/') ? prefix : prefix + '/';

    let continuationToken: string | undefined;
    do {
      const response = await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: normalizedPrefix,
        ContinuationToken: continuationToken,
      }));

      if (response.Contents) {
        for (const obj of response.Contents) {
          if (obj.Key) {
            await this.client.send(new DeleteObjectCommand({
              Bucket: this.bucket,
              Key: obj.Key,
            }));
          }
        }
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
  }

  async renameFolder(options: RenameFolderOptions): Promise<void> {
    this.ensureInitialized();
    const oldPrefix = this.getKey(options.sourcePath);
    const newPrefix = this.getKey(options.destinationPath);
    const normalizedOldPrefix = oldPrefix.endsWith('/') ? oldPrefix : oldPrefix + '/';
    const normalizedNewPrefix = newPrefix.endsWith('/') ? newPrefix : newPrefix + '/';

    let continuationToken: string | undefined;
    do {
      const response = await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: normalizedOldPrefix,
        ContinuationToken: continuationToken,
      }));

      for (const obj of response.Contents || []) {
        if (obj.Key) {
          const newKey = obj.Key.replace(normalizedOldPrefix, normalizedNewPrefix);
          await this.client.send(new CopyObjectCommand({ Bucket: this.bucket, CopySource: `${this.bucket}/${obj.Key}`, Key: newKey }));
          await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: obj.Key }));
        }
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
  }

  async moveFolder(options: MoveFolderOptions): Promise<void> {
    await this.renameFolder({ sourcePath: options.sourcePath, destinationPath: options.destinationPath });
  }

  async copyFolder(options: CopyFolderOptions): Promise<void> {
    this.ensureInitialized();
    const sourcePrefix = this.getKey(options.sourcePath);
    const destPrefix = this.getKey(options.destinationPath);
    const normalizedSourcePrefix = sourcePrefix.endsWith('/') ? sourcePrefix : sourcePrefix + '/';
    const normalizedDestPrefix = destPrefix.endsWith('/') ? destPrefix : destPrefix + '/';

    let continuationToken: string | undefined;
    do {
      const response = await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: normalizedSourcePrefix,
        ContinuationToken: continuationToken,
      }));

      if (response.Contents) {
        for (const obj of response.Contents) {
          if (obj.Key) {
            const newKey = obj.Key.replace(normalizedSourcePrefix, normalizedDestPrefix);
            await this.client.send(new CopyObjectCommand({
              Bucket: this.bucket,
              CopySource: `${this.bucket}/${obj.Key}`,
              Key: newKey,
            }));
          }
        }
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
  }

  async getChecksum(options: GetChecksumOptions): Promise<string> {
    this.ensureInitialized();
    const key = this.getKey(options.path);
    const response = await this.client.send(new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
    return response.ETag?.replace(/"/g, '') || '';
  }

  async verifyChecksum(options: VerifyChecksumOptions): Promise<boolean> {
    const checksum = await this.getChecksum({ path: options.path, algorithm: (options.algorithm || 'md5') as any });
    return checksum === options.expectedChecksum;
  }

  async getPresignedUrl(options: StoragePresignedUrlOptions): Promise<string> {
    this.ensureInitialized();
    const key = this.getKey(options.path);
    const command = options.method === 'PUT'
      ? new PutObjectCommand({ Bucket: this.bucket, Key: key })
      : new GetObjectCommand({ Bucket: this.bucket, Key: key });

    return getSignedUrl(this.client, command, { expiresIn: options.expiresIn || 3600 });
  }

  async getPublicUrl(options: GetPublicUrlOptions): Promise<string> {
    this.ensureInitialized();
    const key = this.getKey(options.path);
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async watch(_path: string, _options: StorageWatchOptions, _callback: (event: StorageEvent) => void): Promise<StorageWatcher> {
    this.ensureInitialized();
    // S3 doesn't support native watching, return a no-op watcher
    const watcherId = `s3-watcher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: watcherId,
      path: _path,
      async close() { /* no-op */ },
    };
  }

  async unwatch(_watcher: StorageWatcher): Promise<void> {
    // no-op for S3
  }
}