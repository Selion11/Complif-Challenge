const multer = require('multer');
const path = require('path');
const logger = require('../utils/logger');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    const error = new Error('Solo se permiten archivos PDF');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } //5 mbs
});

const companyUploads = upload.fields([
  { name: 'certificadoFiscal', maxCount: 1 },
  { name: 'constanciaInscripcion', maxCount: 1 },
  { name: 'polizaSeguro', maxCount: 1 }
]);

module.exports = companyUploads;