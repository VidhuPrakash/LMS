import { db } from "../../db";
import { files } from "../../db/schema/files";
import { documentStorage } from "../../config/upload";

interface UploadFileData {
  file: File;
  userId: string;
  documentType: string;
}

export const uploadFileService = async (data: UploadFileData) => {
  const { file, userId, documentType } = data;

  // Upload file to storage
  const uploadResult = await documentStorage.uploadDocument(file, {
    userId,
    documentType,
  });

  // Save file metadata to database
  const [fileRecord] = await db
    .insert(files)
    .values({
      key: uploadResult.key,
      originalFilename: uploadResult.originalFilename,
      storedFilename: uploadResult.storedFilename,
      filePath: uploadResult.filePath,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
      checksum: uploadResult.checksum,
      documentType,
      userId,
    })
    .returning();

  return fileRecord;
};
