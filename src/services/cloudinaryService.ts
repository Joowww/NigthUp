import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are required but missing in .env');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const uploadImage = async (fileBuffer: Buffer, folder: string, resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        const options = {
            folder: `nightup_${folder}`,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true,
            overwrite: true,
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) {
                    resolve(null);
                } else if (result) {
                    resolve(result.secure_url);
                } else {
                    resolve(null);
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export default {
    uploadImage,
};
