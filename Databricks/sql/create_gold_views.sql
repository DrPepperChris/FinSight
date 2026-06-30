-- ============================================================
-- FinSight - Gold Reporting Views
-- Purpose:
--   Create SQL views over curated Gold and Silver tables.
--
-- These views are intended for dashboards, reporting, and
-- future Power BI / Databricks SQL use.
-- ============================================================

CREATE DATABASE IF NOT EXISTS finsight_reporting;

CREATE OR REPLACE VIEW finsight_reporting.vw_customer_account_summary AS
SELECT
    customer_id,
    customer_name,
    account_id,
    account_number,
    transaction_count,
    total_transaction_amount,
    inflow_transaction_count,
    outflow_transaction_count,
    latest_transaction_date
FROM finsight_gold.customer_account_summary;

CREATE OR REPLACE VIEW finsight_reporting.vw_transaction_volume_by_type AS
SELECT
    transaction_type_normalized AS transaction_type,
    cash_flow_direction,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount
FROM finsight_silver.transactions_clean
GROUP BY
    transaction_type_normalized,
    cash_flow_direction;

CREATE OR REPLACE VIEW finsight_reporting.vw_high_value_transactions AS
SELECT
    transaction_id,
    customer_id,
    customer_name,
    account_id,
    account_number,
    transaction_type_normalized AS transaction_type,
    amount,
    transaction_date,
    description
FROM finsight_silver.transactions_clean
WHERE amount >= 1000.00;