# Dropshipping API Documentation

Welcome to the **Valo Kichu Dropshipping API**. This gateway allows you to programmatically access our product catalog, check live stock, and place orders directly from your own systems.

## Base URL

`https://backend.valokichu.com/api/dropshipping`

## Authentication

All requests must be signed using **HMAC-SHA256**. You need an **Access Key** and a **Secret Key** from your Dropshipper Dashboard.

### Required Headers (Secure HMAC)

| Header        | Description                          |
| :------------ | :----------------------------------- |
| `X-API-KEY`   | Your Access Key                      |
| `X-SIGNATURE` | HMAC-SHA256 signature of the request |
| `X-TIMESTAMP` | Current Unix timestamp in seconds    |

### Simple Mode (Query Parameters)

For easy integration or checking in your browser, you can pass your credentials directly in the URL:
`https://backend.valokichu.com/api/dropshipping?key=YOUR_KEY&secret=YOUR_SECRET`

**Note:** Only use Simple Mode for `GET` requests (Listing products). For `POST` requests (Placing orders), we recommend the Secure HMAC method.

### Signature Generation

1. Concatenate: `ACCESS_KEY` + `TIMESTAMP` + `REQUEST_METHOD`
2. Create a hash using `SECRET_KEY` and the SHA256 algorithm.
3. Send the result in the `X-SIGNATURE` header.

---

## Endpoints

### 1. List Products

`GET /products`

Fetch all active products with your personalized dropshipper pricing.

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 5,
        "name": "Luxury Stainless Steel Watch",
        "slug": "luxury-watch-01",
        "base_price": "2500.00",
        "your_price": "2100.00",
        "stock": 45,
        "images": "https://backend.valokichu.com/storage/products/watch.webp",
        "product_code": "VK-W01"
      }
    ],
    "total": 1250
  }
}
```

### 2. Product Detail

`GET /products/{id}`

Get full specifications and gallery for a specific product.

### 3. Check Balance

`GET /balance`

Check your current wallet balance.

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "balance": 15400.5,
    "currency": "BDT"
  }
}
```

### 4. Place Order

`POST /orders`

Place a new order for a customer. You can place an order for a single product or multiple products in one request.

**Recommended Request Body (Multiple Products):**

```json
{
  "products": [
    {
      "product_id": 5,
      "quantity": 2,
      "variation_id": 12
    },
    {
      "product_id": 8,
      "quantity": 1
    }
  ],
  "shipping_address": {
    "name": "John Doe",
    "phone": "017XXXXXXXX",
    "address": "House 12, Road 5",
    "city": "Dhaka"
  }
}
```

**Backward Compatible Request Body (Single Product):**

```json
{
  "product_id": 5,
  "quantity": 1,
  "variation_id": 12,
  "shipping_address": {
    "name": "John Doe",
    "phone": "017XXXXXXXX",
    "address": "House 12, Road 5",
    "city": "Dhaka"
  }
}
```

**Response Example:**

```json
{
  "status": "success",
  "message": "Order placed successfully.",
  "order_id": 1054,
  "total_amount": 2100.0
}
```

## Security Rules

1. **IP Whitelisting**: Your server's IP must be authorized in the security settings.
2. **Rate Limiting**: Limited to 60 requests per minute per key.
3. **Nonce Expiry**: `X-TIMESTAMP` must be within 5 minutes of our server time.
