const docClient = require('../config/db');
const { GetCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

// Obtener todas las órdenes
exports.getAllOrders = async (req, res) => {
    try {
        const data = await docClient.send(new ScanCommand({
            TableName: process.env.ORDERS_TABLE
        }));
        res.json(data.Items);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las órdenes", details: error.message });
    }
};

// Obtener una orden por ID
exports.getOrderById = async (req, res) => {
    try {
        const data = await docClient.send(new GetCommand({
            TableName: process.env.ORDERS_TABLE,
            Key: { orderId: req.params.id }
        }));
        
        if (!data.Item) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        res.json(data.Item);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar la orden", details: error.message });
    }
};