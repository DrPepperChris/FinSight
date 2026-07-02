# Databricks notebook source
# MAGIC %md
# MAGIC # FinSight Reporting Views and Exports
# MAGIC
# MAGIC This notebook creates SQL reporting views over Gold tables.
# MAGIC
# MAGIC These views represent what could feed dashboards, BI tools, audit reporting, or future FinSight analytics screens.

# COMMAND ----------

gold_schema = "finsight_gold"
reporting_schema = "finsight_reporting"

spark.sql(f"CREATE SCHEMA IF NOT EXISTS {reporting_schema}")

# COMMAND ----------

spark.sql(f"""
CREATE OR REPLACE VIEW {reporting_schema}.vw_customer_account_summary AS
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
FROM {gold_schema}.customer_account_summary
""")

# COMMAND ----------

spark.sql(f"""
CREATE OR REPLACE VIEW {reporting_schema}.vw_transaction_risk_summary AS
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
FROM {gold_schema}.transaction_risk_summary
""")

# COMMAND ----------

spark.sql(f"""
CREATE OR REPLACE VIEW {reporting_schema}.vw_high_value_or_flagged_transactions AS
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
   OR is_flagged = true
""")

# COMMAND ----------

display(spark.sql(f"SHOW VIEWS IN {reporting_schema}"))
display(spark.sql(f"SELECT * FROM {reporting_schema}.vw_customer_account_summary"))
display(spark.sql(f"SELECT * FROM {reporting_schema}.vw_transaction_risk_summary"))
display(spark.sql(f"SELECT * FROM {reporting_schema}.vw_high_value_or_flagged_transactions"))