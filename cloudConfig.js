const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uninest_development',
    allowedFormats: ["png","jpg","jpeg"]
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uninest_avatars',
    allowedFormats: ["png","jpg","jpeg"],
    transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
  },
});

module.exports={
    cloudinary,
    storage,
    avatarStorage,
};