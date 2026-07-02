# FinSight Databricks Data Flow

This document explains how FinSight operational data is modeled for downstream analytics using a Databricks-style medallion architecture.

## Source Systems

FinSight operational data comes from the application database used by the ASP.NET Core API.

Core operational entities:

- Customers
- Accounts
- Account transactions
- Loan applications
- Audit logs

For this showcase, the Databricks pipeline uses CSV extracts that represent the same operational data used by the live FinSight demo.

## End-to-End Data Flow

```text
FinSight Web App
      ↓
FinSight ASP.NET Core API
      ↓
Azure SQL / SQL Server operational database
      ↓
Batch extract / CSV export
      ↓
Databricks Bronze Layer
      ↓
Databricks Silver Layer
      ↓
Databricks Gold Layer
      ↓
Reporting views / dashboard-ready outputs
```

## Bronze Layer

The Bronze layer stores raw data with minimal transformation.

Purpose:

- Preserve the original source structure
- Support traceability
- Allow reprocessing if business rules change
- Keep ingestion logic separate from business transformation logic

Example tables:

- `finsight_bronze.customers_raw`
- `finsight_bronze.accounts_raw`
- `finsight_bronze.transactions_raw`
- `finsight_bronze.loan_applications_raw`

## Silver Layer

The Silver layer cleans and standardizes the raw data.

Typical transformations:

- Cast IDs to integers
- Cast currency fields to decimals
- Parse timestamps
- Normalize status and type values
- Remove duplicate transaction IDs
- Add processing timestamps

Example tables:

- `finsight_silver.customers_clean`
- `finsight_silver.accounts_clean`
- `finsight_silver.transactions_clean`
- `finsight_silver.loan_applications_clean`

## Gold Layer

The Gold layer creates business-ready analytics datasets.

Example outputs:

- Customer account summary
- Transaction risk summary
- Portfolio summary
- High-value transaction review

Example tables:

- `finsight_gold.customer_account_summary`
- `finsight_gold.transaction_risk_summary`
- `finsight_gold.portfolio_summary`

## Reporting Layer

The reporting layer exposes Gold tables through SQL views or exported files.

Potential consumers:

- FinSight dashboard
- Power BI
- Tableau
- Databricks SQL dashboards
- Audit and compliance reporting
- Fraud/risk review workflows

## Why This Matters

This structure demonstrates how FinSight can support both operational banking workflows and analytics/data engineering workflows.

The live app shows software engineering.

The Databricks folder shows how the same data can be transformed for reporting, audit, risk analysis, and future machine learning use cases.