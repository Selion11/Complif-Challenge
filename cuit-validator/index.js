const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => res.status(200).send('OK'));

// Simulación de validación de formato CUIT (Mock) 
app.post('/validate-cuit', (req, res) => {
  const { cuit } = req.body;
  
  // Expresión regular para validar formato XX-XXXXXXXX-X o XXXXXXXXXXX
  const cuitRegex = /^(20|23|27|30|33)([0-9]{8})([0-9])$/;
  const isValid = cuitRegex.test(cuit.replace(/-/g, ''));

  if (isValid) {
    return res.json({ valid: true, message: 'CUIT con formato correcto' });
  } else {
    return res.status(400).json({ valid: false, message: 'Formato de CUIT inválido' });
  }
});

app.listen(3001, () => console.log('Microservicio de Validación corriendo en puerto 3001'));