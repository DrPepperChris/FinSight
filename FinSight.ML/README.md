# FinSight ML Platform

FinSight ML is the Python service responsible for the machine-learning and MLOps lifecycle.

## Planned capabilities

- Secure PDF, CSV, JSON, and text ingestion
- Malware scanning and quarantine workflows
- Data validation and profiling
- Feature engineering
- Feature-store integration
- Model training with Scikit-learn, PyTorch, and TensorFlow
- Experiment tracking with MLflow
- Model evaluation and registration
- REST-based model serving
- Drift, latency, and model-health monitoring

## Current phase

Platform foundation and secure ingestion architecture.

## Local development

python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -e ".[dev]"
uvicorn app.main:app --reload

Health endpoint:

http://localhost:8000/health
