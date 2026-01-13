import { Request, Response } from 'express';
import { uploadImage } from '../services/cloudinaryService';

export const uploadImageHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ status: 'error', message: 'No file uploaded' });
            return;
        }

        const folder = req.body.folder || 'general';
        const resourceType = req.body.resourceType || 'auto';
        console.log(`[FILE CONTROLLER] 🚀 New upload request. File: ${req.file.originalname}, Folder: ${folder}, Type: ${resourceType}`);

        const fileUrl = await uploadImage(req.file.buffer, folder, resourceType as any);

        if (!fileUrl) {
            console.error('[FILE CONTROLLER] ❌ Failed to get URL from Cloudinary');
            res.status(500).json({ status: 'error', message: 'Failed to upload file to Cloudinary' });
            return;
        }

        console.log('[FILE CONTROLLER] ✨ File processed successfully:', fileUrl);
        res.status(201).json({
            status: 'success',
            file_url: fileUrl,
            image_url: fileUrl,
            url: fileUrl,
            secure_url: fileUrl
        });
    } catch (error) {
        console.error('Error in uploadImageHandler:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export default {
    uploadImageHandler,
};
