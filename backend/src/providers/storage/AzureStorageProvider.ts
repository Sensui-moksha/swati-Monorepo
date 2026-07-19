import {
  BlobServiceClient,
  ContainerClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  SASProtocol,
} from '@azure/storage-blob';
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

export class AzureStorageProvider implements StorageProvider {
  readonly name = 'azure';
  readonly type = 'azure' as const;
  private containerClient!: ContainerClient;
  private initialized = false;

  async initialize(config: Record<string, any>): Promise<void> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString);
    this.containerClient = blobServiceClient.getContainerClient(config.containerName);
    await this.containerClient.createIfNotExists();
    this.initialized = true;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.containerClient.getProperties();
      return true;
    } catch {
      return false;
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('AzureStorageProvider not initialized. Call initialize() first.');
    }
  }

  private getBlobName(filePath: string): string {
    return filePath.replace(/^\/+/, '');
  }

  private mapBlobItem(item: any, prefix: string): StorageFile {
    const name = item.name || '';
    const relativePath = prefix ? name.replace(prefix, '').replace(/^\/+/, '') : name;
    return {
      path: relativePath,
      name: path.basename(name),
      size: item.properties?.contentLength || 0,
      lastModified: item.properties?.lastModified || new Date(),
      mimeType: item.properties?.contentType || this.getMimeType(name),
      checksum: item.properties?.contentMD5?.toString('hex'),
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
    const client = this.containerClient.getBlockBlobClient(this.getBlobName(options.path));
    return client.exists();
  }

  async getFile(options: GetFileOptions): Promise<StorageFile | null> {
    this.ensureInitialized();
    try {
      const blobName = this.getBlobName(options.path);
      const client = this.containerClient.getBlockBlobClient(blobName);
      const properties = await client.getProperties();
      return {
        path: options.path,
        name: path.basename(options.path),
        size: properties.contentLength || 0,
        lastModified: properties.lastModified || new Date(),
        mimeType: properties.contentType || this.getMimeType(options.path),
        checksum: properties.contentMD5 ? Buffer.from(properties.contentMD5).toString('hex') : undefined,
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
    const blobName = this.getBlobName(options.path);
    const normalizedName = blobName.endsWith('/') ? blobName : blobName + '/';
    const client = this.containerClient.getBlockBlobClient(normalizedName);
    await client.uploadData(Buffer.from(''));
  }

  async list(options: StorageListOptions = {}): Promise<{ files: StorageFile[]; folders: StorageFolder[] }> {
    this.ensureInitialized();
    const prefix = options.path ? this.getBlobName(options.path) : '';
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : prefix + '/') : '';

    const files: StorageFile[] = [];
    const folders: StorageFolder[] = [];

    for await (const item of this.containerClient.listBlobsByHierarchy('/', {
      prefix: normalizedPrefix,
    })) {
      if (item.kind === 'blob') {
        files.push(this.mapBlobItem(item, normalizedPrefix));
      } else if (item.kind === 'prefix') {
        const prefixName = (item as any).name || '';
        const relativePath = prefix ? prefixName.replace(normalizedPrefix, '').replace(/\/$/, '') : prefixName.replace(/\/$/, '');
        folders.push({
          path: relativePath,
          name: path.basename(relativePath),
          children: [],
          files: [],
          size: 0,
          fileCount: 0,
          folderCount: 0,
          lastModified: new Date(),
        });
      }
    }

    return { files, folders };
  }

  async getStats(options: GetStatsOptions): Promise<StorageStats> {
    this.ensureInitialized();
    const prefix = options.path ? this.getBlobName(options.path) : '';
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : prefix + '/') : '';

    let totalSize = 0;
    let fileCount = 0;
    let folderCount = 0;

    for await (const item of this.containerClient.listBlobsByHierarchy('/', { prefix: normalizedPrefix })) {
      if (item.kind === 'blob') {
        fileCount++;
        totalSize += (item as any).properties?.contentLength || 0;
      } else if (item.kind === 'prefix') {
        folderCount++;
      }
    }

    return { totalSize, fileCount, folderCount };
  }

  async upload(filePath: string, data: Buffer | Readable, options: StorageUploadOptions = {}): Promise<StorageFile> {
    this.ensureInitialized();
    const blobName = this.getBlobName(filePath);
    const client = this.containerClient.getBlockBlobClient(blobName);

    const uploadOptions: any = {
      blobHTTPHeaders: {
        blobContentType: options.mimeType || this.getMimeType(filePath),
        blobCacheControl: options.cacheControl,
        blobContentDisposition: options.contentDisposition,
      },
      metadata: options.metadata,
    };

    if (data instanceof Buffer) {
      await client.uploadData(data, uploadOptions);
    } else {
      // uploadStream only accepts Readable
      await client.uploadStream(data as any, undefined, undefined, uploadOptions);
    }

    const properties = await client.getProperties();
    return {
      path: filePath,
      name: path.basename(filePath),
      size: properties.contentLength || 0,
      lastModified: properties.lastModified || new Date(),
      mimeType: properties.contentType || this.getMimeType(filePath),
    };
  }

  async download(filePath: string, options: StorageDownloadOptions = {}): Promise<Readable> {
    this.ensureInitialized();
    const blobName = this.getBlobName(filePath);
    const client = this.containerClient.getBlockBlobClient(blobName);

    const offset = options.range?.start;
    const count = options.range && options.range.end != null ? options.range.end - (options.range.start || 0) : undefined;

    const response = await client.download(offset, count);
    return response.readableStreamBody as Readable;
  }

  async stream(filePath: string, options?: StorageDownloadOptions): Promise<Readable> {
    return this.download(filePath, options);
  }

  async delete(options: DeleteFileOptions): Promise<void> {
    this.ensureInitialized();
    const client = this.containerClient.getBlockBlobClient(this.getBlobName(options.path));
    await client.deleteIfExists();
  }

  async rename(options: RenameFileOptions): Promise<void> {
    this.ensureInitialized();
    const srcClient = this.containerClient.getBlobClient(this.getBlobName(options.oldPath));
    const dstClient = this.containerClient.getBlockBlobClient(this.getBlobName(options.newPath));
    await dstClient.beginCopyFromURL(srcClient.url);
    await srcClient.deleteIfExists();
  }

  async move(options: MoveFileOptions): Promise<void> {
    await this.rename({ oldPath: options.sourcePath, newPath: options.destinationPath });
  }

  async copy(options: CopyFileOptions): Promise<void> {
    this.ensureInitialized();
    const srcClient = this.containerClient.getBlobClient(this.getBlobName(options.sourcePath));
    const dstClient = this.containerClient.getBlockBlobClient(this.getBlobName(options.destinationPath));
    await dstClient.beginCopyFromURL(srcClient.url);
  }

  async deleteFolder(options: DeleteFolderOptions): Promise<void> {
    this.ensureInitialized();
    const prefix = this.getBlobName(options.path);
    const normalizedPrefix = prefix.endsWith('/') ? prefix : prefix + '/';
    for await (const item of this.containerClient.listBlobsByHierarchy('/', { prefix: normalizedPrefix })) {
      if (item.kind === 'blob') {
        const client = this.containerClient.getBlockBlobClient(item.name);
        await client.deleteIfExists();
      }
    }
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
    const srcPrefix = this.getBlobName(options.sourcePath);
    const dstPrefix = this.getBlobName(options.destinationPath);
    const normalizedSrc = srcPrefix.endsWith('/') ? srcPrefix : srcPrefix + '/';
    const normalizedDst = dstPrefix.endsWith('/') ? dstPrefix : dstPrefix + '/';

    for await (const item of this.containerClient.listBlobsByHierarchy('/', { prefix: normalizedSrc })) {
      if (item.kind === 'blob') {
        const newBlobName = item.name.replace(normalizedSrc, normalizedDst);
        const srcClient = this.containerClient.getBlobClient(item.name);
        const dstClient = this.containerClient.getBlockBlobClient(newBlobName);
        await dstClient.beginCopyFromURL(srcClient.url);
      }
    }
  }

  async getChecksum(options: GetChecksumOptions): Promise<string> {
    this.ensureInitialized();
    const client = this.containerClient.getBlockBlobClient(this.getBlobName(options.path));
    const properties = await client.getProperties();
    return properties.contentMD5 ? Buffer.from(properties.contentMD5).toString('hex') : '';
  }

  async verifyChecksum(options: VerifyChecksumOptions): Promise<boolean> {
    const checksum = await this.getChecksum({ path: options.path, algorithm: (options.algorithm || 'md5') as any });
    return checksum === options.expectedChecksum;
  }

  async getPresignedUrl(options: StoragePresignedUrlOptions): Promise<string> {
    this.ensureInitialized();
    const blobName = this.getBlobName(options.path);
    const blobClient = this.containerClient.getBlobClient(blobName);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerClient.containerName,
        blobName,
        permissions: options.method === 'PUT' ? BlobSASPermissions.parse('cw') : BlobSASPermissions.parse('r'),
        protocol: SASProtocol.Https,
        expiresOn: new Date(Date.now() + (options.expiresIn || 3600) * 1000),
      },
      (this.containerClient as any).credential
    ).toString();
    return `${blobClient.url}?${sasToken}`;
  }

  async getPublicUrl(options: GetPublicUrlOptions): Promise<string> {
    this.ensureInitialized();
    const blobClient = this.containerClient.getBlobClient(this.getBlobName(options.path));
    return blobClient.url;
  }

  async watch(_path: string, _options: StorageWatchOptions, _callback: (event: StorageEvent) => void): Promise<StorageWatcher> {
    this.ensureInitialized();
    const watcherId = `azure-watcher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { id: watcherId, path: _path, async close() { /* no-op */ } };
  }

  async unwatch(_watcher: StorageWatcher): Promise<void> {
    // no-op for Azure
  }
}