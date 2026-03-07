/**
 * src/services/paymentsService.js
 * Cliente para procesar los pagos.
 */

const PAID = 1
const CONFIRMED = 2
const PENDING = 3
const CANCELLED = 4
const simulatePayment = async (amount) => {
    console.log(`[Payment Service] Procesando pago por: ${amount}...`);
    
    // Simular latencia de red (2 segundos)
    await new Promise(resolve => setTimeout(resolve, 2000));


    // Lógica de estados basada en probabilidades
    const random = Math.random();


    let status = 0;
    if (random > 0.4) status = PAID;
    else if (random > 0.3) status = CONFIRMED;
    else if (random > 0.15) status = PENDING;
    else status = CANCELLED;

    // Descomentar linea si se quieren hacer pruebas
    // status = CANCELLED;

    switch (status) {
        case PAID:
            return {
                success: true,
                status: "PAID",
                transactionId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                message: "Pago aprobado"
            };
        case CONFIRMED:
            return {
                success: true,
                status: "CONFIRMED", // Simula un pago que quedó en revisión y ya fue confirmado
                transactionId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                message: "Pago en confirmado"
            };
        case PENDING:
            return {
                success: false,
                status: "PENDING", // Simula un pago que quedó en revisión
                transactionId: `PAY-REV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                message: "Pago en revisión por el banco"
            };
        case CANCELLED:
            return {
                success: false,
                status: "CANCELLED", // Pago fallido resulta en orden cancelada
                message: "Fondos insuficientes o tarjeta rechazada"
            };
        default:
            return {
                success: false,
                status: "ERROR",
                message: "Error desconocido en el proceso de pago"
            };
    }

};

module.exports = {
    simulatePayment
}