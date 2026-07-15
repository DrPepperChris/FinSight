from fastapi import FastAPI

from app.api.health import router as health_router

app = FastAPI(
    title="FinSight ML Platform",
    version="0.1.0",
    description=(
        "Secure data ingestion, feature engineering, model training, "
        "evaluation, registry integration, and model-serving service."
    ),
)

app.include_router(
    health_router,
    prefix="/health",
    tags=["Health"],
)
