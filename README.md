# FinSight

FinSight is a full-stack banking and financial analytics demo application built with ASP.NET Core, SQL Server, React, TypeScript, JWT authentication, and a Databricks-style Bronze/Silver/Gold analytics pipeline.

The project is designed to demonstrate enterprise software engineering, API development, secure frontend integration, database-backed workflows, and data engineering architecture.

---

## Tech Stack

### Backend

- ASP.NET Core Web API
- C#
- Entity Framework Core
- SQL Server
- JWT authentication
- Role-based authorization
- FluentValidation
- Repository and service-layer architecture
- Audit logging
- Swagger/OpenAPI

### Frontend

- React
- TypeScript
- Vite
- Axios
- React Router
- Protected routes
- Auth context
- JWT token storage
- Dark enterprise-style UI

### Data Engineering

- Azure Databricks-style pipeline
- PySpark notebooks
- Delta table design
- Bronze, Silver, and Gold lakehouse layers
- SQL reporting views
- Sample financial transaction data

---

## Current Features

### Authentication

- User login through the FinSight API
- JWT token storage in localStorage
- Protected frontend routes
- Logout functionality
- Navbar updates based on authentication state

### Customers

- Loads customer profiles from the API
- Displays customer number, name, email, risk rating, and created date
- Uses paged API result handling

### Accounts

- Loads account records from the API
- Displays account number, customer, account type, and status
- Known issue: account balance field mapping needs to be aligned between the API DTO and frontend

### Transactions

- Loads transactions by selected account
- Uses the account-scoped endpoint:

```text
GET /api/Accounts/{accountId}/transactions