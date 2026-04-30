import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import env from '../config/env.js';
import multer from 'multer';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Create storage engine for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    // Determine folder based on file type or resource type
    let folder = 'resources';
    let resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto';
    
    // Set different folders for different resource types
    if (file.mimetype.startsWith('image/')) {
      folder = 'resources/images';
      resourceType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'resources/videos';
      resourceType = 'video';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'resources/pdfs';
      resourceType = 'raw';
    } else {
      folder = 'resources/files';
      resourceType = 'raw';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf', 'zip', 'doc', 'docx'],
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname.split('.')[0].replace(/\s+/g, '_')}`,
    };
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, PDFs, ZIPs, and DOC files are allowed.'));
    }
  },
});

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export const getCloudinaryUrl = (publicId: string, options?: any) => {
  return cloudinary.url(publicId, options);
};

export default cloudinary;