import { storageConfig } from '../../config/storage';
import { StorageProvider, StorageProviderConfig } from './StorageProvider';
import { LocalStorageProvider } from './LocalStorageProvider';
import { S3StorageProvider } from './S3StorageProvider';
import { AzureStorageProvider } from './AzureStorageProvider';
import { GCSStorageProvider } from './GCSStorageProvider';
import { R2StorageProvider } from './R2StorageProvider';

export function createStorageProvider(config: StorageProviderConfig): StorageProvider {
  switch (config.type) {
    case 'local': return new LocalStorageProvider();
    case 's3': return new S3StorageProvider();
    case 'azure': return new AzureStorageProvider();
    case 'gcs': return new GCSStorageProvider();
    case 'r2': return new R2StorageProvider();
    default: throw new Error(`Unknown storage provider type: ${(config as any).type}`);
  }
}

let cachedProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  const config: StorageProviderConfig = storageConfig.s3.enabled
    ? {
        type: 's3',
        s3: {
          bucket: storageConfig.s3.bucket!,
          region: storageConfig.s3.region!,
          accessKeyId: storageConfig.s3.accessKeyId!,
          secretAccessKey: storageConfig.s3.secretAccessKey!,
        },
      }
    : {
        type: 'local',
        local: {
          rootPath: storageConfig.local.uploadDir,
        },
      };

  const provider = createStorageProvider(config);
  cachedProvider = provider;
  return provider;
}

export function resetStorageProvider(): void {
  cachedProvider = null;
}