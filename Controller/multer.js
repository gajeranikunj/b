const multer = require("multer");
const path = require("path");

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

// File filter for audio
const audioFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(mp3|MP3|wav|WAV)$/)) {
    return cb(new Error("Only audio files are allowed!"), false);
  }
  cb(null, true);
};

// Combine image and audio storage and file filters into a single multer instance
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      
      if (file.fieldname === "img") {
        cb(null, "./public/images");
      } else if (file.fieldname === "audio") {
        cb(null, "./public/audio");
      }
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "img") {
      imageFileFilter(req, file, cb);
    } else if (file.fieldname === "audio") {
      audioFileFilter(req, file, cb);
    }
  },
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB for both types
});

module.exports = upload;
 