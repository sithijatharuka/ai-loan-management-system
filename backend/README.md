# Ailoansyatem Backend

This backend provides an Express API and MongoDB persistence for the loan management frontend.

## Setup

1. Copy `.env.example` to `.env`
2. Set `MONGO_URI` to your MongoDB connection string
3. Run `npm install`

## Run

- `npm run dev` — start the backend with `nodemon`
- `npm start` — start the backend once

## API endpoints

- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `GET /api/transactions`
- `POST /api/transactions`

The frontend is configured to proxy `/api` to `http://localhost:4000` during development.
