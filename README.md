# FinSight

Enterprise banking platform built with ASP.NET Core, SQL Server, Azure, and Clean Architecture.

## Features

- JWT Authentication & Role-Based Authorization
- Customer Management
- Account Management
- Deposit, Withdrawal, and Transfer Processing
- Transaction History
- Loan Application Workflow
- Audit Logging
- Global Exception Handling
- FluentValidation
- Repository + Unit of Work Patterns
- SQL Server & Entity Framework Core
- Swagger / OpenAPI
- Unit Testing

## Tech Stack

- ASP.NET Core 6
- C#
- SQL Server
- Entity Framework Core
- JWT
- xUnit
- Moq
- FluentAssertions
- Azure planned

## Architecture

```text
API
 ↓
Services
 ↓
Repositories
 ↓
Unit of Work
 ↓
SQL Server
