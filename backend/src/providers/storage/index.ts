export type { StorageProvider, StorageFile, StorageFolder, StorageStats, StreamOptions, UploadOptions, CopyOptions, MoveOptions, DeleteOptions, ListOptions, ExistsOptions, ChecksumOptions, StorageEvent, StorageWatcher, StorageProviderConfig } from './StorageProvider';
export { LocalStorageProvider } from './LocalStorageProvider';
export { FailoverStorageProvider } from './FailoverStorageProvider';
export { getStorageProvider, resetStorageProvider, createStorageProvider } from './StorageFactory';