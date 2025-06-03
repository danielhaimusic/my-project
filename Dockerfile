# Dockerfile for fullstack app (FastAPI backend + React frontend)

# --- Build frontend ---
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend /app/frontend
RUN npm install && npm run build

# --- Build backend ---
FROM python:3.11-slim AS backend-build
WORKDIR /app
COPY backend /app/backend
COPY --from=frontend-build /app/frontend/dist /app/backend/static
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# --- Final image ---
FROM python:3.11-slim
WORKDIR /app
COPY --from=backend-build /app/backend /app/backend
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
EXPOSE 8000
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
