const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

function configureMulter(destinationFolder, fields) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destinationFolder); // Specify the destination folder
    },
    filename: function (req, file, cb) {
      const uniqueFilename = `${uuidv4()}${getFileExtension(file.originalname)}`;
      cb(null, uniqueFilename); // Set unique filename with original extension
    }
  });

  const upload = multer({ storage: storage, limits: {fileSize: 50 * 1024 * 1024} }).fields(fields);

  return function (req, res, next) {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ success: false, message: 'Multer error', error: err });
      } else if (err) {
        return res.status(500).json({ success: false, message: 'Error uploading file', error: err });
      }
      next();
    });
  };
}

function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 1);
}

module.exports = configureMulter;
