




## Orders Table

This table stores customer orders created during checkout.

Table Name
Orders
Primary Key
orderId (String)
Order Document Structure

Each order stored in the table follows this structure:
```json
{
  "orderId": "string",
  "userId": "string",
  "status": "PENDING | CONFIRMED | PAID | CANCELLED",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "price": 0,
      "quantity": 0,
      "total": 0
    }
  ],
  "subtotal": 0,
  "total": 0,
  "currency": "string",
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

## Example Order
```json
{
  "orderId": "O001",
  "userId": "U123",
  "status": "PENDING",
  "items": [
    {
      "productId": "P001",
      "productName": "Wireless Mouse",
      "price": 399.99,
      "quantity": 2,
      "total": 799.98
    }
  ],
  "subtotal": 799.98,
  "total": 799.98,
  "currency": "MXN",
  "createdAt": "2026-03-05T19:00:00Z",
  "updatedAt": "2026-03-05T19:00:00Z"
}
```

| Field     | Type   | Description                                  |
| --------- | ------ | -------------------------------------------- |
| orderId   | String | Unique identifier of the order               |
| userId    | String | Identifier of the user who created the order |
| status    | String | Current order status                         |
| items     | Array  | List of products included in the order       |
| subtotal  | Number | Total before taxes or extra fees             |
| total     | Number | Final order total                            |
| currency  | String | Currency used                                |
| createdAt | String | Order creation timestamp                     |
| updatedAt | String | Last update timestamp                        |

## Order Status Values

Orders can have the following statuses:

| Status    | Description                            |
| --------- | -------------------------------------- |
| PENDING   | Order created but not processed        |
| CONFIRMED | Order confirmed after stock validation |
| PAID      | Payment processed successfully         |
| CANCELLED | Order cancelled                        |

## Microservice Data Ownership

Each microservice only accesses its own table.

| Service          | Database Table |
| ---------------- | -------------- |
| Products Service | `Products`     |
| Orders Service   | `Orders`       |

Communication between services happens via REST API, not direct database access.

## Example:

- Orders Service calls Products Service to check stock

- Orders Service calls Products Service to update stock

## Summary

The system uses two DynamoDB tables to support the microservice architecture:

- Products Table → manages product catalog and inventory

- Orders Table → manages customer orders and purchased items

Each service maintains independent data ownership, ensuring a clean separation between microservices.
