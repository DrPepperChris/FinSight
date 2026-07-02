# FinSight Databricks ETL Showcase

This folder demonstrates how FinSight banking application data can be transformed into analytics-ready datasets using a Databricks-style medallion architecture.

## Purpose

FinSight is a full-stack banking demo built with ASP.NET Core, Azure SQL, React, and TypeScript. The Databricks showcase demonstrates how operational data from the application can support analytics, reporting, audit review, and future fraud or risk analysis.

## Medallion Architecture

```text
Operational Data
      ↓
Bronze Layer
      ↓
Silver Layer
      ↓
Gold Layer
      ↓
Reporting Layer
```

## Data Sources

Sample operational extracts are stored in:

```text
Databricks/sample-data
```

Included sample files:

```text
customers_sample.csv
accounts_sample.csv
transactions_sample.csv
loan_applications_sample.csv
```

These files represent exports from the FinSight operational database.

## Pipeline Layers

### Bronze

Bronze notebooks ingest raw CSV extracts into Delta tables with minimal transformation.

Tables:

```text
finsight_bronze.customers_raw
finsight_bronze.accounts_raw
finsight_bronze.transactions_raw
finsight_bronze.loan_applications_raw
```

### Silver

Silver notebooks clean and standardize the raw data.

Transformations include:

```text
Type casting
Timestamp parsing
Status normalization
Deduplication
High-value transaction flags
Flagged transaction indicators
Processing timestamps
```

Tables:

```text
finsight_silver.customers_clean
finsight_silver.accounts_clean
finsight_silver.transactions_clean
finsight_silver.loan_applications_clean
```

### Gold

Gold notebooks create analytics-ready business datasets.

Tables:

```text
finsight_gold.customer_account_summary
finsight_gold.transaction_risk_summary
finsight_gold.portfolio_summary
```

### Reporting

Reporting SQL views expose Gold outputs for dashboards and BI tools.

Views:

```text
finsight_reporting.vw_customer_account_summary
finsight_reporting.vw_transaction_risk_summary
finsight_reporting.vw_high_value_or_flagged_transactions
```

## Notebook Run Order

Run the notebooks in this order:

```text
01_bronze_ingest_operational_data.py
02_silver_clean_and_standardize.py
03_gold_customer_account_analytics.py
04_reporting_views_and_exports.py
```

## Sample Outputs

Example Gold and reporting outputs are stored in:

```text
Databricks/sample-output
```

These files show what the Databricks pipeline is expected to produce.

## Portfolio Value

This folder demonstrates:

```text
PySpark notebook development
Delta Lake table modeling
Medallion architecture
ETL/ELT workflow design
Banking analytics use cases
Risk and audit reporting concepts
Dashboard-ready reporting views
```

The live FinSight web app demonstrates operational software engineering. This Databricks section demonstrates how the same operational data can be transformed for analytics and reporting.