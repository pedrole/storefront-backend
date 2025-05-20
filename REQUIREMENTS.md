# API Requirements
The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application.

## API Endpoints
#### Products
- Index
  - GET `/products`
- Show
  - GET `/products/:id`
- Create [token required]
  - POST `/products`


#### Users
- Index [token required]
  - `/users`
- Show [token required]
  - `/users/:id`
- Create N[token required]
  - `/users`
- Login
  - POST `/users/login/`

#### Orders
- **Current Order by user** (args: user id) [token required]
  `GET /orders/current/:user_id`
- **Add product to current order** [token required]
  `POST /orders/add-product`
- **Update product quantity in current order** [token required]
  `PUT /orders/update-product`
- **Create order** [token required]
  `POST /orders`
- **Complete current order** [token required]
  - `PATCH /orders/complete-current-order`
    - **Request Parameters**:
      - `user_id` (integer, required): The ID of the user whose order is being completed.
    - **Response Schema**:
      - `order_id` (integer): The ID of the completed order.
      - `status` (string): The updated status of the order (`complete`).
      - `message` (string): A confirmation message.
    - **Status Codes**:
      - `200 OK`: The order was successfully completed.
      - `400 Bad Request`: The request is missing required parameters or contains invalid data.
      - `401 Unauthorized`: The user is not authenticated or lacks the required token.
      - `404 Not Found`: The specified order or user does not exist.
      - `409 Conflict`: The order is already completed or cannot be modified.



## Data Shapes
#### Product
-  id
- name
- price
- `image` (optional)


#### User
- id
- first_name
- last_name
- password

### Order
- `id`
- `user_id`
- `status` (active or complete)
- `products`: array of products in the order, each with:
  - `product_id`
  - `name`
  - `price`
  - `quantity`
  - `image`

#### OrderProduct
- order_id
- product_id
- status

## DB Schema

```
products {
	id serial pk
	name varchar def(255)
	price decimal
  image varchar def(255)
}

users {
	id serial pk
	firstName varchar def(255)
	lastName varchar def(255)
	password varchar def(255)
}

Orders {
	id serial pk
	user_id integer > users.id
	status varchar def(50)
}

order_products {
	id integer pk increments unique
	order_id integer >* Orders.id
	product_id integer >* products.id
	quantity integer(10)
}
```

## Notes

- When updating a product's quantity in an order, if the quantity is set to 0 or less, the product will be removed from the order. The API will return a distinct response indicating removal.
- All order modifications (add/update/remove product) are performed atomically to ensure data consistency.
- Completing an order will set its status to `complete` and prevent further modifications to that order.
