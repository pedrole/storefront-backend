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

#### Orders
- Current Order by user (args: user id)[token required]
  - GET `/orders/current/:user_id`



## Data Shapes
#### Product
-  id
- name
- price


#### User
- id
- first_name
- last_name
- password

#### Orders
- id
- id of each product in the order
- quantity of each product in the order
- user_id
- status of order (active or complete)

## DB Schema

```
products {
	id serial pk
	name varchar def(255)
	price decimal
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
