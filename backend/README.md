# Jersea Backend

This backend is built with Node.js, Express, JavaScript, Sequelize, and PostgreSQL.

## Recommended database

Use PostgreSQL.

Why:
- ecommerce data is relational: users, products, carts, addresses, orders, order items
- stock updates and order creation need consistency
- filtering, reporting, and admin views are easier to manage cleanly

## Core features included

- JWT auth with user and admin roles
- product catalog with stock, sizes, featured flag, and category filtering
- user addresses
- shopping cart
- order creation from cart
- admin product management
- admin order management
- simple dashboard stats

## Setup

1. Copy `.env.example` to `.env`
2. Create a PostgreSQL database
3. Install dependencies with `npm install`
4. Start the API with `npm run dev`
5. Optional seed with `npm run seed`
