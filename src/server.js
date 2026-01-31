require('dotenv').config(); 

const app = require('./app'); 

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
});