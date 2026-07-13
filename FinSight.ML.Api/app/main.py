from fastapi import FastAPI

app = FastAPI(
    title="FinSight ML Platform API",
    version="0.1.0",
    description=(
        "Machine-learning ingestion, feature engineering, "
        "training, evaluation, and model-serving service."
    ),
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "finsight-ml-api",
    }