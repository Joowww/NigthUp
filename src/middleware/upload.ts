import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createFolderIfNotExists = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

createFolderIfNotExists('uploads/profile-pictures');
createFolderIfNotExists('uploads/cover-photos');
createFolderIfNotExists('uploads/posts');
createFolderIfNotExists('uploads/events');
createFolderIfNotExists('public/default-images');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';

    if (req.path.includes('/profile-picture') || req.path.includes('/avatar')) {
      folder += 'profile-pictures/';
    } else if (req.path.includes('/cover-photo')) {
      folder += 'cover-photos/';
    } else if (req.path.includes('/post')) {
      folder += 'posts/';
    } else if (req.path.includes('/event')) {
      folder += 'events/';
    } else {
      folder += 'others/';
    }

    createFolderIfNotExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP, MP4, MPEG and MOV are allowed.'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});


export const uploadSingle = upload.single('file');
export const uploadProfilePicture = upload.single('avatar');
export const uploadCoverPhoto = upload.single('coverPhoto');
export const uploadPostMedia = upload.array('media', 5);
export const uploadEventImage = upload.single('image');
export const uploadSinglePostFile = upload.single('file'); 