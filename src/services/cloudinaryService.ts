import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

console.log('[CLOUDINARY SERVICE] ⚙️ Checking config...');
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('[CLOUDINARY SERVICE] ❌ MISSING CREDENTIALS IN .ENV');
} else {
    console.log('[CLOUDINARY SERVICE] ✅ Credentials found for cloud:', process.env.CLOUDINARY_CLOUD_NAME);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const uploadImage = async (fileBuffer: Buffer, folder: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        const options = {
            folder: `nightup_${folder}`,
            resource_type: 'image' as const,
            use_filename: true,
            unique_filename: true,
            overwrite: true,
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) {
                    console.error('[CLOUDINARY SERVICE] ❌ Upload error:', error);
                    resolve(null);
                } else if (result) {
                    console.log('[CLOUDINARY SERVICE] ✅ Upload success:', result.secure_url);
                    resolve(result.secure_url);
                } else {
                    console.error('[CLOUDINARY SERVICE] ❌ Upload failed without specific error');
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
