const docClient = require('../config/db');
const { GetCommand, ScanCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');
const productsService = require('../services/productsService');
const paymentService = require('../services/paymentsService');

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

async function findOrderById(orderId){
    try {
        const data = await docClient.send(new GetCommand({
            TableName: process.env.ORDERS_TABLE,
            Key: { orderId }
        }));

        return data.Item || null;
    } catch (error) {
        throw error;
    }
}

// Obtener una orden por ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await findOrderById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        return res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar la orden", details: error.message });
    }
};

// Crear una nueva orden
exports.postOrder = async (req, res) => {
    try {
        const { userId, items, currency} = req.body

        const order = {
            userId: userId,
            items: items,
            currency: currency
        }

        if (!items || items.length == 0){
            return res.status(400).json({ message: "La orden debe contener al menos un producto" });
        }

        let total = 0;
        const processedItems = []
        for (const item of items) {
            // Si es producto existe
            const product = await productsService.getProductById(item.productId)

            if (!product) {
                return res.status(404).json({ message: `Producto con id ${item.productId} no encontrado` })
            }

            // Validar stock y precios
            if (product.stock < item.quantity) {
                return res.status(400).json({message: `No hay suficiente stock del producto ${product.name}`})
            }

            // Calcular total
            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            // Crear el objeto y agregarlo a los items
            processedItems.push({
                "productId": product.productId,
                "price": product.price,
                "quantity": item.quantity,
                "total": total
            });

        }

        // Simular pagos
        const paymentResponse = await paymentService.simulatePayment(total);

        // Crear orden
        const newOrder = {
            "orderId": uuidv4(),
            "userId": userId,
            "status": paymentResponse.status,
            "items": processedItems,
            "subtotal": total,
            "total": total,
            "currency": currency || "MXN",
            "createdAt": new Date().toISOString(),
            "updatedAt": new Date().toISOString()
        }

        // Guardar en DynamoDB
        await docClient.send(new PutCommand({
            TableName: process.env.ORDERS_TABLE,
            Item: newOrder
        }))

        // Reducir el stock de cada producto solo si el pago no quedó pendiente o fue cancelado
        if (["PAID", "CONFIRMED"].includes(newOrder.status)) {
            for (const item of items) {
                await productsService.updateProductStock(item.productId, item.quantity);
            }
        }

        // Devoler confirmación de creación de orden
        res.status(201).json({ 
            message: "Proceso de orden finalizado",
            status: newOrder.status,
            order: newOrder
        });
    } catch (error) {
        res.status(500).json({ error: "Error al procesar la orden", details: error.message });
    }
}

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