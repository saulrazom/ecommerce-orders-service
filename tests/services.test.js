const productsService = require('../src/services/productsService');
const paymentService = require('../src/services/paymentsService');

describe('Pruebas Unitarias de Servicios (Lógica Real)', () => {
  
  it('productsService - getProductById debe devolver datos del mock interno', async () => {
    const product = await productsService.getProductById('P001');
    expect(product).not.toBeNull();
    expect(product.productId).toBe('P001');
    expect(product.name).toBe('Wireless Mouse');
  });

  it('productsService - updateProductStock debe responder exitosamente', async () => {
    const result = await productsService.updateProductStock('P001', 5);
    expect(result.success).toBe(true);
  });

  it('paymentsService - debe funcionar y devolver el pago el simulador', async () => {
    // Ejecutamos varias veces para entrar en todos los casos del switch (PAID, PENDING, etc.)
    const res = await paymentService.simulatePayment(100);
    expect(res).toHaveProperty('status');
    expect(res).toHaveProperty('success');
  });
});

describe('Payments Service - Branch Coverage', () => {
  it('Debe cubrir todos los casos del switch (PAID, CONFIRMED, PENDING, CANCELLED)', async () => {
    // Espiamos el Math.random para forzar los escenarios
    const spy = jest.spyOn(Math, 'random');

    // Escenario 1: PAID (random > 0.4)
    spy.mockReturnValueOnce(0.5);
    const res1 = await paymentService.simulatePayment(100);
    expect(res1.status).toBe('PAID');

    // Escenario 2: CONFIRMED (random > 0.3)
    spy.mockReturnValueOnce(0.35);
    const res2 = await paymentService.simulatePayment(100);
    expect(res2.status).toBe('CONFIRMED');

    // Escenario 3: PENDING (random > 0.15)
    spy.mockReturnValueOnce(0.2);
    const res3 = await paymentService.simulatePayment(100);
    expect(res3.status).toBe('PENDING');

    // Escenario 4: CANCELLED (else)
    spy.mockReturnValueOnce(0.1);
    const res4 = await paymentService.simulatePayment(100);
    expect(res4.status).toBe('CANCELLED');

    spy.mockRestore();
  }, 15000);
});