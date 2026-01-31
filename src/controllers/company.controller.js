const createCompany = (req, res) => {
    const { nombre, cuit, pais, industria } = req.body;

    if (!nombre || !cuit || !pais || !industria) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos obligatorios: nombre, cuit, pais o industria"
        });
    }

    res.status(201).json({
        success: true,
        message: "Datos de empresa recibidos correctamente",
        data: {
            nombre,
            cuit,
            pais,
            industria
        }
    });
};

module.exports = {
    createCompany
};