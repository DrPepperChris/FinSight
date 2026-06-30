# FinSight Databricks Pipeline

This folder contains a Databricks-style data engineering pipeline for the FinSight banking demo application.

## Purpose

The goal is to demonstrate how FinSight banking data can move from operational application data into an analytics-ready lakehouse structure.

## Pipeline Layers

### Bronze

Raw transaction data is ingested with minimal transformation.

Notebook:

```text
notebooks/01_bronze_transactions_ingest.py