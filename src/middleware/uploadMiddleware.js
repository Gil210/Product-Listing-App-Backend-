const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, callback) => {
    if (/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) callback(null, true);
    else callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only jpg, jpeg, png, and webp images are allowed'));
  }
});

module.exports = upload;
