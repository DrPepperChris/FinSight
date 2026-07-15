# FinSight ML / AI Platform Foundation

## Purpose

This feature adds an enterprise-style ML and AI service boundary to FinSight.

It demonstrates:

- Transaction risk scoring
- AI-assisted operational insight generation
- Secure API contracts
- Separation of API, Core, ML, and Infrastructure concerns
- Human-in-the-loop guardrails
- Model versioning placeholder
- Future path for ML.NET, Azure AI, Databricks Model Serving, or an enterprise LLM gateway

## Current Implementation

The transaction risk service currently uses deterministic rule-based scoring.

The AI insight service currently returns controlled enterprise-style recommendations and guardrails.

No external AI provider is called yet.

## Why This Matters

This is intentionally designed like an enterprise application feature:

- API owns the external contract.
- Core owns DTOs and interfaces.
- ML or Core service owns scoring logic.
- Infrastructure or Core service owns AI-assisted insight generation.
- Human review is required before account-impacting or financial decisions.

## Future Enhancements

- Replace rule-based scoring with ML.NET inference.
- Serve models from Azure ML or Databricks Model Serving.
- Add prompt templates and approved enterprise guardrails.
- Add audit logging for every AI-assisted recommendation.
- Add model monitoring and drift checks.
- Add automated regression tests for AI and ML outputs.
