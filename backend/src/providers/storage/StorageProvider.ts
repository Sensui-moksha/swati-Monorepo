import { Readable } from 'stream';

export interface StorageFile {
  path: string;
  name: string;
  size: number;
  lastModified: Date;
  checksum?: string;
  mimeType?: string;
}

export interface StorageFolder {
  path: string;
  name: string;
  children: StorageFolder[];
  files: StorageFile[];
  size: number;
  fileCount: number;
  folderCount: number;
  lastModified: Date;
}

export interface StorageStats {
  totalSize: number;
  fileCount: number;
  folderCount: number;
  freeSpace?: number;
  usedSpace?: number;
}

export interface StreamOptions {
  start?: number;
  end?: number;
  highWaterMark?: number;
}

export interface UploadOptions {
  path: string;
  contentType?: string;
  metadata?: Record<string, string>;
  overwrite?: boolean;
}

export interface CopyOptions {
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
}

export interface MoveOptions {
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
}

export interface DeleteOptions {
  path: string;
  recursive?: boolean;
}

export interface ListOptions {
  path: string;
  recursive?: boolean;
  includeFiles?: boolean;
  includeFolders?: boolean;
  prefix?: string;
  delimiter?: string;
  maxKeys?: number;
}

export interface ExistsOptions {
  path: string;
}

export interface GetFileOptions {
  path: string;
}

export interface GetFolderOptions {
  path: string;
}

export interface GetStatsOptions {
  path?: string;
}

export interface CreateFolderOptions {
  path: string;
}

export interface DeleteFolderOptions {
  path: string;
  recursive?: boolean;
}

export interface RenameFolderOptions {
  sourcePath: string;
  destinationPath: string;
}

export interface MoveFolderOptions {
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
}

export interface CopyFolderOptions {
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
}

export interface DeleteFileOptions {
  path: string;
}

export interface RenameFileOptions {
  oldPath: string;
  newPath: string;
}

export interface MoveFileOptions {
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
}

export interface CopyFileOptions {
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
}

export interface GetChecksumOptions {
  path: string;
  algorithm: StorageChecksumAlgorithm;
}

export interface VerifyChecksumOptions {
  path: string;
  expectedChecksum: string;
  algorithm?: string;
}

export interface GetPublicUrlOptions {
  path: string;
}

export interface ChecksumOptions {
  path: string;
  algorithm?: 'md5' | 'sha256' | 'sha512';
}

// Cloud provider specific option types (Storage-prefixed for compatibility)
export interface StorageListOptions {
  path?: string;
  prefix?: string;
  delimiter?: string;
  maxKeys?: number;
  limit?: number;
  recursive?: boolean;
  includeFiles?: boolean;
  includeFolders?: boolean;
}

export interface StorageUploadOptions {
  mimeType?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  contentDisposition?: string;
  encryption?: 'AES256' | 'aws:kms';
}

export interface StorageDownloadOptions {
  range?: { start: number; end: number };
}

export interface StorageWatchOptions {
  path: string;
  recursive?: boolean;
  events?: string[];
}

export interface StoragePresignedUrlOptions {
  path: string;
  method?: 'GET' | 'PUT';
  expiresIn?: number;
  contentType?: string;
}

export type StorageChecksumAlgorithm = 'md5' | 'sha256' | 'sha512' | 'crc32' | 'crc32c';

export interface StorageProvider {
  readonly name: string;
  readonly type: 'local' | 's3' | 'azure' | 'gcs' | 'r2';

  initialize(config: Record<string, any>): Promise<void>;
  healthCheck(): Promise<boolean>;

  exists(options: ExistsOptions): Promise<boolean>;
  getFile(options: GetFileOptions): Promise<StorageFile | null>;
  getFolder(options: GetFolderOptions): Promise<StorageFolder | null>;
  list(options: StorageListOptions): Promise<{ files: StorageFile[]; folders: StorageFolder[] }>;
  getStats(options: GetStatsOptions): Promise<StorageStats>;

  createFolder(options: CreateFolderOptions): Promise<void>;
  deleteFolder(options: DeleteFolderOptions): Promise<void>;
  renameFolder(options: RenameFolderOptions): Promise<void>;
  moveFolder(options: MoveFolderOptions): Promise<void>;
  copyFolder(options: CopyFolderOptions): Promise<void>;

  upload(filePath: string, data: Buffer | Readable, options?: StorageUploadOptions): Promise<StorageFile>;
  download(filePath: string, options?: StorageDownloadOptions): Promise<Readable>;
  stream(filePath: string, options?: StorageDownloadOptions): Promise<Readable>;
  delete(options: DeleteFileOptions): Promise<void>;
  rename(options: RenameFileOptions): Promise<void>;
  move(options: MoveFileOptions): Promise<void>;
  copy(options: CopyFileOptions): Promise<void>;

  getChecksum(options: GetChecksumOptions): Promise<string>;
  verifyChecksum(options: VerifyChecksumOptions): Promise<boolean>;

  getPresignedUrl(options: StoragePresignedUrlOptions): Promise<string>;
  getPublicUrl(options: GetPublicUrlOptions): Promise<string>;

  watch(path: string, options: StorageWatchOptions, callback: (event: StorageEvent) => void): Promise<StorageWatcher>;
  unwatch(watcher: StorageWatcher): Promise<void>;
}

export interface StorageEvent {
  type: 'create' | 'delete' | 'rename' | 'modify';
  path: string;
  isDirectory: boolean;
  oldPath?: string;
  timestamp: Date;
  size?: number;
}

export interface StorageWatcher {
  id: string;
  path: string;
  close(): Promise<void>;
}

export interface StorageProviderConfig {
  type: 'local' | 's3' | 'azure' | 'gcs' | 'r2';
  local?: {
    rootPath: string;
  };
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  };
  azure?: {
    accountName: string;
    accountKey: string;
    containerName: string;
  };
  gcs?: {
    projectId: string;
    keyFilename: string;
    bucketName: string;
  };
  r2?: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
  };
}