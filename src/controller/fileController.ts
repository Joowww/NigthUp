import { Request, Response } from 'express';
import { uploadImage } from '../services/cloudinaryService';

export const uploadImageHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ status: 'error', message: 'No file uploaded' });
            return;
        }

        const folder = req.body.folder || 'general';
        console.log(`[FILE CONTROLLER] 🚀 New upload request. File: ${req.file.originalname}, Folder: ${folder}`);

        const imageUrl = await uploadImage(req.file.buffer, folder);

        if (!imageUrl) {
            console.error('[FILE CONTROLLER] ❌ Failed to get URL from Cloudinary');
            res.status(500).json({ status: 'error', message: 'Failed to upload image to Cloudinary' });
            return;
        }

        console.log('[FILE CONTROLLER] ✨ Image processed successfully:', imageUrl);
        res.status(201).json({
            status: 'success',
            image_url: imageUrl,
        });
    } catch (error) {
        console.error('Error in uploadImageHandler:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export default {
    uploadImageHandler,
};
