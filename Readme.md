# E-Commerce Microservices — Database Structure

This document describes the **data structures used in DynamoDB** for the E-Commerce Microservices project.  
The system is composed of **two backend microservices**, each with its own database table.

- **Products Service** → manages the product catalog and stock
- **Orders Service** → manages customer orders

Each service follows the microservices principle of **owning its own data**.

---

# Database Overview

Two DynamoDB tables are used:

| Table Name | Service | Purpose |
|-------------|--------|--------|
| `Products` | Products Service | Stores the product catalog and stock |
| `Orders` | Orders Service | Stores orders created by customers |

---

# Products Table

This table stores all product information available in the store.

## Table Name

Products


## Primary Key

productId (String)


## Product Document Structure

Each product stored in the table follows this structure:

```json
{
  "productId": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "price": 0,
  "currency": "string",
  "stock": 0,
  "isActive": true,
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

## Example Product
```json
{
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
}
```

| Field       | Type    | Description                           |
| ----------- | ------- | ------------------------------------- |
| productId   | String  | Unique identifier of the product      |
| name        | String  | Product name                          |
| description | String  | Product description                   |
| category    | String  | Product category                      |
| price       | Number  | Product price                         |
| currency    | String  | Currency used for the price           |
| stock       | Number  | Available stock quantity              |
| isActive    | Boolean | Indicates if the product is available |
| createdAt   | String  | Creation timestamp                    |
| updatedAt   | String  | Last update timestamp                 |


