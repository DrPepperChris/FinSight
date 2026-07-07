# Databricks notebook source
# ============================================================
# FinSight - Silver Transactions Clean
# Purpose:
#   Clean, type, standardize, and classify Bronze transactions.
#
# Input:
#   finsight_bronze.transactions_raw
#
# Output:
#   finsight_silver.transactions_clean
# ============================================================

from pyspark.sql.functions import (
    col,
    current_timestamp,
    initcap,
    trim,
    upper,
    when,
    to_date
)

# COMMAND ----------

spark.sql("CREATE DATABASE IF NOT EXISTS finsight_silver")

# COMMAND ----------

bronze_df = spark.table("finsight_bronze.transactions_raw")

silver_df = (
    bronze_df
        .select(
            col("transaction_id").cast("int").alias("transaction_id"),
            col("account_id").cast("int").alias("account_id"),
            col("customer_id").cast("int").alias("customer_id"),
            trim(col("account_number")).alias("account_number"),
            initcap(trim(col("customer_name"))).alias("customer_name"),
            trim(col("transaction_type")).alias("transaction_type"),
            upper(trim(col("transaction_type"))).alias("transaction_type_code"),
            col("amount").cast("decimal(18,2)").alias("amount"),
            to_date(col("transaction_date")).alias("transaction_date"),
            trim(col("description")).alias("description"),
            col("ingestion_timestamp"),
            current_timestamp().alias("silver_processed_timestamp")
        )
        .withColumn(
            "transaction_type_normalized",
            when(col("transaction_type_code") == "DEPOSIT", "Deposit")
            .when(col("transaction_type_code") == "WITHDRAWAL", "Withdrawal")
            .when(col("transaction_type_code") == "TRANSFERIN", "Transfer In")
            .when(col("transaction_type_code") == "TRANSFEROUT", "Transfer Out")
            .otherwise("Other")
        )
        .withColumn(
            "cash_flow_direction",
            when(col("transaction_type_code").isin("DEPOSIT", "TRANSFERIN"), "Inflow")
            .when(col("transaction_type_code").isin("WITHDRAWAL", "TRANSFEROUT"), "Outflow")
            .otherwise("Unknown")
        )
        .filter(col("transaction_id").isNotNull())
        .filter(col("account_id").isNotNull())
        .filter(col("customer_id").isNotNull())
        .filter(col("amount").isNotNull())
        .filter(col("transaction_date").isNotNull())
)

# COMMAND ----------

(
    silver_df.write
        .format("delta")
        .mode("overwrite")
        .option("overwriteSchema", "true")
        .saveAsTable("finsight_silver.transactions_clean")
)

# COMMAND ----------

display(spark.table("finsight_silver.transactions_clean"))