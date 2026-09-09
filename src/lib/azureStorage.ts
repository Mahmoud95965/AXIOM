import { BlobServiceClient } from '@azure/storage-blob';

/**
 * Helper to upload image buffers or Base64 data directly to Azure Blob Storage
 */
export async function uploadImageToAzureStorage(
  base64OrBuffer: string | Buffer,
  userId?: string,
  contentType: string = 'image/png'
): Promise<string | null> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING?.trim();
  let containerName = process.env.AZURE_STORAGE_CONTAINER_NAME?.trim() || 'images';

  if (!containerName || containerName.includes('DefaultEndpointsProtocol') || containerName.length > 63) {
    containerName = 'images';
  }

  if (!connectionString) {
    console.warn('Azure Storage Connection String is not configured in .env.local');
    return null;
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    try {
      await containerClient.createIfNotExists({
        access: 'blob'
      });
    } catch (e) {}

    let buffer: Buffer;
    if (typeof base64OrBuffer === 'string') {
      const cleanBase64 = base64OrBuffer.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      buffer = Buffer.from(cleanBase64, 'base64');
    } else {
      buffer = base64OrBuffer;
    }

    const cleanUserId = userId ? userId.replace(/[^a-zA-Z0-9_-]/g, '') : 'gen';
    const blobName = `flux_${cleanUserId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.png`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: 'public, max-age=31536000'
      }
    });

    return blockBlobClient.url;

  } catch (error: any) {
    console.error('Azure Storage Image Upload Error:', error?.message || error);
    return null;
  }
}

/**
 * Helper to upload audio buffers directly to Azure Blob Storage Center
 */
export async function uploadAudioToAzureStorage(
  buffer: Buffer,
  userId?: string,
  contentType: string = 'audio/wav'
): Promise<string | null> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING?.trim();
  let containerName = 'audio';

  if (!connectionString) {
    console.warn('Azure Storage Connection String is not configured in .env.local');
    return null;
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    try {
      await containerClient.createIfNotExists({
        access: 'blob'
      });
    } catch (e) {}

    const cleanUserId = userId ? userId.replace(/[^a-zA-Z0-9_-]/g, '') : 'user';
    const blobName = `axiom_voice_${cleanUserId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: 'public, max-age=31536000'
      }
    });

    return blockBlobClient.url;

  } catch (error: any) {
    console.error('Azure Storage Audio Upload Error:', error?.message || error);
    return null;
  }
}
