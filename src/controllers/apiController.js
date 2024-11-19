const axios = require('axios');

exports.calculatePension = async (req, res) => {
    try {
        const data = req.body; // Aquí obtienes los datos enviados desde el frontend
        const apiUrl = 'http://ec2-54-177-111-101.us-west-1.compute.amazonaws.com:8080';
        
        // Hacer la petición a la API en Delphi
        const response = await axios.post(apiUrl, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Devolver la respuesta de la API
        res.json(response.data);
    } catch (error) {
        console.error('Error en la petición a la API:', error);
        res.status(500).send('Error en el cálculo de la pensión');
    }
};
