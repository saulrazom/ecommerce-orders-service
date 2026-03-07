/**
 * src/services/productsService.js
 * Cliente para el microservicio de Productos.
 */

// Mock de inventario para que puedas probar hoy mismo
const fakeInventory = {
    "P001": {
        "productId": "P001",
        "name": "Wireless Mouse",
        "description": "Ergonomic wireless mouse",
        "category": "ACCESSORIES",
        "price": 399.99,
        "currency": "MXN",
        "stock": 50,
        "isActive": true,
        "createdAt": "2026-03-05T18:30:00Z",
        "updatedAt": "2026-03-05T18:30:00Z"
    },
    "P002": {
        "productId": "P002",
        "name": "Mouse",
        "description": "mouse gamer",
        "category": "Electronics",
        "price": 399.99,
        "currency": "MXN",
        "stock": 10,
        "isActive": true,
        "createdAt": "2026-03-05T18:30:00Z",
        "updatedAt": "2026-03-05T18:30:00Z"
    },
    "P003": {
        "productId": "P003",
        "name": "Headphones",
        "description": "Wireless Headphones",
        "category": "Electronics",
        "price": 200,
        "currency": "MXN",
        "stock": 5,
        "isActive": true,
        "createdAt": "2026-03-05T18:30:00Z",
        "updatedAt": "2026-03-05T18:30:00Z"
    }
};

const getProductById = async (productId) => {
    console.log(`[Products Service] Consultando producto: ${productId}`);
    // Simula una latencia de red
    return new Promise((resolve) => {
        setTimeout(() => resolve(fakeInventory[productId] || null), 100);
    });
};

const updateProductStock = async (productId, quantity) => {
    console.log(`[Products Service] Simulando reducción de stock para ${productId}: -${quantity}`);
    return { success: true };
};

module.exports = {
    getProductById,
    updateProductStock
}