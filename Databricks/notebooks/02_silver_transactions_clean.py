# Databricks notebook source
# ============================================================
# FinSight - Silver Transactions Clean
# Purpose:
#   Clean, type, standardize, and validate Bronze transaction data.
#
# Layer:
#   Silver = cleaned, typed, analytics-ready records
# ============================================================

from pyspark.sql.functions import col, trim, upper, to_date, when

bronze_table_name = "finsight_bronze.transactions_raw"
silver_table_name = "finsight_silver.transactions_clean"

# COMMAND ----------

spark.sql("CREATE DATABASE IF NOT EXISTS finsight_silver")

bronze_df = spark.table(bronze_table_name)

# COMMAND ----------

silver_df = (
    bronze_df
    .withColumn("transaction_id", col("transaction_id").cast("int"))
    .withColumn("account_id", col("account_id").cast("int"))
    .withColumn("customer_id", col("customer_id").cast("int"))
    .withColumn("account_number", trim(col("account_number")))
    .withColumn("customer_name", trim(col("customer_name")))
    .withColumn("transaction_type", trim(col("transaction_type")))
    .withColumn("transaction_type_normalized", upper(trim(col("transaction_type"))))
    .withColumn("amount", col("amount").cast("decimal(18,2)"))
    .withColumn("transaction_date", to_date(col("transaction_date")))
    .withColumn("description", trim(col("description")))
    .withColumn(
        "cash_flow_direction",
        when(col("transaction_type_normalized").isin("DEPOSIT", "TRANSFERIN"), "INFLOW")
        .when(col("transaction_type_normalized").isin("WITHDRAWAL", "TRANSFEROUT"), "OUTFLOW")
        .otherwise("UNKNOWN")
    )
    .filter(col("transaction_id").isNotNull())
    .filter(col("account_id").isNotNull())
    .filter(col("amount").isNotNull())
)

# COMMAND ----------

silver_df.write.mode("overwrite").format("delta").saveAsTable(
    silver_table_name
)

# COMMAND ----------

display(silver_df)

# COMMAND ----------

print(f"Silver clean complete. Table written: {silver_table_name}")