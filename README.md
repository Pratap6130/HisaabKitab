# HisaabKitab Billing Dashboard

HisaabKitab is a full-stack billing system for small and mid-sized businesses to manage customers, items, and invoices from one dashboard.

It is designed for practical daily operations: quick invoice creation, searchable records, and clear customer-level billing visibility.

## Business Focus
- Centralizes customer, item, and invoice data.
- Reduces manual billing steps and duplicate entries.
- Improves audit readiness with structured invoice history.
- Supports GST-aware billing flows.

## Technical Overview
- Frontend: React 18, React Router
- Backend: Node.js, Express
- Database: PostgreSQL (Neon in production)
- Deployment: Vercel (frontend), Render (backend), Neon (database)

## Core Modules
- Customer Master: create, update, list active/inactive customers
- Item Master: create, update, list active/inactive items
- Billing: generate invoices with line items and GST logic
- Dashboard: recent invoices, customer-wise invoices, invoice search

## API Surface
Base path: /api

- Customers
  - GET /customers/all
  - GET /customers/all-with-inactive
  - GET /customers/:id
  - POST /customers/create
  - PUT /customers/:id/update
  - DELETE /customers/:id/delete

- Items
  - GET /items/all
  - GET /items/all-with-inactive
  - GET /items/:id
  - POST /items/create
  - PUT /items/:id/update
  - DELETE /items/:id/delete

- Invoices
  - POST /invoices/create
  - GET /invoices/all
  - GET /invoices/recent
  - GET /invoices/customer/:customerId
  - GET /invoices/search
  - GET /invoices/details/:invoiceId

- Health Check
  - GET /health

## Local Setup
Prerequisites:
- Node.js 18+
- PostgreSQL

1. Clone the repository.
2. Backend setup:
   - Go to backend folder
   - Run npm install
3. Frontend setup:
   - Go to frontend folder
   - Run npm install
4. Database setup:
   - Run setup-database.bat from project root
   - Or execute backend/database/schema.sql manually in PostgreSQL
5. Start services:
   - Backend: npm run dev (inside backend)
   - Frontend: npm start (inside frontend)

## Environment Variables
Backend (.env):
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD
- DB_SSL
- PORT
- NODE_ENV
- FRONTEND_URL

Frontend (.env.production or Vercel env):
- REACT_APP_API_URL

## Deployment Notes
- Backend runs on Render and connects to Neon PostgreSQL with SSL.
- Frontend runs on Vercel and calls backend using REACT_APP_API_URL.
- Render CORS setting should match the Vercel frontend URL.

Current backend URL:
- https://logiedge-billing-backend.onrender.com

## Project Structure
- backend: Express APIs, DB config, schema, controllers, routes
- frontend: React UI, modules, API service layer
- setup-database.bat: local PostgreSQL bootstrap script

## Status
This project is production-deployed with separated frontend and backend services and a managed cloud PostgreSQL database.
