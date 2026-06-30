# Databricks notebook source
# ============================================================
# FinSight - Gold Customer Account Summary
# Purpose:
#   Build business-level financial summaries for reporting.
#
# Layer:
#   Gold = curated business metrics and dashboard-ready tables
# ============================================================

from pyspark.sql.functions import col, count, sum as spark_sum, max as spark_max

silver_table_name = "finsight_silver.transactions_clean"
gold_table_name = "finsight_gold.customer_account_summary"

# COMMAND ----------

spark.sql("CREATE DATABASE IF NOT EXISTS finsight_gold")

transactions_df = spark.table(silver_table_name)

# COMMAND ----------

gold_df = (
    transactions_df
    .groupBy(
        "customer_id",
        "customer_name",
        "account_id",
        "account_number"
    )
    .agg(
        count("transaction_id").alias("transaction_count"),
        spark_sum(
            col("amount")
        ).alias("total_transaction_amount"),
        spark_sum(
            (col("cash_flow_direction") == "INFLOW").cast("int")
        ).alias("inflow_transaction_count"),
        spark_sum(
            (col("cash_flow_direction") == "OUTFLOW").cast("int")
        ).alias("outflow_transaction_count"),
        spark_max("transaction_date").alias("latest_transaction_date")
    )
)

# COMMAND ----------

gold_df.write.mode("overwrite").format("delta").saveAsTable(
    gold_table_name
)

# COMMAND ----------

display(gold_df)

# COMMAND ----------

print(f"Gold summary complete. Table written: {gold_table_name}")