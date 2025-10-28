import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { CloudinaryProvider } from './cloudinary';
import { fileType } from 'src/common/types/fileTypes';
import { CloudinaryResponse } from 'src/common/types/CloudinaryResponse';
import { FileUpload } from 'graphql-upload/processRequest.mjs';

export class CloudinaryService extends CloudinaryProvider {
  async uploadFileStream(
    file: Express.Multer.File,
    external_id: string,
    folder?: string,
    resource_type?: fileType,
  ) {
    return new Promise<CloudinaryResponse | undefined>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type, public_id: external_id, folder },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(public_id: string) {
    const deleteFileData = await cloudinary.uploader.destroy(public_id);
    console.log('deleteFileData', deleteFileData);
    return deleteFileData;
  }

  async deleteFileMany(public_ids: string[]) {
    const deleteFileData = await cloudinary.api.delete_resources(public_ids);
    console.log('deleteFileData', deleteFileData);
    return deleteFileData;
  }

  async uploadFileBase64(
    file: string,
    external_id: string,
    folder?: string,
    resource_type?: fileType,
  ) {
    try {
      console.log('cloud', external_id, folder, resource_type);
      const result = await cloudinary.uploader.upload(file, {
        resource_type: 'auto',
        folder,
        public_id: external_id,
        // overwrite: true,
        // invalidate: true,
        // crop: 'fill',
      });
      return result;
    } catch (error) {
      // console.log('Cloudinary error', error);
      // if((error as any).errno && (error as any).code)
      throw new Error(
        `Error: ${(error as any).error.code}, code: ${
          (error as any).error.errno
        }`,
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    external_id: string,
    folder?: string,
    resource_type?: fileType,
  ) {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type, public_id: external_id, folder },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFileGraphQL(
    file: FileUpload,
    external_id: string,
    folder?: string,
    resource_type?: fileType,
  ): Promise<CloudinaryResponse> {
    const { createReadStream, filename } = file;

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resource_type || 'auto',
          public_id: external_id || filename,
          folder,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      createReadStream().pipe(uploadStream);
    });
  }

  async uploadFilesGraphQL(
    files: Promise<FileUpload>[],
    folder?: string,
    resource_type?: fileType,
  ) {
    const results: CloudinaryResponse[] = [];
    for (const filePromise of files) {
      const file = await filePromise;
      const result = await this.uploadFileGraphQL(
        file,
        file.filename,
        folder,
        resource_type,
      );
      results.push(result);
    }
    return results;
  }
}
