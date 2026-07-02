# Databricks notebook source
# MAGIC %md
# MAGIC # FinSight Silver Clean and Standardize
# MAGIC
# MAGIC This notebook transforms raw Bronze tables into cleaned Silver Delta tables.
# MAGIC
# MAGIC Silver processing includes:
# MAGIC - Type casting
# MAGIC - Timestamp parsing
# MAGIC - Status normalization
# MAGIC - Deduplication
# MAGIC - Processing timestamps

# COMMAND ----------

from pyspark.sql.functions import (
    col,
    current_timestamp,
    initcap,
    lower,
    to_timestamp,
    trim,
    upper,
    when
)

bronze_schema = "finsight_bronze"
silver_schema = "finsight_silver"

spark.sql(f"CREATE SCHEMA IF NOT EXISTS {silver_schema}")

# COMMAND ----------

customers = spark.table(f"{bronze_schema}.customers_raw")

customers_clean = (
    customers
    .select(
        col("customer_id").cast("int").alias("customer_id"),
        trim(col("customer_number")).alias("customer_number"),
        trim(col("full_name")).alias("full_name"),
        lower(trim(col("email"))).alias("email"),
        initcap(trim(col("risk_rating"))).alias("risk_rating")
    )
    .dropDuplicates(["customer_id"])
    .withColumn("_processed_at_utc", current_timestamp())
)

(
    customers_clean.write
    .format("delta")
    .mode("overwrite")
    .option("overwriteSchema", "true")
    .saveAsTable(f"{silver_schema}.customers_clean")
)

# COMMAND ----------

accounts = spark.table(f"{bronze_schema}.accounts_raw")

accounts_clean = (
    accounts
    .select(
        col("account_id").cast("int").alias("account_id"),
        col("customer_id").cast("int").alias("customer_id"),
        trim(col("account_number")).alias("account_number"),
        initcap(trim(col("account_type"))).alias("account_type"),
        col("current_balance").cast("decimal(18,2)").alias("current_balance"),
        initcap(trim(col("status"))).alias("status")
    )
    .dropDuplicates(["account_id"])
    .withColumn("_processed_at_utc", current_timestamp())
)

(
    accounts_clean.write
    .format("delta")
    .mode("overwrite")
    .option("overwriteSchema", "true")
    .saveAsTable(f"{silver_schema}.accounts_clean")
)

# COMMAND ----------

transactions = spark.table(f"{bronze_schema}.transactions_raw")

transactions_clean = (
    transactions
    .select(
        trim(col("transaction_id")).alias("transaction_id"),
        col("account_id").cast("int").alias("account_id"),
        col("customer_id").cast("int").alias("customer_id"),
        initcap(trim(col("transaction_type"))).alias("transaction_type"),
        col("amount").cast("decimal(18,2)").alias("amount"),
        upper(trim(col("currency"))).alias("currency"),
        initcap(trim(col("merchant_category"))).alias("merchant_category"),
        to_timestamp(col("transaction_timestamp")).alias("transaction_timestamp"),
        initcap(trim(col("channel"))).alias("channel"),
        initcap(trim(col("status"))).alias("status")
    )
    .dropDuplicates(["transaction_id"])
    .withColumn(
        "is_high_value",
        when(col("amount") >= 5000, True).otherwise(False)
    )
    .withColumn(
        "is_flagged",
        when(col("status") == "Flagged", True).otherwise(False)
    )
    .withColumn("_processed_at_utc", current_timestamp())
)

(
    transactions_clean.write
    .format("delta")
    .mode("overwrite")
    .option("overwriteSchema", "true")
    .saveAsTable(f"{silver_schema}.transactions_clean")
)

# COMMAND ----------

loan_applications = spark.table(f"{bronze_schema}.loan_applications_raw")

loan_applications_clean = (
    loan_applications
    .select(
        col("loan_application_id").cast("int").alias("loan_application_id"),
        col("customer_id").cast("int").alias("customer_id"),
        col("requested_amount").cast("decimal(18,2)").alias("requested_amount"),
        initcap(trim(col("loan_type"))).alias("loan_type"),
        initcap(trim(col("status"))).alias("status"),
        to_timestamp(col("submitted_timestamp")).alias("submitted_timestamp"),
        to_timestamp(col("decision_timestamp")).alias("decision_timestamp")
    )
    .dropDuplicates(["loan_application_id"])
    .withColumn("_processed_at_utc", current_timestamp())
)

(
    loan_applications_clean.write
    .format("delta")
    .mode("overwrite")
    .option("overwriteSchema", "true")
    .saveAsTable(f"{silver_schema}.loan_applications_clean")
)

# COMMAND ----------

display(spark.sql(f"SHOW TABLES IN {silver_schema}"))