# Databricks notebook source
# ============================================================
# FinSight - Gold Customer Account Summary
# Purpose:
#   Build reporting-ready customer/account transaction summaries.
#
# Input:
#   finsight_silver.transactions_clean
#
# Output:
#   finsight_gold.customer_account_summary
# ============================================================

from pyspark.sql.functions import (
    col,
    count,
    current_timestamp,
    max as spark_max,
    sum as spark_sum,
    when
)

# COMMAND ----------

spark.sql("CREATE DATABASE IF NOT EXISTS finsight_gold")

# COMMAND ----------

silver_df = spark.table("finsight_silver.transactions_clean")

gold_df = (
    silver_df
        .groupBy(
            "customer_id",
            "customer_name",
            "account_id",
            "account_number"
        )
        .agg(
            count("*").alias("transaction_count"),
            spark_sum("amount").alias("total_transaction_amount"),
            spark_sum(
                when(col("cash_flow_direction") == "Inflow", col("amount")).otherwise(0)
            ).alias("total_inflow_amount"),
            spark_sum(
                when(col("cash_flow_direction") == "Outflow", col("amount")).otherwise(0)
            ).alias("total_outflow_amount"),
            spark_sum(
                when(col("cash_flow_direction") == "Inflow", 1).otherwise(0)
            ).alias("inflow_transaction_count"),
            spark_sum(
                when(col("cash_flow_direction") == "Outflow", 1).otherwise(0)
            ).alias("outflow_transaction_count"),
            spark_max("transaction_date").alias("latest_transaction_date")
        )
        .withColumn(
            "net_cash_flow",
            col("total_inflow_amount") - col("total_outflow_amount")
        )
        .withColumn("gold_processed_timestamp", current_timestamp())
)

# COMMAND ----------

(
    gold_df.write
        .format("delta")
        .mode("overwrite")
        .option("overwriteSchema", "true")
        .saveAsTable("finsight_gold.customer_account_summary")
)

# COMMAND ----------

display(spark.table("finsight_gold.customer_account_summary"))