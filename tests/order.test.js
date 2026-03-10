const request = require('supertest');
const express = require('express');
const orderRoutes = require('../src/routes/orderRoutes');
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const docClientMock = mockClient(DynamoDBDocumentClient);

// Importamos los servicios para mockearlos
const productsService = require('../src/services/productsService');
const paymentService = require('../src/services/paymentsService');

jest.mock('../src/services/productsService');
jest.mock('../src/services/paymentsService');

const app = express();
app.use(express.json());
app.use('/orders', orderRoutes);

describe('POST /orders - Lógica de Negocio', () => {
  beforeEach(() => {
    docClientMock.reset();
    jest.clearAllMocks();
  });

  it('Debe crear una orden PAID y descontar stock cuando todo es correcto', async () => {
    // Simular producto con stock
    productsService.getProductById.mockResolvedValue({
      productId: 'P001', name: 'Mouse', price: 100, stock: 10 
    });

    // Simular pago exitoso
    paymentService.simulatePayment.mockResolvedValue({
      success: true, status: 'PAID', transactionId: 'PAY-123'
    });

    // Simular guardado en DB
    docClientMock.on(PutCommand).resolves({});

    const res = await request(app)
      .post('/orders')
      .send({
        userId: 'user1',
        items: [{ productId: 'P001', quantity: 2 }]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('PAID');
    // Verificamos que se llamó a la reducción de stock
    expect(productsService.updateProductStock).toHaveBeenCalledWith('P001', 2);
  });

  it('Debe retornar 400 si no hay stock suficiente', async () => {
    productsService.getProductById.mockResolvedValue({
      productId: 'P001', name: 'Mouse', price: 100, stock: 1 // Solo queda 1
    });

    const res = await request(app)
      .post('/orders')
      .send({
        userId: 'user1',
        items: [{ productId: 'P001', quantity: 5 }] // Pedimos 5
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('No hay suficiente stock');
  });

  it('Debe retornar 404 si el producto no existe', async () => {
    productsService.getProductById.mockResolvedValue(null);

    const res = await request(app)
      .post('/orders')
      .send({
        userId: 'user1',
        items: [{ productId: 'NONEXISTENT', quantity: 1 }]
      });

    expect(res.statusCode).toBe(404);
  });

  it('Debe retornar 400 si el la orden no tiene items', async () => {
    const res = await request(app)
      .post('/orders')
      .send({
        userId: 'user1'
      });
    expect(res.statusCode).toBe(400);
  });
});



describe('PUT /orders/:id/status', () => {
  beforeEach(() => {
    docClientMock.reset();
    jest.clearAllMocks();
  });

  it('Debe actualizar el status y descontar stock si pasa a PAID', async () => {
    const mockOrder = {
      orderId: '123',
      status: 'PAID',
      items: [{ productId: 'P001', quantity: 1 }]
    };

    // Simulamos que DynamoDB devuelve la orden actualizada
    docClientMock.on(UpdateCommand).resolves({
      Attributes: mockOrder
    });

    const res = await request(app)
      .put('/orders/123/status')
      .send({ status: 'PAID' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('PAID');
    // Verificamos que se llamó al servicio de productos al confirmar el pago
    expect(productsService.updateProductStock).toHaveBeenCalled();
  });

  it('Debe retornar 400 si el status enviado no es válido', async () => {
    const res = await request(app)
      .put('/orders/123/status')
      .send({ status: 'INVALID_STATUS' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid status value');
  });

  it('PUT /orders/:id/status - No debe descontar stock si el status es PENDING', async () => {
    docClientMock.on(UpdateCommand).resolves({
      Attributes: { orderId: '123', status: 'PENDING', items: [] }
    });

    const res = await request(app).put('/orders/123/status').send({ status: 'PENDING' });
    expect(res.statusCode).toBe(200);
    // Verificamos que NO se llamó a la función de stock
    expect(productsService.updateProductStock).not.toHaveBeenCalled();
  });
});


describe('GET /orders/:id & /orders/', () => {
  it('Debe obtener una orden por ID correctamente', async () => {
    docClientMock.on(GetCommand).resolves({
      Item: { orderId: '123', status: 'PAID' }
    });

    const res = await request(app).get('/orders/123');
    expect(res.statusCode).toBe(200);
    expect(res.body.orderId).toBe('123');
  });

  it('Debe obtener todas las ordenes', async () => {
    docClientMock.on(ScanCommand).resolves({
      Items: [
        { orderId: '123', status: 'PAID' },
        { orderId: '456', status: 'PENDING' }
      ]
    });

    const res = await request(app).get('/orders');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);    
    expect(res.body[0].orderId).toBe('123');    

  });
});

describe('DELETE /orders/:id', () => {
  it('Debe eliminar una orden existente', async () => {
    docClientMock.on(DeleteCommand).resolves({
      Attributes: { orderId: '123' }
    });

    const res = await request(app).delete('/orders/123');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Orden eliminada');
  });
});

describe('Escenarios de Error - Not Found', () => {
  it('GET /orders/:id - Debe retornar 404 si la orden no existe', async () => {
    docClientMock.on(GetCommand).resolves({ Item: null });
    const res = await request(app).get('/orders/999');
    expect(res.statusCode).toBe(404);
  });

  it('PUT /orders/:id/status - Debe retornar 404 si la orden no existe o no tiene cambios (Simulando error de Dynamo)', async () => {
    // Simulamos que DynamoDB lanza la excepción específica
    const error = new Error('Conditional check failed');
    error.name = 'ConditionalCheckFailedException'; // <--- Esto es lo que busca tu catch
    
    docClientMock.on(UpdateCommand).rejects(error);

    const res = await request(app)
      .put('/orders/999/status')
      .send({ status: 'PAID' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Orden no encontrada o sin cambios');
  });
});

describe('Escenarios de Error - Database Crash', () => {
  it('GET /orders - Debe retornar 500 si falla la base de datos', async () => {
    docClientMock.on(ScanCommand).rejects(new Error('DynamoDB Down'));
    const res = await request(app).get('/orders');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al obtener las órdenes');
  });

  it('POST /orders - Debe retornar 500 si hay un error inesperado', async () => {
    // Simulamos que algo falla antes de terminar el proceso
    productsService.getProductById.mockImplementationOnce(() => {
        throw new Error('Critical Error');
    });
    const res = await request(app).post('/orders').send({ userId: 'u1', items: [{productId: 'p1', quantity: 1}] });
    expect(res.statusCode).toBe(500);
  });
});
