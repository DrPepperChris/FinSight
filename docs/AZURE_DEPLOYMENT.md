# FinSight Azure Deployment Plan

This document outlines the Azure hosting plan for the FinSight full-stack banking demo application.

## Target Azure Architecture

```text
React frontend   -> Azure Static Web Apps
ASP.NET Core API -> Azure App Service
Database         -> Azure SQL Database
Analytics        -> Azure Databricks later