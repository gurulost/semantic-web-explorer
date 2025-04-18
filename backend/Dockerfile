
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Pre-download GloVe embeddings during build
RUN python -c "import gensim.downloader as api; api.load('glove-wiki-gigaword-100')"

COPY . .

EXPOSE 8000

# Use multiple workers in production
ENV WORKERS=2
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8000 --workers ${WORKERS}"]
