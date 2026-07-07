# Databricks notebook source
# ============================================================
# FinSight - Bronze Transactions Ingest
# Purpose:
#   Ingest raw transaction data into the Bronze Delta table.
#
# Output:
#   finsight_bronze.transactions_raw
# ============================================================

from pyspark.sql.functions import current_timestamp, input_file_name

# COMMAND ----------

spark.sql("CREATE DATABASE IF NOT EXISTS finsight_bronze")

# COMMAND ----------

# For local Databricks demo:
# Upload transactions_sample.csv to DBFS:
# /FileStore/finsight/sample-data/transactions_sample.csv

source_path = "/FileStore/finsight/sample-data/transactions_sample.csv"

bronze_df = (
    spark.read
        .option("header", "true")
        .option("inferSchema", "false")
        .csv(source_path)
        .withColumn("ingestion_timestamp", current_timestamp())
        .withColumn("source_file", input_file_name())
)

# COMMAND ----------

(
    bronze_df.write
        .format("delta")
        .mode("overwrite")
        .option("overwriteSchema", "true")
        .saveAsTable("finsight_bronze.transactions_raw")
)

# COMMAND ----------

display(spark.table("finsight_bronze.transactions_raw"))