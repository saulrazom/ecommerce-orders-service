require('dotenv').config();
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/orders', orderRoutes);

// Endpoint de salud básico
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'Orders' }));

// Usar puerto para escuchar en local
if (process.env.ENV === 'dev') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });
}

// Para AWS Lambda
module.exports.handler = serverless(app);