const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (buffer) => new Promise((resolve, reject) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    reject(new Error('Cloudinary is not configured'));
    return;
  }
  const stream = cloudinary.uploader.upload_stream({ folder: 'property-listing' }, (error, result) => {
    if (error) reject(error);
    else resolve(result.secure_url);
  });
  stream.end(buffer);
});

module.exports = { uploadToCloudinary };
