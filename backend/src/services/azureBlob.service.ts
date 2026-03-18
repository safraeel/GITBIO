import { BlobServiceClient } from '@azure/storage-blob';
import { winstonLogger } from '../utils/logger';

type UploadPayload = {
  templateId: string;
  versionId: string;
  markdown: string;
  metadata?: Record<string, string>;
};

function getContainerClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER;

  if (!connectionString || !containerName) {
    return null;
  }

  const blobClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobClient.getContainerClient(containerName);
}

export async function uploadTemplateVersionToAzure(payload: UploadPayload): Promise<string | null> {
  const container = getContainerClient();
  if (!container) {
    return null;
  }

  const blobPath = `templates/${payload.templateId}/versions/${payload.versionId}.md`;
  const blockBlobClient = container.getBlockBlobClient(blobPath);

  try {
    await container.createIfNotExists();
    await blockBlobClient.upload(payload.markdown, Buffer.byteLength(payload.markdown), {
      blobHTTPHeaders: {
        blobContentType: 'text/markdown',
      },
      metadata: payload.metadata,
    });

    return blockBlobClient.url;
  } catch (error) {
    winstonLogger.error('Azure Blob upload failed', error);
    return null;
  }
}
