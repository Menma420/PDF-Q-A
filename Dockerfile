FROM python:3.10-slim

WORKDIR /app

# Install build essentials and git (needed for faiss and transformers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install pip + CPU-only PyTorch
RUN pip install --upgrade pip && \
    pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    echo "✅ Installed PyTorch CPU"

# Add requirements & install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    echo "✅ Installed Python deps" && \
    apt-get purge -y gcc && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Copy rest of the app
COPY . .

EXPOSE 8000

CMD ["uvicorn", "AI_Assistant:app", "--host", "0.0.0.0", "--port", "8000"]
