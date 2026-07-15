from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def health() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "finsight-ml",
        "version": "0.1.0",
    }
