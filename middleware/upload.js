// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists - FIXED path
const uploadDir = path.join(__dirname, '../Uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Uploads directory created:', uploadDir);
}

// Fixed storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Clean filename and make it unique
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + cleanName;
    cb(null, uniqueName);
  },
});

// Fixed file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only documents and images are allowed.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 20 * 1024 * 1024 // 20MB
  },
});

// Export multiple upload configurations
module.exports = {
  upload: upload,
  uploadFields: upload.fields([
    { name: 'files', maxCount: 10 },
    { name: 'paymentScreenshot', maxCount: 1 },
    { name: 'replyFiles', maxCount: 10 },
    { name: 'cv', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 }
  ]),
  uploadArray: upload.array('files', 10),
  uploadSingle: upload.single('file'),
  // NEW: Specific upload for reply files
  uploadReplyFiles: upload.array('replyFiles', 10)
};