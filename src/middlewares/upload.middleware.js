const multer = require('multer');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ CORRECCIÓN: Leemos de req.params porque el CUIT viaja en la URL de la ruta
    // Esto garantiza que el valor esté presente antes de procesar el binario
    const { cuit } = req.params; 
    
    if (!cuit) {
      return cb(new Error('El CUIT es necesario en la URL para definir el destino del archivo'), null);
    }

    // Definimos la ruta de carga (relativa a la raíz del proyecto/contenedor)
    const uploadPath = path.join('uploads', cuit);

    try {
      // Creamos la carpeta si no existe (recursive asegura que se cree 'uploads' si falta)
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        logger.info({
          service: 'UploadMiddleware',
          message: `Carpeta creada para la empresa con CUIT: ${cuit}`
        });
      }
      cb(null, uploadPath);
    } catch (err) {
      logger.error({
        service: 'UploadMiddleware',
        message: `Error creando directorio: ${err.message}`,
        cuit
      });
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    // Mantenemos el nombre del campo como nombre de archivo para consistencia
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Validación estricta de tipo de archivo
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
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por archivo
});

// Definición de campos permitidos en el legajo técnico
const companyUploads = upload.fields([
  { name: 'certificadoFiscal', maxCount: 1 },
  { name: 'constanciaInscripcion', maxCount: 1 },
  { name: 'polizaSeguro', maxCount: 1 }
]);

module.exports = companyUploads;