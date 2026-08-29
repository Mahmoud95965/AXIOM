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

  // If container name was accidentally set to another connection string or invalid characters, sanitize to 'images'
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

    // Ensure container exists with public read access for images
    try {
      await containerClient.createIfNotExists({
        access: 'blob'
      });
    } catch (e) {
      // Container may already exist
    }

    // Prepare buffer
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

    const permanentUrl = blockBlobClient.url;
    return permanentUrl;

  } catch (error: any) {
    console.error('Azure Storage Upload Error:', error?.message || error);
    return null;
  }
}
