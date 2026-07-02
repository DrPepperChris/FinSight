CREATE SCHEMA IF NOT EXISTS finsight_reporting;

CREATE OR REPLACE VIEW finsight_reporting.vw_customer_account_summary AS
SELECT
    customer_id,
    customer_number,
    full_name,
    risk_rating,
    total_accounts,
    total_balance,
    total_deposits,
    total_withdrawals,
    total_transaction_count,
    latest_transaction_timestamp
FROM finsight_gold.customer_account_summary;

CREATE OR REPLACE VIEW finsight_reporting.vw_transaction_risk_summary AS
SELECT
    customer_id,
    customer_number,
    full_name,
    risk_rating,
    total_transaction_count,
    high_value_transaction_count,
    flagged_transaction_count,
    total_transaction_volume,
    risk_signal
FROM finsight_gold.transaction_risk_summary;

CREATE OR REPLACE VIEW finsight_reporting.vw_high_value_or_flagged_transactions AS
SELECT
    transaction_id,
    account_id,
    customer_id,
    transaction_type,
    amount,
    currency,
    merchant_category,
    transaction_timestamp,
    channel,
    status,
    is_high_value,
    is_flagged
FROM finsight_silver.transactions_clean
WHERE is_high_value = true
   OR is_flagged = true;