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

**Query Parameters:**
* `page` (optional, integer): The page number of products to retrieve (e.g. `?page=2`). Each page returns up to 200 products.
* `q` (optional, string): Search query to filter products by name, slug, or product code.

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 5,
        "category_id": 3,
        "name": "Luxury Stainless Steel Watch",
        "slug": "luxury-watch-01",
        "base_price": "2500.00",
        "your_price": "2100.00",
        "stock": 45,
        "images": "https://backend.valokichu.com/storage/products/watch.webp",
        "product_code": "VK-W01"
      }
    ],
    "first_page_url": "https://backend.valokichu.com/api/dropshipping/products?page=1",
    "from": 1,
    "last_page": 7,
    "last_page_url": "https://backend.valokichu.com/api/dropshipping/products?page=7",
    "next_page_url": "https://backend.valokichu.com/api/dropshipping/products?page=2",
    "path": "https://backend.valokichu.com/api/dropshipping/products",
    "per_page": 200,
    "prev_page_url": null,
    "to": 200,
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

### 4. Categories

`GET /categories`

Retrieve active product categories and their subcategories.

**Query Parameters:**
* `parent_only` (optional, boolean): If `1`, returns only the top-level parent categories instead of all active categories.

**Response Example:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "parent_id": null,
      "image": "categories/electronics.png",
      "is_active": true,
      "priority": 1,
      "image_url": "https://backend.valokichu.com/storage/products/categories/electronics.png",
      "custom_icon_url": null,
      "children": [
        {
          "id": 2,
          "name": "Mobile Phones",
          "slug": "mobile-phones",
          "parent_id": 1,
          "image": null,
          "is_active": true,
          "priority": 1,
          "image_url": null,
          "custom_icon_url": null,
          "children": []
        }
      ]
    }
  ]
}
```

### 5. Place Order

`POST /orders`

Place a new order for a customer. You can specify the shipping method by passing `shipping_method_id` (integer ID from shipping methods), `shipping_method` (string keyword to dynamically match by name, e.g., "inside" or "outside"), or direct custom `shipping_cost` (numeric).

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
  },
  "shipping_method": "inside dhaka"
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

### 6. Retrieve Orders

`GET /orders`

Retrieve the order history for the authenticated dropshipper.

**Query Parameters:**
* `page` (optional, integer): The page number of orders to retrieve (e.g. `?page=2`). Each page returns up to 15 orders.

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 18,
        "user_id": 4,
        "name": "John Doe",
        "order_number": "ORD-699D64BCA354D",
        "subtotal": "956.00",
        "shipping_cost": "60.00",
        "discount": "0.00",
        "total_price": "1016.00",
        "currency": "BDT",
        "status": "pending",
        "payment_status": "unpaid",
        "created_at": "2026-06-25T16:30:00.000000Z",
        "items": [
          {
            "id": 22,
            "order_id": 18,
            "product_id": 5,
            "quantity": 2,
            "unit_price": "478.00",
            "total_price": "956.00",
            "product_name": "Luxury Watch"
          }
        ]
      }
    ],
    "first_page_url": "https://backend.valokichu.com/api/dropshipping/orders?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "https://backend.valokichu.com/api/dropshipping/orders?page=1",
    "next_page_url": null,
    "path": "https://backend.valokichu.com/api/dropshipping/orders",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

## Security Rules

1. **IP Whitelisting**: Your server's IP must be authorized in the security settings.
2. **Rate Limiting**: Limited to 60 requests per minute per key.
3. **Nonce Expiry**: `X-TIMESTAMP` must be within 5 minutes of our server time.
