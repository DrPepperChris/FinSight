# Databricks notebook source
# MAGIC %md
# MAGIC # FinSight Gold Customer Account Analytics
# MAGIC
# MAGIC This notebook creates business-ready Gold tables from cleaned Silver data.
# MAGIC
# MAGIC Outputs:
# MAGIC - Customer account summary
# MAGIC - Transaction risk summary
# MAGIC - Portfolio summary

# COMMAND ----------

from pyspark.sql.functions import (
    abs as spark_abs,
    col,
    count,
    current_timestamp,
    max as spark_max,
    sum as spark_sum,
    when
)

silver_schema = "finsight_silver"
gold_schema = "finsight_gold"

spark.sql(f"CREATE SCHEMA IF NOT EXISTS {gold_schema}")

# COMMAND ----------

customers = spark.table(f"{silver_schema}.customers_clean")
accounts = spark.table(f"{silver_schema}.accounts_clean")
transactions = spark.table(f"{silver_schema}.transactions_clean")
loans = spark.table(f"{silver_schema}.loan_applications_clean")

# COMMAND ----------

transaction_rollup = (
    transactions
    .groupBy("customer_id")
    .agg(
        count("*").alias("total_transaction_count"),
        spark_sum(when(col("transaction_type") == "Deposit", col("amount")).otherwise(0)).alias("total_deposits"),
        spark_sum(when(col("transaction_type") == "Withdrawal", col("amount")).otherwise(0)).alias("total_withdrawals"),
        spark_sum(spark_abs(col("amount"))).alias("total_transaction_volume"),
        spark_sum(when(col("is_high_value") == True, 1).otherwise(0)).alias("high_value_transaction_count"),
        spark_sum(when(col("is_flagged") == True, 1).otherwise(0)).alias("flagged_transaction_count"),
        spark_max("transaction_timestamp").alias("latest_transaction_timestamp")
    )
)

account_rollup = (
    accounts
    .groupBy("customer_id")
    .agg(
        count("*").alias("total_accounts"),
        spark_sum("current_balance").alias("total_balance")
    )
)

# COMMAND ----------

customer_account_summary = (
    customers.alias("c")
    .join(account_rollup.alias("a"), "customer_id", "left")
    .join(transaction_rollup.alias("t"), "customer_id", "left")
    .select(
        col("customer_id"),
        col("customer_number"),
        col("full_name"),
        col("risk_rating"),
        col("a.total_accounts"),
        col("a.total_balance"),
        col("t.total_deposits"),
        col("t.total_withdrawals"),
        col("t.total_transaction_count"),
        col("t.latest_transaction_timestamp")
    )
    .fillna({
        "total_accounts": 0,
        "total_balance": 0,
        "total_deposits": 0,
        "total_withdrawals": 0,
        "total_transaction_count": 0
    })
    .withColumn("_created_at_utc", current_timestamp())
)

(
    customer_account_summary.write
    .format("delta")
    .mode("overwrite")
    .option("overwriteSchema", "true")
    .saveAsTable(f"{gold_schema}.customer_account_summary")
)

# COMMAND ----------

transaction_risk_summary = (
    customers.alias("c")
    .join(transaction_rollup.alias("t"), "customer_id", "left")
    .select(
        col("customer_id"),
        col("customer_number"),
        col("full_name"),
        col("risk_rating"),
        col("t.total_transaction_count"),
        col("t.high_value_transaction_count"),
        col("t.flagged_transaction_count"),
        col("t.total_transaction_volume")
    )
    .fillna({
        "total_transaction_count": 0,
        "high_value_transaction_count": 0,
        "flagged_transaction_count": 0,
        "total_transaction_volume": 0
    })
    .withColumn(
        "risk_signal",
        when(col("flagged_transaction_count") >= 2, "High")
        .when(col("high_value_transaction_count") >= 2, "Elevated")
        .when(col("high_value_transaction_count") == 1, "Review")
        .otherwise("Normal")
    )
    .withColumn("_created_at_utc", current_timestamp())
)

(
    transaction_risk_summary.write
    .format("delta")
    .mode("overwrite")
    .option("overwriteSchema", "true")
    .saveAsTable(f"{gold_schema}.transaction_risk_summary")
)

# COMMAND ----------

portfolio_summary = (
    loans
    .groupBy("status")
    .agg(count("*").alias("loan_count"))
    .withColumn("_created_at_utc", current_timestamp())
)

(
    portfolio_summary.write
    .format("delta")
    .mode("overwrite")
    .option("overwriteSchema", "true")
    .saveAsTable(f"{gold_schema}.portfolio_summary")
)

# COMMAND ----------

display(spark.table(f"{gold_schema}.customer_account_summary"))
display(spark.table(f"{gold_schema}.transaction_risk_summary"))
display(spark.table(f"{gold_schema}.portfolio_summary"))