# AI Guardrail Configuration

This document explains the configurable AI guardrail model used by the FinSight ML / AI platform foundation.

## Enterprise Rule

The system generates reviewable proposals only. Engineers must review generated code, documentation, and architecture plans before they are committed.

## Supported Capabilities

- Configurable guardrails
- Codebase-aware analysis
- Reuse-first feature planning
- Documentation proposal generation
- Human-in-the-loop review

## Safety Defaults

- Human review required
- File write-back disabled
- Protected paths excluded
- Secrets and credentials blocked from generated prompts and documentation
- Existing project conventions reused before introducing new patterns
