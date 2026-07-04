# FinSight Databricks Pipeline

This folder contains a Databricks-style lakehouse analytics pipeline for the FinSight banking modernization demo.

The goal is to show how operational banking data from the FinSight application can be moved into an analytics-ready structure using a Bronze, Silver, and Gold medallion architecture.

## Purpose

This pipeline demonstrates:

- Raw financial transaction ingestion
- Data cleansing and standardization with PySpark
- Delta table creation
- Bronze, Silver, and Gold lakehouse layering
- SQL reporting views for dashboards and future Power BI integration
- Audit/risk-style analytics such as high-value transaction review

## Folder Structure

```text
Databricks/
  notebooks/
    01_bronze_transactions_ingest.py
    02_silver_transactions_clean.py
    03_gold_customer_account_summary.py
  sample-data/
    transactions_sample.csv
  sql/
    create_gold_views.sql
  README.md