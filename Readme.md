

# Orders Table

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


# Deployment and Configuration
Prerequisites
- **Node.js:** v22.x
- **Docker:** installed and running
- **AWS Account:** with a DynamoDB table named Orders


## Environment Variables
Create a `.env` file in the root directory

```
PORT=the-port-your-service-will-run-on
ORDERS_TABLE=Orders
PRODUCTS_SERVICE_URL=http://url-de-tu-api-gateway-o-lambda
ENV=dev/prod
AWS_REGION=your-aws-region
# AWS Credentials
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_SESSION_TOKEN=your-aws-session-token-if-applicable
```
(See `.env.example` for reference)

## Running with Docker (Local Testing)
Since the service is now configured for AWS Lambda using the official AWS base image, the container won't respond to standard browser requests on port 3000 directly unless you use the AWS Lambda Runtime Interface Emulator (RIE), which is included in the base image.

1. Build the container:
```bash
docker build -t orders-service .
```

1. Run the container:
```bash
docker run -p 9000:8080 --env-file .env orders-service
```
*Note: AWS Lambda images internaly listen on port 8080. We map it to 9000 for local testing.*

3. Test the Lambda trigger:
To test the service locally, you must send a JSON payload that simulates an API Gateway event to the Lambda entry point:
``` bash
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{"resource": "/orders", "path": "/orders", "httpMethod": "GET"}'
```



## API Endpoints
When deployed via **API Gateway**, the endpoints will be accessible as follows

| Endpoint            | Method  | Description                          |
| ------------------  | ------  | ------------------------------------ |
| /health             | GET     | Service health checks                |
| /orders             | GET     | Get all orders                       |
| /orders             | POST    | Create a new order                   |
| /orders/{orderId}   | GET     | Get order details by orderId         |

### Details:

POST the /orders route needs the following body structure:
``` json
{
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "quantity": 0
    }
  ]
}
```