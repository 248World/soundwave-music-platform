const multer = require('multer');
const path = require('path');
const fs = require('fs');

const audioDir = path.join(__dirname, '../../uploads/audio');
const coverDir = path.join(__dirname, '../../uploads/covers');
const avatarDir = path.join(__dirname, '../../uploads/avatars');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

if (!fs.existsSync(coverDir)) {
  fs.mkdirSync(coverDir, { recursive: true });
}

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, audioDir);
      return;
    }

    if (file.fieldname === 'cover') {
      cb(null, coverDir);
      return;
    }

    if (file.fieldname === 'avatar') {
      cb(null, avatarDir);
      return;
    }

    cb(new Error('Invalid file field.'), null);
  },

  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '');

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${safeOriginalName}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedAudioTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/aac',
  ];

  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (file.fieldname === 'audio') {
    if (allowedAudioTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error(
        `Invalid audio file type: ${file.mimetype}. Allowed: mp3, wav, ogg, m4a, aac.`
      ),
      false
    );
  }

  if (file.fieldname === 'cover' || file.fieldname === 'avatar') {
    if (allowedImageTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error(
        `Invalid image file type: ${file.mimetype}. Allowed: jpg, png, webp.`
      ),
      false
    );
  }

  cb(new Error('Invalid file field.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

module.exports = upload;