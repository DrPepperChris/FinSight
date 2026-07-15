FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN useradd --create-home --shell /usr/sbin/nologin finsight

COPY pyproject.toml .
RUN pip install --no-cache-dir .

COPY app ./app

USER finsight

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
