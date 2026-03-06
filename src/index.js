require('dotenv').config();
const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/orders', orderRoutes);

// Endpoint de salud básico
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'Orders' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Órdenes (Node 22) corriendo en puerto ${PORT}`);
});