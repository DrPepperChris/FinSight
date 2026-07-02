# Databricks notebook source
# MAGIC %md
# MAGIC # FinSight Bronze Ingest
# MAGIC
# MAGIC This notebook ingests raw FinSight operational extracts into Bronze Delta tables.
# MAGIC
# MAGIC Sources:
# MAGIC - Customers
# MAGIC - Accounts
# MAGIC - Transactions
# MAGIC - Loan Applications

# COMMAND ----------

from pyspark.sql.functions import current_timestamp, input_file_name

# In a real Databricks workspace, these files could be uploaded to DBFS, ADLS, or mounted storage.
# For this portfolio demo, the paths are written as expected landing locations.
base_path = "/FileStore/finsight/sample-data"

bronze_schema = "finsight_bronze"

spark.sql(f"CREATE SCHEMA IF NOT EXISTS {bronze_schema}")

# COMMAND ----------

def ingest_csv_to_bronze(file_name: str, table_name: str):
    source_path = f"{base_path}/{file_name}"

    df = (
        spark.read
        .option("header", "true")
        .option("inferSchema", "false")
        .csv(source_path)
        .withColumn("_source_file", input_file_name())
        .withColumn("_ingested_at_utc", current_timestamp())
    )

    (
        df.write
        .format("delta")
        .mode("overwrite")
        .option("overwriteSchema", "true")
        .saveAsTable(f"{bronze_schema}.{table_name}")
    )

    print(f"Ingested {file_name} into {bronze_schema}.{table_name}")

# COMMAND ----------

ingest_csv_to_bronze("customers_sample.csv", "customers_raw")
ingest_csv_to_bronze("accounts_sample.csv", "accounts_raw")
ingest_csv_to_bronze("transactions_sample.csv", "transactions_raw")
ingest_csv_to_bronze("loan_applications_sample.csv", "loan_applications_raw")

# COMMAND ----------

display(spark.sql(f"SHOW TABLES IN {bronze_schema}"))