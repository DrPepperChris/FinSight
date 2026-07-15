# FinSight AI Agent Pipeline

## Purpose

The FinSight AI Agent pipeline demonstrates how an enterprise AI assistant can safely accept employee uploads, scan them, process them through ETL layers, and generate reviewable recommendations.

## Pipeline Layers

### Bronze

Raw upload intake. Files are stored only after demo scan checks pass.

### Silver

Cleaned and normalized knowledge. Text extraction, classification, chunking, and metadata generation belong here.

### Gold

Approved company knowledge. Coding standards, documentation formats, architecture decisions, and reusable patterns must be reviewed before promotion to Gold.

## Demo Scan Controls

The demo scanner currently checks:

- Allowed file extensions
- File size limit
- Empty files
- Secret-like text patterns
- Protected upload handling

## Azure Production Direction

Future Azure deployment should use:

- Azure Blob Storage for uploaded files
- Azure SQL for upload metadata and audit records
- Azure AI Search for searchable company knowledge
- Azure OpenAI or Azure AI Foundry for agent responses
- Microsoft Defender for Storage or equivalent malware scanning
- Application Insights for monitoring
