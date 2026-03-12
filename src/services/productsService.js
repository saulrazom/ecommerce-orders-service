/**
 * src/services/productsService.js
 * Cliente para el microservicio de Productos.
 */

const getProductById = async (productId) => {
    const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL;
    const finalUrl = PRODUCTS_SERVICE_URL + '/products/' + productId;

    console.log(`[Products Service] URL: ${finalUrl}`);

    const response = await fetch(finalUrl);
    
    // Agrega estas líneas
    console.log(`[Products Service] Status: ${response.status}`);
    const responseText = await response.text();
    console.log(`[Products Service] Body: ${responseText}`);

    if (response.status === 404) {
        return null;
    } else if (!response.ok) {
        throw new Error(`Error en Products Service: ${response.statusText}`);
    } 
    
    return JSON.parse(responseText);
};

const updateProductStock = async (productId, quantity) => {
    console.log(`[Products Service] Simulando reducción de stock para ${productId}: -${quantity}`);
    const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL;
    const finalUrl = PRODUCTS_SERVICE_URL + '/products/' + productId + '/stock';

    const product = await getProductById(productId);

    if (!product) {
        return null;
    } else {
        const newStock = product.stock - quantity;
        const response = await fetch(finalUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stock: newStock
            })
        });

        if (!response.ok) {
            const errorData = response.json();
            throw new Error(`Error al actualizar stock: ${errorData.message || response.statusText}`);            
        }

        const data = await response.json();

        return { success: true, data};
    }
};

module.exports = {
    getProductById,
    updateProductStock
}