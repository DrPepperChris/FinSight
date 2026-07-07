-- ============================================================
-- FinSight - Gold Reporting Views
-- Purpose:
--   Create SQL views over curated Silver and Gold Delta tables.
--
-- Intended use:
--   Databricks SQL dashboards, Power BI, and portfolio demos.
-- ============================================================

CREATE DATABASE IF NOT EXISTS finsight_reporting;

-- Customer/account-level reporting summary
CREATE OR REPLACE VIEW finsight_reporting.vw_customer_account_summary AS
SELECT
    customer_id,
    customer_name,
    account_id,
    account_number,
    transaction_count,
    total_transaction_amount,
    total_inflow_amount,
    total_outflow_amount,
    net_cash_flow,
    inflow_transaction_count,
    outflow_transaction_count,
    latest_transaction_date,
    gold_processed_timestamp
FROM finsight_gold.customer_account_summary;

-- Transaction volume by normalized type
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

-- High-value transactions for audit/risk review
CREATE OR REPLACE VIEW finsight_reporting.vw_high_value_transactions AS
SELECT
    transaction_id,
    customer_id,
    customer_name,
    account_id,
    account_number,
    transaction_type_normalized AS transaction_type,
    cash_flow_direction,
    amount,
    transaction_date,
    description
FROM finsight_silver.transactions_clean
WHERE amount >= 1000.00;

-- Daily transaction trend for dashboard charting
CREATE OR REPLACE VIEW finsight_reporting.vw_daily_transaction_trend AS
SELECT
    transaction_date,
    cash_flow_direction,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount
FROM finsight_silver.transactions_clean
GROUP BY
    transaction_date,
    cash_flow_direction;

-- Customer cash-flow summary for analyst review
CREATE OR REPLACE VIEW finsight_reporting.vw_customer_cash_flow AS
SELECT
    customer_id,
    customer_name,
    SUM(total_inflow_amount) AS total_inflow_amount,
    SUM(total_outflow_amount) AS total_outflow_amount,
    SUM(net_cash_flow) AS net_cash_flow,
    SUM(transaction_count) AS transaction_count,
    MAX(latest_transaction_date) AS latest_transaction_date
FROM finsight_gold.customer_account_summary
GROUP BY
    customer_id,
    customer_name;