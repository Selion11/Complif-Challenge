const multer = require('multer');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const {cuit} = req.body;
    
    if(!cuit){
      return cb(new Error('El CUIT es necesario'),null);
    }

    const uploadPath = path.join('uploads',cuit)

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      logger.info({
        service: 'UploadMiddleware',
        message: `Carpeta creada para la empresa con CUIT: ${cuit}`
      });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}${fileExtension}`);
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