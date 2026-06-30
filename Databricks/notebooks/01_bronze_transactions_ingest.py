# Databricks notebook source
# ============================================================
# FinSight - Bronze Transactions Ingest
# Purpose:
#   Ingest raw transaction data into the Bronze layer.
#
# Layer:
#   Bronze = raw, minimally transformed source data
#
# Source:
#   Databricks/sample-data/transactions_sample.csv
#
# Notes:
#   This notebook is written in Databricks-style PySpark.
#   It can be adapted to read from Azure Data Lake Storage later.
# ============================================================

from pyspark.sql.functions import current_timestamp, input_file_name

# COMMAND ----------

# In a real Azure Databricks workspace, this path could be replaced with:
# abfss://raw@<storage-account>.dfs.core.windows.net/finsight/transactions/
source_path = "/FileStore/finsight/sample-data/transactions_sample.csv"

bronze_table_name = "finsight_bronze.transactions_raw"

# COMMAND ----------

transactions_raw_df = (
    spark.read
    .option("header", "true")
    .option("inferSchema", "true")
    .csv(source_path)
)

# COMMAND ----------

transactions_bronze_df = (
    transactions_raw_df
    .withColumn("ingested_at", current_timestamp())
    .withColumn("source_file", input_file_name())
)

# COMMAND ----------

spark.sql("CREATE DATABASE IF NOT EXISTS finsight_bronze")

transactions_bronze_df.write.mode("overwrite").format("delta").saveAsTable(
    bronze_table_name
)

# COMMAND ----------

display(transactions_bronze_df)

# COMMAND ----------

print(f"Bronze ingest complete. Table written: {bronze_table_name}")