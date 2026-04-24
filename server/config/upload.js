const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require("path");
const crypto = require("crypto");
const { ensureUploadConfigured, isCloudinaryConfigured } = require("../utils/mediaConfig");

// Advanced Size Limits Control
const SIZES = {
  IMAGE: Number(process.env.UPLOAD_MAX_IMAGE_BYTES || 5 * 1024 * 1024), // 5 MB
  DOCUMENT: Number(process.env.UPLOAD_MAX_DOC_BYTES || 15 * 1024 * 1024), // 15 MB
  VIDEO: Number(process.env.UPLOAD_MAX_VIDEO_BYTES || 100 * 1024 * 1024) // 100 MB
};

// Categorized Formats
const FORMATS = {
  IMAGE: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  DOCUMENT: ['pdf', 'docx', 'doc', 'txt', 'csv'],
  VIDEO: ['mp4', 'webm', 'mov']
};

// Categorized Mime Types
const MIME_TYPES = {
  IMAGE: new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  DOCUMENT: new Set([
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/csv'
  ]),
  VIDEO: new Set(['video/mp4', 'video/webm', 'video/quicktime'])
};

// Cryptographically Safe Identifier Generator
const generateSafeName = (originalname) => {
  const ext = path.extname(originalname);
  const baseName = path.basename(originalname, ext)
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 40) || 'file'; // Cap base name length
  
  const uniqueId = crypto.randomBytes(6).toString('hex'); // 12-char entropy
  return `${baseName}-${uniqueId}`;
};

// Cloudinary initialization
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Advanced Storage Factory
 * Dynamically builds storage destination based on intended context.
 */
const createStorage = (folderName, allowedFormatsList) => {
  if (!isCloudinaryConfigured()) {
    console.warn(`[WARNING] Cloudinary is heavily advised for production. Falling back to local Memory Storage for ${folderName}.`);
    return multer.memoryStorage();
  }

  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (_req, file) => {
      // Documents strictly require resource_type: "raw" on cloudinary, or else they can get corrupted or rejected.
      const isDocument = FORMATS.DOCUMENT.includes(path.extname(file.originalname).slice(1).toLowerCase());
      const isVideo = FORMATS.VIDEO.includes(path.extname(file.originalname).slice(1).toLowerCase());
      
      let resourceType = 'auto';
      if (isDocument) resourceType = 'raw';
      else if (isVideo) resourceType = 'video';

      return {
        folder: `vitam-ai/${folderName}`,
        allowed_formats: allowedFormatsList,
        resource_type: resourceType, 
        public_id: generateSafeName(file.originalname || 'upload'),
        // Automatically apply Cloudinary transformations for Images (Quality/Size optimization)
        ...(allowedFormatsList === FORMATS.IMAGE && {
            transformation: [{ width: 1920, height: 1080, crop: "limit", quality: "auto", fetch_format: "auto" }]
        })
      };
    },
  });
};

/**
 * File Filter Validations Generator
 */
const createFileFilter = (allowedFormats, allowedMimes) => (_req, file, callback) => {
  const extension = path.extname(file.originalname || '').toLowerCase().replace('.', '');
  const mimeType = String(file.mimetype || '').toLowerCase();
  
  if (!allowedFormats.includes(extension) || !allowedMimes.has(mimeType)) {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
    error.message = `Security Alert: Invalid file type. Allowed formats: ${allowedFormats.join(', ')}`;
    return callback(error);
  }
  return callback(null, true);
};

/* =======================================================================
 * PRE-CONFIGURED UPLOAD MIDDLEWARES
 * ======================================================================= */

// 1. Generic Universal Upload (Supports Images & Docs)
const upload = multer({
  storage: createStorage('general', [...FORMATS.IMAGE, ...FORMATS.DOCUMENT]),
  limits: { fileSize: SIZES.DOCUMENT, files: 3 },
  fileFilter: createFileFilter([...FORMATS.IMAGE, ...FORMATS.DOCUMENT], new Set([...MIME_TYPES.IMAGE, ...MIME_TYPES.DOCUMENT]))
});

// 2. Avatar / Profile Photo Upload (Strict Image Validation + Auto Compression)
const uploadAvatar = multer({
  storage: createStorage('avatars', FORMATS.IMAGE),
  limits: { fileSize: SIZES.IMAGE, files: 1 },
  fileFilter: createFileFilter(FORMATS.IMAGE, MIME_TYPES.IMAGE)
});

// 3. Document / Assignment Upload (Strict File Validation + Raw Storage)
const uploadDocument = multer({
  storage: createStorage('documents', FORMATS.DOCUMENT),
  limits: { fileSize: SIZES.DOCUMENT, files: 5 },
  fileFilter: createFileFilter(FORMATS.DOCUMENT, MIME_TYPES.DOCUMENT)
});

// 4. Video Uploads
const uploadVideo = multer({
    storage: createStorage('videos', FORMATS.VIDEO),
    limits: { fileSize: SIZES.VIDEO, files: 1 },
    fileFilter: createFileFilter(FORMATS.VIDEO, MIME_TYPES.VIDEO)
});

/**
 * Robust Express Error Handler specialized for Multer
 * Prevents stack-traces from leaking on invalid uploads.
 */
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ success: false, error: "Upload rejected. File size exceeds safety limits." });
        }
        return res.status(400).json({ success: false, error: err.message || "Upload aborted due to security validation." });
    } else if (err) {
        return res.status(500).json({ success: false, error: "Internal processing error during upload." });
    }
    next();
};

module.exports = {
  upload,
  uploadAvatar,
  uploadDocument,
  uploadVideo,
  handleUploadError,
  ensureUploadConfigured,
  isUploadConfigured: isCloudinaryConfigured
};
